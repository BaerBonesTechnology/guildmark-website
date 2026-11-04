import 'dart:convert';
import 'dart:io';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/business_verification.dart';
import 'package:guildmark_api/repos/firestore/user_repo.dart';
import 'package:guildmark_api/repos/firestore/listing_repo.dart';
import 'package:guildmark_api/repos/firestore/checkout_repo.dart';
import 'package:guildmark_api/repos/firestore/offer_repo.dart';
import 'package:guildmark_api/repos/firestore/order_repo.dart';
import 'package:http/http.dart' as http;
import 'package:test/test.dart';
import '../routes/admin/business-verifications/index.dart' as admin;
import '../routes/business-badge/index.dart' as badge;

final details = <String, dynamic>{
  'legal_name': 'Example Test Business LLC',
  'registration_country': 'United States / Florida',
  'registration_number': 'TEST-REGISTRY-001',
  'website': 'https://example.com',
  'representative_role': 'Owner',
};
Map<String, dynamic> decision(int revision, [String status = 'approved']) => {
  'decision': status,
  'revision': revision,
  'reason': 'Test review decision.',
  'registry_checked': true,
  'authority_checked': true,
  'internal_evidence': 'Synthetic test evidence; no real business verified.',
};

void main() {
  test('only staff super admins and compliance can review', () {
    for (final audience in ['customer', 'staff_setup', 'staff', 'partner']) {
      for (final role in [
        'admin',
        'superadmin',
        'compliance',
        'support',
        'engineer',
      ]) {
        expect(
          BusinessVerification.canReview(audience, role),
          audience == 'staff' && {'superadmin', 'compliance'}.contains(role),
        );
      }
    }
  });
  test('applicant fields cannot supply approval or arbitrary metadata', () {
    final parsed = BusinessVerification.details({
      ...details,
      'status': 'approved',
      'reviewed_by': 'attacker',
    });
    expect(parsed.keys, unorderedEquals(details.keys));
    for (final url in [
      'javascript:alert(1)',
      'http://example.com',
      'https://user:secret@example.com',
    ]) {
      expect(
        () => BusinessVerification.details({...details, 'website': url}),
        throwsFormatException,
      );
    }
    expect(
      () => BusinessVerification.details({
        ...details,
        'registration_number': ' ',
      }),
      throwsFormatException,
    );
  });

  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  group(
    'optional badge workflow on local Firestore',
    () {
      late FirebaseService store;
      late BusinessVerification service;
      late String company, user, email;
      setUp(() {
        store = FirebaseService(
          projectId: 'demo-guildmark',
          emulatorHost: host,
        );
        service = BusinessVerification(store.tablesDB);
        company = ID.unique();
        user = ID.unique();
        email = '$user@example.com';
      });
      tearDown(() => store.close());
      Future<void> confirmed() async {
        final code = await service.issueCode(user, email);
        expect(await service.confirmCode(user, email, code), true);
      }

      Future<void> pending() async {
        await confirmed();
        await service.submit(company, user, email, details);
      }

      Future<Row> put(String table, String id, Map<String, dynamic> data) =>
          store.tablesDB.createRow(
            databaseId: '',
            tableId: table,
            rowId: id,
            data: data,
          );
      Future<void> approveSeller() async {
        await pending();
        await service.review(company, 'test-reviewer', decision(1));
      }

      test(
        'draft inventory remains available but every unapproved state blocks publication',
        () async {
          final asset = ID.unique();
          await put('assets', asset, {
            'company_id': company,
            'model_name': 'Synthetic laptop',
            'asset_type': 'laptop',
            'quantity': 2,
          });
          final repo = ListingRepo(store);
          final draft = await repo.create(
            companyId: company,
            assetId: asset,
            listedPrice: 100,
          );
          expect(draft.status, 'draft');
          await expectLater(
            repo.publish(id: draft.id, companyId: company),
            throwsA(isA<SellerVerificationRequired>()),
          );
          await pending();
          await expectLater(
            repo.publish(id: draft.id, companyId: company),
            throwsA(isA<SellerVerificationRequired>()),
          );
          await service.review(company, 'test-reviewer', decision(1));
          expect(
            (await repo.publish(id: draft.id, companyId: company)).status,
            'active',
          );
        },
      );

      test(
        'preexisting unverified listings cannot reserve inventory or start payment; buyer need not verify',
        () async {
          final asset = ID.unique(),
              listing = ID.unique(),
              buyer = ID.unique(),
              key = ID.unique();
          await put('assets', asset, {'company_id': company, 'quantity': 2});
          await put('listings', listing, {
            'company_id': company,
            'asset_id': asset,
            'status': 'active',
            'listed_price_cents': 10000,
          });
          Future<Row> reserve(String nonce) => CheckoutRepo(store).reserve(
            listingId: listing,
            buyer: buyer,
            key: nonce,
            quantity: 1,
            sourceId: 'synthetic-nonce',
            sellerFee: 0,
            buyerFee: 0,
          );
          await expectLater(
            reserve(key),
            throwsA(isA<SellerVerificationRequired>()),
          );
          final untouched = await store.tablesDB.getRow(
            databaseId: '',
            tableId: 'assets',
            rowId: asset,
          );
          expect(untouched.data['reserved_quantity'], isNull);
          await approveSeller();
          final reserved = await reserve(key);
          expect(reserved.data['buyer_company_id'], buyer);
          // A previously started payment can still be reconciled using its same
          // idempotency key, even if eligibility later changes. No new sale starts.
          await store.tablesDB.updateRow(
            databaseId: '',
            tableId: BusinessVerification.table,
            rowId: company,
            data: {'status': 'rejected'},
          );
          expect((await reserve(key)).$id, reserved.$id);
          await expectLater(
            reserve(ID.unique()),
            throwsA(isA<SellerVerificationRequired>()),
          );
        },
      );

      test(
        'unapproved seller cannot receive new offers, accept or counter, but may reject',
        () async {
          final asset = ID.unique(), listing = ID.unique(), offer = ID.unique();
          await put('assets', asset, {'company_id': company, 'quantity': 2});
          await put('listings', listing, {
            'company_id': company,
            'asset_id': asset,
            'status': 'active',
            'listed_price_cents': 10000,
          });
          await put('buyer_offers', offer, {
            'listing_id': listing,
            'buyer_company_id': ID.unique(),
            'status': 'pending',
            'quantity': 1,
            'offer_price_cents': 10000,
            'expires_at': DateTime.now()
                .toUtc()
                .add(const Duration(days: 1))
                .toIso8601String(),
          });
          final repo = OfferRepo(store);
          await expectLater(
            repo.create(
              listingId: listing,
              buyerCompanyId: ID.unique(),
              offerPrice: 100,
              quantity: 1,
            ),
            throwsA(isA<SellerVerificationRequired>()),
          );
          for (final action in ['accept', 'counter']) {
            await expectLater(
              repo.respond(
                offerId: offer,
                sellerCompanyId: company,
                action: action,
                counterPrice: 100,
              ),
              throwsA(isA<SellerVerificationRequired>()),
            );
          }
          expect(
            (await repo.respond(
              offerId: offer,
              sellerCompanyId: company,
              action: 'reject',
            )).status,
            'rejected',
          );
        },
      );

      test(
        'accepted legacy offer cannot create an order for an unverified seller',
        () async {
          await expectLater(
            OrderRepo(store).create(
              offerId: ID.unique(),
              callerCompanyId: company,
              sellerFeePct: 0,
              buyerFeePct: 0,
            ),
            throwsA(isA<SellerVerificationRequired>()),
          );
        },
      );

      test(
        'unverified customers still register with an active account and no badge',
        () async {
          final record = await UserRepo(store).create(
            email: email,
            passwordHash: 'test-only',
            fullName: 'Test Owner',
            companyName: 'Test business',
            companySize: '1',
            industry: 'test',
          );
          expect(record.subscriptionStatus, 'active');
          expect(record.businessVerificationStatus, 'unsubmitted');
          expect(
            (await UserRepo(
              store,
            ).findByEmail(email))!.businessVerificationStatus,
            'unsubmitted',
          );
        },
      );
      test(
        'email codes are hashed, throttled, tied to email and consumed',
        () async {
          final code = await service.issueCode(user, email);
          final challenge = await service.emailRecord(user);
          expect(challenge!.data['code_hash'], isNot(code));
          expect(jsonEncode(challenge.data), isNot(contains(code)));
          await expectLater(
            service.issueCode(user, email),
            throwsFormatException,
          );
          expect(
            await service.confirmCode(user, 'other@example.com', code),
            false,
          );
          expect(await service.confirmCode(user, email, code), true);
          expect(await service.confirmCode(user, email, code), false);
        },
      );
      test('five wrong attempts exhaust a code', () async {
        final code = await service.issueCode(user, email);
        for (var attempt = 0; attempt < 5; attempt++) {
          expect(await service.confirmCode(user, email, '00000000'), false);
        }
        expect(await service.confirmCode(user, email, code), false);
      });
      test('expired code cannot verify email', () async {
        final code = await service.issueCode(user, email);
        await store.tablesDB.updateRow(
          databaseId: '',
          tableId: BusinessVerification.challenges,
          rowId: user,
          data: {'expires_at': '2000-01-01T00:00:00Z'},
        );
        expect(await service.confirmCode(user, email, code), false);
      });
      test(
        'unconfirmed emails cannot submit and client cannot self-approve',
        () async {
          await expectLater(
            service.submit(company, user, email, details),
            throwsFormatException,
          );
          await confirmed();
          await service.submit(company, user, email, {
            ...details,
            'status': 'approved',
          });
          expect(
            BusinessVerification.status(await service.record(company)),
            'pending',
          );
          await expectLater(
            service.submit(company, user, email, details),
            throwsFormatException,
          );
        },
      );
      test('approval requires reason, checks and recorded evidence', () async {
        await pending();
        for (final patch in [
          {'reason': ''},
          {'registry_checked': false},
          {'authority_checked': false},
          {'internal_evidence': ''},
        ]) {
          await expectLater(
            service.review(company, 'reviewer', {...decision(1), ...patch}),
            throwsFormatException,
          );
        }
        await expectLater(
          service.review(company, user, decision(1)),
          throwsFormatException,
        );
        await service.review(company, 'reviewer', decision(1));
        expect(
          BusinessVerification.status(await service.record(company)),
          'approved',
        );
        final applicant = await service.view(company, user);
        expect(applicant.containsKey('internal_evidence'), false);
        expect(applicant['reason'], 'Test review decision.');
      });
      test(
        'request information allows resubmission; denial stays denied',
        () async {
          await pending();
          await service.review(
            company,
            'reviewer',
            decision(1, 'needs_information'),
          );
          await service.submit(company, user, email, {
            ...details,
            'legal_name': 'Corrected Test LLC',
          });
          expect((await service.record(company))!.data['revision'], 3);
          await expectLater(
            service.review(company, 'reviewer', decision(1)),
            throwsFormatException,
          );
          await service.review(company, 'reviewer', decision(3, 'rejected'));
          await expectLater(
            service.submit(company, user, email, details),
            throwsFormatException,
          );
          final events = await store.tablesDB.listRows(
            databaseId: '',
            tableId: BusinessVerification.events,
            queries: [Query.equal('company_id', company)],
          );
          expect(events.rows.length, 4);
        },
      );
      test(
        'concurrent review decisions commit once with atomic audit record',
        () async {
          await pending();
          final outcomes = await Future.wait(
            ['reviewer-one', 'reviewer-two'].map((reviewer) async {
              try {
                await service.review(company, reviewer, decision(1));
                return true;
              } on FormatException {
                return false;
              }
            }),
          );
          expect(outcomes.where((value) => value).length, 1);
          final events = await store.tablesDB.listRows(
            databaseId: '',
            tableId: BusinessVerification.events,
            queries: [Query.equal('company_id', company)],
          );
          expect(events.rows.length, 2);
        },
      );
      test(
        'public badge reveals only approval, and pending never shows verified',
        () async {
          final handler = badge.onRequest.use(
            provider<FirebaseService?>((_) => store),
          );
          final server = await serve(handler, InternetAddress.loopbackIPv4, 0);
          try {
            final uri = Uri.parse(
              'http://127.0.0.1:${server.port}/business-badge?company_id=$company',
            );
            expect(jsonDecode((await http.get(uri)).body), {
              'verified_business': false,
            });
            await pending();
            expect(jsonDecode((await http.get(uri)).body), {
              'verified_business': false,
            });
            await service.review(company, 'reviewer', decision(1));
            expect(jsonDecode((await http.get(uri)).body), {
              'verified_business': true,
            });
          } finally {
            await server.close(force: true);
          }
        },
      );
      test(
        'admin API reloads actual active staff role, ignores session role claims',
        () async {
          final employee = ID.unique();
          await store.tablesDB.createRow(
            databaseId: '',
            tableId: 'guildmark_employees',
            rowId: employee,
            data: {
              'email': '$employee@example.com',
              'full_name': 'Test reviewer',
              'role': 'support',
              'is_active': true,
            },
          );
          final handler = admin.onRequest
              .use(
                provider<AuthPrincipal?>(
                  (_) => AuthPrincipal(
                    userId: employee,
                    companyId: 'devdash',
                    role: 'superadmin',
                    audience: 'staff',
                  ),
                ),
              )
              .use(provider<FirebaseService?>((_) => store));
          final server = await serve(handler, InternetAddress.loopbackIPv4, 0);
          final uri = Uri.parse(
            'http://127.0.0.1:${server.port}/admin/business-verifications',
          );
          try {
            expect((await http.get(uri)).statusCode, 403);
            await store.tablesDB.updateRow(
              databaseId: '',
              tableId: 'guildmark_employees',
              rowId: employee,
              data: {'role': 'compliance'},
            );
            expect((await http.get(uri)).statusCode, 200);
            await store.tablesDB.updateRow(
              databaseId: '',
              tableId: 'guildmark_employees',
              rowId: employee,
              data: {'is_active': false},
            );
            expect((await http.get(uri)).statusCode, 403);
          } finally {
            await server.close(force: true);
          }
        },
      );
    },
    skip: host == null ? 'Requires local FIRESTORE_EMULATOR_HOST' : false,
  );
}
