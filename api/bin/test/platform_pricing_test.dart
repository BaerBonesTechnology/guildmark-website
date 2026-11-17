import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/firebase/schema.dart';
import 'package:guildmark_api/repos/firestore/checkout_repo.dart';
import 'package:guildmark_api/repos/firestore/config_repo.dart';
import 'package:mocktail/mocktail.dart';
import 'package:test/test.dart';

class MockFirebase extends Mock implements FirebaseService {}

class MockTables extends Mock implements TablesDB {}

void main() {
  test(
    'new configuration maps seller tiers and buyer fee into checkout',
    () async {
      final service = MockFirebase();
      final tables = MockTables();
      when(() => service.tablesDB).thenReturn(tables);
      when(
        () => tables.getRow(
          databaseId: any(named: 'databaseId'),
          tableId: any(named: 'tableId'),
          rowId: any(named: 'rowId'),
        ),
      ).thenAnswer(
        (_) async => Row(
          $id: 'config',
          $createdAt: '2026-10-30',
          $updatedAt: '2026-10-30',
          data: Map<String, dynamic>.from(
            collectionDefaults['platform_config']!,
          ),
        ),
      );
      final config = await ConfigRepo(service).get();
      expect(config.buyerFee, .028);
      const tierFees = {'free': .14, 'starter': .14, 'growth': .12, 'pro': .10};
      const tierCents = {
        'free': 1400,
        'starter': 1400,
        'growth': 1200,
        'pro': 1000,
      };
      for (final tier in tierFees.entries) {
        final fee = config.sellerFeeForPlan(tier.key);
        expect(fee, tier.value);
        final snapshot = CheckoutRepo.feeSnapshot(10001, fee, config.buyerFee);
        expect(snapshot['seller_fee_cents'], tierCents[tier.key]);
        expect(snapshot['buyer_fee_cents'], 280);
        expect(snapshot['platform_fee_cents'], tierCents[tier.key]! + 280);
        expect(snapshot['escrow_amount_cents'], 10001 - tierCents[tier.key]!);
      }
      expect(config.sellerFeeForPlan('unknown'), .14);
      expect(collectionDefaults['orders']!['seller_fee_pct'], .14);
      expect(collectionDefaults['orders']!['buyer_fee_pct'], .028);
    },
  );

  test('fee rounding uses integer cents on the order subtotal', () {
    final snapshot = CheckoutRepo.feeSnapshot(20002, .14, .028);
    expect(snapshot['seller_fee_cents'], 2800);
    expect(snapshot['buyer_fee_cents'], 560);
    expect(snapshot['platform_fee_cents'], 3360);
    expect(snapshot['escrow_amount_cents'], 17202);
    expect(
      (snapshot['amount_cents'] as int) + (snapshot['buyer_fee_cents'] as int),
      20562,
    );
    final fractional = CheckoutRepo.feeSnapshot(10101, .14, .028);
    expect(fractional['seller_fee_cents'], 1414);
    expect(fractional['buyer_fee_cents'], 283);
  });

  test(
    'persisted configuration overrides defaults without rewriting it',
    () async {
      final service = MockFirebase();
      final tables = MockTables();
      when(() => service.tablesDB).thenReturn(tables);
      when(
        () => tables.getRow(
          databaseId: any(named: 'databaseId'),
          tableId: any(named: 'tableId'),
          rowId: any(named: 'rowId'),
        ),
      ).thenAnswer(
        (_) async => Row(
          $id: 'config',
          $createdAt: '2026-10-30',
          $updatedAt: '2026-10-30',
          data: {
            ...collectionDefaults['platform_config']!,
            'seller_fee_free': .07,
            'buyer_fee': .025,
          },
        ),
      );
      final config = await ConfigRepo(service).get();
      expect(config.sellerFeeFree, .07);
      expect(config.buyerFee, .025);
      verifyNever(
        () => tables.updateRow(
          databaseId: any(named: 'databaseId'),
          tableId: any(named: 'tableId'),
          rowId: any(named: 'rowId'),
          data: any(named: 'data'),
        ),
      );
    },
  );
}
