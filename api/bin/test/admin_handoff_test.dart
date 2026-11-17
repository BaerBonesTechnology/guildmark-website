import 'dart:io';
import 'package:guildmark_api/auth/admin_handoff.dart';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:test/test.dart';

void main() {
  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  group(
    'verified staff handoff',
    () {
      late FirebaseService db;
      late AdminHandoff handoff;
      late DateTime clock;
      late String source;
      const state =
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const origin = 'https://guildmark-dev.web.app';
      setUp(() async {
        clock = DateTime.utc(2026, 11, 4, 18);
        db = FirebaseService(
          projectId: 'demo-handoff-${ID.unique()}',
          emulatorHost: host,
        );
        source = ID.unique();
        await db.tablesDB.createRow(
          databaseId: '',
          tableId: FirebaseSessions.collection,
          rowId: source,
          data: {
            'uid': 'staff-user',
            'kind': 'staff',
            'firebase_cookie': 'test-only-cookie',
            'expires_at': clock.add(const Duration(hours: 8)).toIso8601String(),
          },
        );
        handoff = AdminHandoff(db, (hash) async {
          try {
            final row = await db.tablesDB.getRow(
              databaseId: '',
              tableId: FirebaseSessions.collection,
              rowId: hash,
            );
            return DateTime.parse(
                  row.data['expires_at'] as String,
                ).isAfter(clock)
                ? row
                : null;
          } on DatastoreException {
            return null;
          }
        }, clock: () => clock);
      });
      tearDown(() => db.close());
      test(
        'one-time transfer preserves expiry, consumes source and stores only code hash',
        () async {
          final code = await handoff.issue(source, state, origin);
          final record = await db.tablesDB.getRow(
            databaseId: '',
            tableId: 'staff_auth_handoffs',
            rowId: FirebaseSessions.digest(code),
          );
          expect(record.data.containsValue(code), isFalse);
          final token = await handoff.redeem(code, state, origin);
          final session = await db.tablesDB.getRow(
            databaseId: '',
            tableId: FirebaseSessions.collection,
            rowId: FirebaseSessions.digest(token),
          );
          expect(session.data['kind'], 'staff');
          expect(
            session.data['expires_at'],
            clock.add(const Duration(hours: 8)).toIso8601String(),
          );
          final old = await db.tablesDB.getRow(
            databaseId: '',
            tableId: FirebaseSessions.collection,
            rowId: source,
          );
          expect(
            DateTime.parse(old.data['expires_at'] as String).isBefore(clock),
            isTrue,
          );
          await expectLater(
            handoff.redeem(code, state, origin),
            throwsA(isA<FirebaseAuthFailure>()),
          );
        },
      );
      test(
        'password/setup/customer sessions cannot become a privileged handoff',
        () async {
          for (final kind in [
            'staff_pending',
            'staff_setup',
            'customer',
            'partner',
          ]) {
            await db.tablesDB.updateRow(
              databaseId: '',
              tableId: FirebaseSessions.collection,
              rowId: source,
              data: {'kind': kind},
            );
            await expectLater(
              handoff.issue(source, state, origin),
              throwsA(isA<FirebaseAuthFailure>()),
            );
          }
        },
      );
      test(
        'wrong state and origin cannot consume a legitimate transfer',
        () async {
          final code = await handoff.issue(source, state, origin);
          await expectLater(
            handoff.redeem(code, 'wrong', origin),
            throwsA(isA<FirebaseAuthFailure>()),
          );
          await expectLater(
            handoff.redeem(code, state, 'https://attacker.test'),
            throwsA(isA<FirebaseAuthFailure>()),
          );
          expect(await handoff.redeem(code, state, origin), isNotEmpty);
        },
      );
      test('expired codes and revoked sessions are rejected', () async {
        final code = await handoff.issue(source, state, origin);
        clock = clock.add(const Duration(seconds: 91));
        await expectLater(
          handoff.redeem(code, state, origin),
          throwsA(isA<FirebaseAuthFailure>()),
        );
        final next = await handoff.issue(source, state, origin);
        await db.tablesDB.deleteRow(
          databaseId: '',
          tableId: FirebaseSessions.collection,
          rowId: source,
        );
        await expectLater(
          handoff.redeem(next, state, origin),
          throwsA(isA<FirebaseAuthFailure>()),
        );
      });
      test('concurrent redemption produces one staff session', () async {
        final code = await handoff.issue(source, state, origin);
        Future<bool> redeem() async {
          try {
            await handoff.redeem(code, state, origin);
            return true;
          } on FirebaseAuthFailure {
            return false;
          } on DatastoreException {
            return false;
          }
        }

        final results = await Future.wait([redeem(), redeem()]);
        expect(results.where((v) => v).length, 1);
        final sessions = await db.tablesDB.listRows(
          databaseId: '',
          tableId: FirebaseSessions.collection,
        );
        expect(sessions.rows.length, 2);
      });
    },
    skip: host == null ? 'Requires isolated Firestore emulator' : false,
  );
}
