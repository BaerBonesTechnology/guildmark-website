/// Appwrite implementation of ConfigRepo (see ../../../POSTGRES_TO_APPWRITE.md).
///
/// The public interface is IDENTICAL to the Postgres ConfigRepo so the routes
/// that consume it don't change; only the constructor dependency
/// (AppwriteService instead of Db) and the bodies differ.
///
/// platform_config is a singleton: one row whose `$id` is
/// [Aw.platformConfigRowId], seeded by tool/appwrite_setup.dart (the PG
/// equivalent was `WHERE id = 1`, seeded by migration 0009).
///
/// Money convention: `data_wipe_price` (dollars, NUMERIC) is stored as
/// `data_wipe_price_cents` (integer); the PlatformConfig model keeps dollars.
library;

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/models/platform_config.dart';

class ConfigRepo {
  ConfigRepo(this._aw);
  final AppwriteService _aw;

  TablesDB get _db => _aw.tablesDB;

  Future<PlatformConfig> get() async {
    final Row row;
    try {
      row = await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: Aw.platformConfig,
        rowId: Aw.platformConfigRowId,
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) {
        throw StateError('platform_config row missing — run appwrite_setup');
      }
      rethrow;
    }
    return _toModel(row);
  }

  Future<PlatformConfig> update({
    required double sellerFeeFree,
    required double sellerFeeStarter,
    required double sellerFeeGrowth,
    required double sellerFeePro,
    required double buyerFee,
    required double deferralFee,
    required double dataWipePrice,
    required bool paymentTermsEnabled,
    String? updatedBy,
  }) async {
    final Row row;
    try {
      row = await _db.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.platformConfig,
        rowId: Aw.platformConfigRowId,
        data: {
          'seller_fee_free': sellerFeeFree,
          'seller_fee_starter': sellerFeeStarter,
          'seller_fee_growth': sellerFeeGrowth,
          'seller_fee_pro': sellerFeePro,
          'buyer_fee': buyerFee,
          'deferral_fee': deferralFee,
          // dollars → integer cents at the boundary
          'data_wipe_price_cents': (dataWipePrice * 100).round(),
          'payment_terms_enabled': paymentTermsEnabled,
          'updated_by': updatedBy,
        },
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) {
        throw StateError('platform_config row missing — run appwrite_setup');
      }
      rethrow;
    }
    return _toModel(row);
  }

  /// Build the shared PlatformConfig model (lib/models/platform_config.dart)
  /// from an Appwrite row: cents → dollars for dataWipePrice, `$updatedAt`
  /// for updatedAt.
  PlatformConfig _toModel(Row row) {
    final d = row.data;
    double f(String key) => (d[key] as num?)?.toDouble() ?? 0.0;
    return PlatformConfig(
      sellerFeeFree: f('seller_fee_free'),
      sellerFeeStarter: f('seller_fee_starter'),
      sellerFeeGrowth: f('seller_fee_growth'),
      sellerFeePro: f('seller_fee_pro'),
      buyerFee: f('buyer_fee'),
      deferralFee: f('deferral_fee'),
      dataWipePrice: ((d['data_wipe_price_cents'] as num?) ?? 0) / 100.0,
      paymentTermsEnabled: d['payment_terms_enabled'] as bool? ?? false,
      updatedAt: DateTime.parse(row.$updatedAt).toUtc().toIso8601String(),
      updatedBy: d['updated_by'] as String?,
    );
  }
}
