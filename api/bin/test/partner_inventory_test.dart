import 'dart:io';
import 'package:test/test.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/partner_inventory.dart';

void main() {
  final rows = [
    {
      'model_name': 'ThinkPad T14',
      'asset_type': 'laptop',
      'condition_grade': 'A',
      'quantity': '20',
      'listed_price': '350.00',
      'data_wipe_status': 'wiped',
      'wipe_reference': 'Batch QA-1',
      'reimage_required': 'true',
    },
  ];
  test(
    'already-wiped stock becomes imaging-only without claiming certified erasure',
    () {
      expect(
        PartnerInventory.validate(rows).single['service_requirement'],
        'reimage_only',
      );
      expect(
        () => PartnerInventory.validate([
          {...rows.single, 'wipe_reference': ''},
        ]),
        throwsA(isA<InventoryFailure>()),
      );
      expect(
        () => PartnerInventory.validate([
          {...rows.single, 'data_wipe_status': 'certified'},
        ]),
        throwsA(isA<InventoryFailure>()),
      );
      expect(
        PartnerInventory.validate([
          {
            ...rows.single,
            'data_wipe_status': 'not_wiped',
            'wipe_reference': '',
          },
        ]).single['service_requirement'],
        'wipe_and_reimage',
      );
    },
  );
  group(
    'owner approval and delegation',
    () {
      late FirebaseService db;
      late PartnerInventory service;
      setUp(() async {
        db = FirebaseService(
          projectId: 'demo-bulk-${ID.unique()}',
          emulatorHost: Platform.environment['FIRESTORE_EMULATOR_HOST'],
        );
        service = PartnerInventory(db);
        for (final r in [
          (
            'partners',
            'partner',
            {'status': 'active', 'company_name': 'ITAD Partner'},
          ),
          (
            'users',
            'owner',
            {
              'company_id': 'owner-company',
              'email': 'owner@example.test',
              'role': 'admin',
            },
          ),
          (
            'users',
            'other',
            {
              'company_id': 'other-company',
              'email': 'other@example.test',
              'role': 'admin',
            },
          ),
        ]) {
          await db.tablesDB.createRow(
            databaseId: '',
            tableId: r.$1,
            rowId: r.$2,
            data: r.$3,
          );
        }
      });
      tearDown(() => db.close());
      Future<Map<String, dynamic>> submit(
        String id, {
        String mode = 'consigned',
      }) => service.submit('partner', {
        'id': id,
        'ownership': mode,
        'owner_email': 'owner@example.test',
        'rows': rows,
      });
      test(
        'unapproved batches never create listings; wrong company cannot approve',
        () async {
          final batch = await submit('batch-one');
          expect(batch['status'], 'pending');
          expect(
            (await db.tablesDB.listRows(
              databaseId: '',
              tableId: 'listings',
            )).rows,
            isEmpty,
          );
          await expectLater(
            service.apply('batch-one', 'other-company', 'other'),
            throwsA(isA<InventoryFailure>()),
          );
        },
      );
      test(
        'owner approval creates only private drafts with wipe provenance and stable IDs',
        () async {
          await submit('batch-one', mode: 'own');
          await service.apply('batch-one', 'owner-company', 'owner');
          await service.apply('batch-one', 'owner-company', 'owner');
          final listings = (await db.tablesDB.listRows(
            databaseId: '',
            tableId: 'listings',
          )).rows;
          expect(listings.length, 1);
          expect(listings.single.data['company_id'], 'owner-company');
          expect(listings.single.data['status'], 'draft');
          expect(listings.single.data['service_requirement'], 'reimage_only');
          final asset = await db.tablesDB.getRow(
            databaseId: '',
            tableId: 'assets',
            rowId: 'batch-one-asset-0',
          );
          expect(asset.data['wipe_reported_by_partner'], 'partner');
          expect(asset.data['quantity'], 20);
        },
      );
      test(
        'explicit delegation permits future drafts and revocation returns imports to pending',
        () async {
          await submit('batch-one');
          await service.apply(
            'batch-one',
            'owner-company',
            'owner',
            allowFuture: true,
          );
          expect((await submit('batch-two'))['status'], 'applied');
          final grant = PartnerInventory.delegationId(
            'partner',
            'owner-company',
            'consigned',
          );
          await service.revoke(
            grant,
            AuthPrincipal(
              userId: 'owner',
              companyId: 'owner-company',
              role: 'admin',
            ),
          );
          expect((await submit('batch-three'))['status'], 'pending');
        },
      );
      test(
        'revoked owner role cannot approve even with stale authenticated claims',
        () async {
          await submit('batch-one');
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'users',
            rowId: 'owner',
            data: {'role': 'member'},
          );
          await expectLater(
            service.apply('batch-one', 'owner-company', 'owner'),
            throwsA(isA<InventoryFailure>()),
          );
        },
      );
      test('declined import produces no stock and no grant', () async {
        await submit('batch-one');
        expect(
          (await service.apply(
            'batch-one',
            'owner-company',
            'owner',
            reject: true,
          ))['status'],
          'rejected',
        );
        expect(
          (await db.tablesDB.listRows(databaseId: '', tableId: 'assets')).rows,
          isEmpty,
        );
      });
    },
    skip: Platform.environment['FIRESTORE_EMULATOR_HOST'] == null,
  );
}
