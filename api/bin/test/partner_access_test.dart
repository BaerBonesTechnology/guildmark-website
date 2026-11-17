import 'dart:convert';
import 'dart:io';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:http/http.dart' as http;
import 'package:test/test.dart';
import '../routes/admin/partner-accounts/[id]/index.dart' as access;
import '../routes/admin/partner-accounts/index.dart' as accounts;

void main() {
  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  group(
    'partner access transaction',
    () {
      late FirebaseService db;
      setUp(() async {
        db = FirebaseService(
          projectId: 'demo-partner-access-${ID.unique()}',
          emulatorHost: host,
        );
        await db.tablesDB.createRow(
          databaseId: '',
          tableId: 'guildmark_employees',
          rowId: 'actor',
          data: {'role': 'superadmin', 'is_active': true},
        );
        await db.tablesDB.createRow(
          databaseId: '',
          tableId: 'partners',
          rowId: 'partner',
          data: {'status': 'pending'},
        );
      });
      tearDown(() => db.close());
      test('list includes legacy profiles without creation metadata', () async {
        final removed = await http.patch(
          Uri.parse(
            'http://$host/v1/${db.parent}/partners/partner?updateMask.fieldPaths=_createdAt',
          ),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'fields': <String, dynamic>{}}),
        );
        expect(removed.statusCode, 200);
        final handler = accounts.onRequest
            .use(
              provider<AuthPrincipal?>(
                (_) => AuthPrincipal(
                  userId: 'actor',
                  companyId: 'devdash',
                  role: 'superadmin',
                  audience: 'staff',
                ),
              ),
            )
            .use(provider<FirebaseService?>((_) => db));
        final server = await serve(handler, InternetAddress.loopbackIPv4, 0);
        try {
          final response = await http.get(
            Uri.parse('http://127.0.0.1:${server.port}/admin/partner-accounts'),
          );
          expect(response.statusCode, 200);
          final body = jsonDecode(response.body) as Map<String, dynamic>;
          expect((body['partners'] as List).single['id'], 'partner');
          expect(body['total'], 1);
        } finally {
          await server.close(force: true);
        }
      });
      Future<int> change({
        String role = 'superadmin',
        String audience = 'staff',
        Map<String, dynamic> body = const {'status': 'active'},
      }) async {
        final handler = ((RequestContext c) => access.onRequest(c, 'partner'))
            .use(
              provider<AuthPrincipal?>(
                (_) => AuthPrincipal(
                  userId: 'actor',
                  companyId: 'devdash',
                  role: role,
                  audience: audience,
                ),
              ),
            )
            .use(provider<FirebaseService?>((_) => db));
        final server = await serve(handler, InternetAddress.loopbackIPv4, 0);
        try {
          return (await http.patch(
            Uri.parse(
              'http://127.0.0.1:${server.port}/admin/partner-accounts/partner',
            ),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          )).statusCode;
        } finally {
          await server.close(force: true);
        }
      }

      test(
        'approval and suspension are audited once; replay is harmless',
        () async {
          expect(await change(), 200);
          expect(await change(), 200);
          expect(await change(body: {'status': 'suspended'}), 200);
          final partner = await db.tablesDB.getRow(
            databaseId: '',
            tableId: 'partners',
            rowId: 'partner',
          );
          final events = await db.tablesDB.listRows(
            databaseId: '',
            tableId: 'partner_access_audit',
          );
          expect(partner.data['status'], 'suspended');
          expect(events.rows.length, 2);
          expect(
            events.rows.every((e) => e.data['actor_id'] == 'actor'),
            isTrue,
          );
        },
      );
      test('customer, setup, compliance and support cannot approve', () async {
        for (final audience in ['customer', 'staff_setup']) {
          expect(await change(audience: audience), 403);
        }
        for (final role in ['support', 'compliance']) {
          expect(await change(role: role), 403);
        }
      });
      test(
        'current database authority overrides stale session claims',
        () async {
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'guildmark_employees',
            rowId: 'actor',
            data: {'role': 'support'},
          );
          expect(await change(), 403);
          final partner = await db.tablesDB.getRow(
            databaseId: '',
            tableId: 'partners',
            rowId: 'partner',
          );
          expect(partner.data['status'], 'pending');
        },
      );
      test(
        'unexpected fields cannot alter financial or identity data',
        () async {
          expect(
            await change(
              body: {'status': 'active', 'available_balance_cents': 10000},
            ),
            400,
          );
          expect(await change(body: {'status': 'unknown'}), 400);
        },
      );
    },
    skip: host == null ? 'Requires Firestore emulator' : false,
  );
}
