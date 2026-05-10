/// GET|PUT /admin/config
///
/// Returns or replaces the platform-wide fee configuration.
/// Requires an admin JWT (role = 'admin').
library;

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/config_repo.dart';

Future<Response> onRequest(RequestContext context) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  final repo = ConfigRepo(context.read<Db>());

  switch (context.request.method) {
    case HttpMethod.get:
      final cfg = await repo.get();
      return Response.json(body: cfg.toJson());
    case HttpMethod.put:
      final body = await context.request.json() as Map<String, dynamic>?;
      if (body == null) return badRequest('Request body required');

      // Parse a fee value that may arrive as num or String from the client.
      double? parse(String key) {
        final v = body[key];
        if (v == null) return null;
        if (v is num) return v.toDouble();
        return double.tryParse(v.toString());
      }

      // Validate all required fields are present.
      final required = [
        'seller_fee_free', 'seller_fee_starter', 'seller_fee_growth',
        'seller_fee_pro', 'buyer_fee', 'deferral_fee', 'data_wipe_price',
      ];
      for (final k in required) {
        if (body[k] == null) return badRequest('Missing field: $k');
      }

      final sellerFeeFree    = parse('seller_fee_free')!;
      final sellerFeeStarter = parse('seller_fee_starter')!;
      final sellerFeeGrowth  = parse('seller_fee_growth')!;
      final sellerFeePro     = parse('seller_fee_pro')!;
      final buyerFee         = parse('buyer_fee')!;
      final deferralFee      = parse('deferral_fee')!;
      final dataWipePrice    = parse('data_wipe_price')!;

      // Guard against obviously wrong values.
      for (final v in [sellerFeeFree, sellerFeeStarter, sellerFeeGrowth, sellerFeePro, buyerFee, deferralFee]) {
        if (v < 0 || v > 1) return badRequest('Fee rates must be between 0 and 1 (e.g. 0.08 for 8%)');
      }
      if (dataWipePrice < 0) return badRequest('data_wipe_price must be non-negative');

      final updatedBy = (body['updated_by'] as String?)?.trim();

      final updated = await repo.update(
        sellerFeeFree:    sellerFeeFree,
        sellerFeeStarter: sellerFeeStarter,
        sellerFeeGrowth:  sellerFeeGrowth,
        sellerFeePro:     sellerFeePro,
        buyerFee:         buyerFee,
        deferralFee:      deferralFee,
        dataWipePrice:    dataWipePrice,
        updatedBy:        updatedBy,
      );

      return Response.json(body: updated.toJson());
    default:
      return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or PUT only');
  }
}
