import 'dart:convert';
import 'dart:io';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/firebase/local_fixtures.dart';
import 'package:guildmark_api/repos/firestore/checkout_repo.dart';
import 'package:guildmark_api/repos/firestore/listing_repo.dart';
import 'package:test/test.dart';

void main() {
  final authHost = Platform.environment['FIREBASE_AUTH_EMULATOR_HOST'];
  final dbHost = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  test(
    'reseeding preserves identities, passkeys, permissions and checkout stock',
    () async {
      const project = 'demo-guildmark';
      final auth = FirebaseAuth(projectId: project, host: authHost!);
      final store = FirebaseService(projectId: project, emulatorHost: dbHost);
      final fixtures = LocalFixtures(auth, store);
      final sessions = FirebaseSessions(auth, store);
      try {
        // An earlier fixture used a different email. Never rebind its employee
        // record (and associated passkeys) to the new staff identity.
        await store.tablesDB.createRow(
          databaseId: '',
          tableId: 'guildmark_employees',
          rowId: 'local-staff',
          data: {
            'email': 'staff@guildmark.test',
            'firebase_uid': 'older-local-identity',
            'role': 'admin',
            'is_active': false,
            'local_fixture': true,
          },
        );
        await fixtures.seed();
        final buyer = await auth.signIn(
          LocalFixtures.buyerEmail,
          LocalFixtures.password,
        );
        final staff = await auth.signIn(
          LocalFixtures.staffEmail,
          LocalFixtures.password,
        );
        expect(
          jsonDecode(
            (await auth.user(staff['localId'] as String))!['customAttributes']
                as String,
          ),
          LocalFixtures.staffClaims,
        );
        expect(
          (await sessions.identity(
            staff['localId'] as String,
            'staff',
          ))!.data['role'],
          'admin',
        );
        final token = await sessions.issue(buyer, 'customer');
        final principal = (await sessions.principal(token))!;
        expect(principal.companyId, LocalFixtures.buyerCompany);
        expect(principal.isStaffAdministrator, false);
        expect(
          await sessions.identity(buyer['localId'] as String, 'staff'),
          isNull,
        );
        expect(
          await sessions.identity(staff['localId'] as String, 'customer'),
          isNull,
        );
        final setup = await sessions.issue(staff, 'staff_setup');
        expect((await sessions.principal(setup))!.audience, 'staff_setup');
        final listing = (await ListingRepo(
          store,
        ).findActiveById(LocalFixtures.laptopListing))!;
        expect(listing.listedPrice, 100);
        expect(listing.quantity, 25);
        final reserved = await CheckoutRepo(store).reserve(
          listingId: LocalFixtures.laptopListing,
          buyer: principal.companyId,
          key: 'local-fixture-checkout-123',
          quantity: 1,
          sourceId: 'fake-local-source',
          sellerFee: .14,
          buyerFee: .028,
          expectedTotalCents: 10280,
        );
        await store.tablesDB.createRow(
          databaseId: '',
          tableId: 'employee_passkeys',
          rowId: 'test-passkey',
          data: {
            'employee_id': LocalFixtures.staffEmployeeId,
            'credential_id': 'fixture-passkey',
          },
        );
        await auth.call('accounts:update', {
          'idToken': buyer['idToken'],
          'password': 'Changed-local-password-123!',
        });
        await store.tablesDB.updateRow(
          databaseId: '',
          tableId: 'guildmark_employees',
          rowId: LocalFixtures.staffEmployeeId,
          data: {'is_active': false},
        );
        await auth.call('accounts:update', {
          'localId': staff['localId'],
          'customAttributes': jsonEncode({
            'role': 'staff',
            'staff_permissions': ['support'],
          }),
        }, admin: true);
        await fixtures.seed();
        expect(
          (jsonDecode(
                (await auth.user(
                      staff['localId'] as String,
                    ))!['customAttributes']
                    as String,
              )
              as Map<String, dynamic>)['staff_permissions'],
          ['support'],
        );
        expect(
          await sessions.identity(staff['localId'] as String, 'staff'),
          isNull,
        );
        final again = await auth.signIn(
          LocalFixtures.buyerEmail,
          'Changed-local-password-123!',
        );
        expect(again['localId'], buyer['localId']);
        expect(
          (await sessions.row(
            'assets',
            'local-laptop-asset',
          ))!.data['reserved_quantity'],
          1,
        );
        expect(
          (await sessions.row('orders', reserved.$id))!.data['status'],
          'payment_pending',
        );
        expect(
          await sessions.row('employee_passkeys', 'test-passkey'),
          isNotNull,
        );
        expect(
          (await sessions.row(
            'guildmark_employees',
            LocalFixtures.staffEmployeeId,
          ))!.data['is_active'],
          false,
        );
        expect(
          (await store.tablesDB.listRows(
            databaseId: '',
            tableId: 'users',
            queries: [Query.equal('local_fixture', true)],
          )).rows,
          hasLength(2),
        );
        expect(
          (await store.tablesDB.listRows(
            databaseId: '',
            tableId: 'guildmark_employees',
          )).rows,
          hasLength(2),
        );
        expect(
          (await sessions.row(
            'guildmark_employees',
            'local-staff',
          ))!.data['firebase_uid'],
          'older-local-identity',
        );
      } finally {
        auth.close();
        store.close();
      }
    },
    skip:
        authHost == null ||
            dbHost == null ||
            Platform.environment['LOCAL_FIXTURE_TESTS'] != 'true'
        ? 'Requires isolated Auth/Firestore and LOCAL_FIXTURE_TESTS=true'
        : false,
  );
}
