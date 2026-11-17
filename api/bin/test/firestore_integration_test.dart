import 'dart:io';

import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/repos/firestore/mailing_list_repo.dart';
import 'package:guildmark_api/repos/firestore/user_repo.dart';
import 'package:test/test.dart';

void main() {
  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  group(
    'Firestore emulator',
    () {
      late FirebaseService service;
      late TablesDB db;
      late String company;
      setUp(() {
        service = FirebaseService(
          projectId: 'demo-guildmark',
          emulatorHost: host,
        );
        db = service.tablesDB;
        company = ID.unique();
      });
      tearDown(() => service.close());

      test('document defaults, nulls, merge updates, and deletion', () async {
        final id = ID.unique();
        final row = await db.createRow(
          databaseId: '',
          tableId: 'assets',
          rowId: id,
          data: {
            'company_id': company,
            'model_name': 'Pilot Laptop',
            'asset_type': 'laptop',
          },
        );
        expect(row.data['quantity'], 1);
        expect(row.data['condition_grade'], 'B');
        expect(row.data.containsKey('purchase_date'), true);
        final updated = await db.updateRow(
          databaseId: '',
          tableId: 'assets',
          rowId: id,
          data: {'quantity': 2},
        );
        expect(updated.data['model_name'], 'Pilot Laptop');
        expect(updated.$createdAt, row.$createdAt);
        await db.deleteRow(databaseId: '', tableId: 'assets', rowId: id);
        await expectLater(
          db.getRow(databaseId: '', tableId: 'assets', rowId: id),
          throwsA(
            isA<DatastoreException>().having(
              (error) => error.code,
              'code',
              404,
            ),
          ),
        );
      });

      test('concurrent uniqueness prevents duplicate accounts', () async {
        Future<bool> insert() async {
          try {
            await db.createRow(
              databaseId: '',
              tableId: 'users',
              rowId: ID.unique(),
              data: {'email': '$company@example.com', 'company_id': company},
            );
            return true;
          } on DatastoreException catch (error) {
            expect(error.code, 409);
            return false;
          }
        }

        final outcomes = await Future.wait([insert(), insert()]);
        expect(outcomes.where((value) => value).length, 1);
      });

      test('unique values can change and be reused after deletion', () async {
        final id = ID.unique();
        final email = '$company@example.com';
        await db.createRow(
          databaseId: '',
          tableId: 'users',
          rowId: id,
          data: {'email': email},
        );
        await db.updateRow(
          databaseId: '',
          tableId: 'users',
          rowId: id,
          data: {'email': 'new-$email'},
        );
        final next = await db.createRow(
          databaseId: '',
          tableId: 'users',
          rowId: ID.unique(),
          data: {'email': email},
        );
        await db.deleteRow(databaseId: '', tableId: 'users', rowId: next.$id);
        await db.createRow(
          databaseId: '',
          tableId: 'users',
          rowId: ID.unique(),
          data: {'email': email},
        );
      });

      test('count ignores pagination and cursor yields next page', () async {
        for (var index = 0; index < 3; index++) {
          await db.createRow(
            databaseId: '',
            tableId: 'assets',
            rowId: ID.unique(),
            data: {
              'company_id': company,
              'model_name': 'Laptop $index',
              'quantity': index + 1,
            },
          );
        }
        final first = await db.listRows(
          databaseId: '',
          tableId: 'assets',
          queries: [
            Query.equal('company_id', company),
            Query.orderAsc(r'$createdAt'),
            Query.limit(1),
          ],
        );
        expect(first.total, 3);
        final next = await db.listRows(
          databaseId: '',
          tableId: 'assets',
          queries: [
            Query.equal('company_id', company),
            Query.orderAsc(r'$createdAt'),
            Query.cursorAfter(first.rows.single.$id),
            Query.limit(1),
          ],
        );
        expect(next.rows.single.$id, isNot(first.rows.single.$id));
        expect(next.total, 3);
      });

      test(
        'range filters preserve descending order and cursor pagination',
        () async {
          for (final quantity in [1, 3, 2]) {
            await db.createRow(
              databaseId: '',
              tableId: 'assets',
              rowId: ID.unique(),
              data: {'company_id': company, 'quantity': quantity},
            );
          }
          final queries = [
            Query.equal('company_id', company),
            Query.greaterThan('quantity', 0),
            Query.orderDesc('quantity'),
            Query.limit(1),
          ];
          final first = await db.listRows(
            databaseId: '',
            tableId: 'assets',
            queries: queries,
          );
          expect(first.rows.single.data['quantity'], 3);
          final second = await db.listRows(
            databaseId: '',
            tableId: 'assets',
            queries: [...queries, Query.cursorAfter(first.rows.single.$id)],
          );
          expect(second.rows.single.data['quantity'], 2);
          expect(second.total, 3);
        },
      );

      test(
        'nullable and inequality filters preserve refresh-token semantics',
        () async {
          await db.createRow(
            databaseId: '',
            tableId: 'refresh_tokens',
            rowId: ID.unique(),
            data: {
              'user_id': company,
              'token_hash': ID.unique(),
              'expires_at': '2099-01-01T00:00:00Z',
            },
          );
          final result = await db.listRows(
            databaseId: '',
            tableId: 'refresh_tokens',
            queries: [
              Query.equal('user_id', company),
              Query.isNull('revoked_at'),
              Query.greaterThan('expires_at', '2026-01-01T00:00:00Z'),
            ],
          );
          expect(result.rows.length, 1);
        },
      );

      test('waitlist repository idempotency and contact update', () async {
        final repo = MailingListRepo(service);
        final email = '$company@example.com';
        final entry = await repo.subscribe(email: email);
        expect(entry, isNotNull);
        expect(await repo.subscribe(email: email), isNull);
        final updated = await repo.markContacted(id: entry!.id);
        expect(updated!.contactedAt, isNotNull);
      });

      test(
        'substring search filters gram collisions before pagination',
        () async {
          for (final model in [
            'Laptop Pro',
            'Laptop Air',
            'Laptop Professional',
          ]) {
            await db.createRow(
              databaseId: '',
              tableId: 'assets',
              rowId: ID.unique(),
              data: {'company_id': company, 'model_name': model},
            );
          }
          final result = await db.listRows(
            databaseId: '',
            tableId: 'assets',
            queries: [
              Query.equal('company_id', company),
              Query.contains('model_name', 'laptop pro'),
              Query.orderDesc(r'$createdAt'),
              Query.limit(1),
            ],
          );
          expect(result.total, 2);
          expect(result.rows.length, 1);
          expect(result.rows.single.data['model_name'], 'Laptop Professional');
        },
      );

      test('IN joins larger than 30 values retain complete results', () async {
        final ids = List.generate(31, (_) => ID.unique());
        for (final id in ids) {
          await db.createRow(
            databaseId: '',
            tableId: 'assets',
            rowId: id,
            data: {'company_id': company},
          );
        }
        final result = await db.listRows(
          databaseId: '',
          tableId: 'assets',
          queries: [Query.equal(r'$id', ids), Query.limit(31)],
        );
        expect(result.total, 31);
        expect(result.rows.map((row) => row.$id).toSet(), ids.toSet());
      });

      test(
        'signup saga creates company, user, and free subscription',
        () async {
          final user = await UserRepo(service).create(
            email: '$company@example.com',
            passwordHash: 'test-only',
            fullName: 'Pilot Owner',
            companyName: 'Pilot',
            companySize: 'small',
            industry: 'IT',
          );
          expect(user.role, 'admin');
          final subscription = await db.listRows(
            databaseId: '',
            tableId: 'subscriptions',
            queries: [Query.equal('company_id', user.companyId)],
          );
          expect(subscription.rows.single.data['plan'], 'free');
        },
      );
    },
    skip: host == null
        ? 'Set FIRESTORE_EMULATOR_HOST to run integration tests'
        : false,
  );
}
