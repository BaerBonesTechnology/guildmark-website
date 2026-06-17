import '../db/pool.dart';
import '../models/platform_config.dart';

class ConfigRepo {
  ConfigRepo(this._db);
  final Db _db;

  Future<PlatformConfig> get() async {
    final rows = await _db.query('SELECT * FROM platform_config WHERE id = 1');
    if (rows.isEmpty)
      throw StateError('platform_config row missing — run migration 0009');
    return PlatformConfig.fromRow(rows.first.toColumnMap());
  }

  Future<PlatformConfig> update({
    required double sellerFeeFree,
    required double sellerFeeStarter,
    required double sellerFeeGrowth,
    required double sellerFeePro,
    required double buyerFee,
    required double deferralFee,
    required double dataWipePrice,
    String? updatedBy,
  }) async {
    print(
      'Updating platform_config with sellerFeeFree=$sellerFeeFree, sellerFeeStarter=$sellerFeeStarter, sellerFeeGrowth=$sellerFeeGrowth, sellerFeePro=$sellerFeePro, buyerFee=$buyerFee, deferralFee=$deferralFee, dataWipePrice=$dataWipePrice, updatedBy=$updatedBy',
    );

    final rows = await _db.query(
      '''
      UPDATE platform_config SET
        seller_fee_free     = @sellerFeeFree,
        seller_fee_starter  = @sellerFeeStarter,
        seller_fee_growth   = @sellerFeeGrowth,
        seller_fee_pro      = @sellerFeePro,
        buyer_fee           = @buyerFee,
        deferral_fee        = @deferralFee,
        data_wipe_price     = @dataWipePrice,
        updated_at          = now(),
        updated_by          = @updatedBy
      WHERE id = 1
      RETURNING *
      ''',
      parameters: {
        'sellerFeeFree': sellerFeeFree,
        'sellerFeeStarter': sellerFeeStarter,
        'sellerFeeGrowth': sellerFeeGrowth,
        'sellerFeePro': sellerFeePro,
        'buyerFee': buyerFee,
        'deferralFee': deferralFee,
        'dataWipePrice': dataWipePrice,
        'updatedBy': updatedBy,
      },
    );

    print('Updated platform_config: ${rows.first.toColumnMap()}');
    return PlatformConfig.fromRow(rows.first.toColumnMap());
  }
}
