import 'dart:async';
import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import '../../../../lib/context.dart';
import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';
import '../../../../lib/repos/offer_repo.dart';
import '../../../../lib/services/email_service.dart';

const _allowedActions = {'accept', 'reject', 'counter'};

Future<Response> onRequest(
  RequestContext context,
  String offerId,
  String action,
) async {
  if (context.request.method != HttpMethod.patch) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'PATCH only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  if (!_allowedActions.contains(action)) {
    return badRequest('Action must be one of: ${_allowedActions.join(', ')}');
  }

  double? counterPrice;
  if (action == 'counter') {
    final body = await context.request.json() as Map<String, dynamic>?;
    counterPrice = (body?['counter_price'] as num?)?.toDouble();
    if (counterPrice == null) {
      return badRequest('counter_price required for counter action');
    }
  }

  try {
    final offer = await OfferRepo(context.read<Db>()).respond(
      offerId: offerId,
      sellerCompanyId: auth.companyId,
      action: action,
      counterPrice: counterPrice,
    );

    // Fire-and-forget: notify the buyer of the offer status change.
    final email = context.read<EmailService>();
    final db = context.read<Db>();
    // Look up buyer email + product name via a JOIN — the BuyerOffer model
    // doesn't carry these fields to avoid regenerating Freezed artifacts.
    unawaited(
      _notifyBuyer(
        db: db,
        email: email,
        offerId: offerId,
        action: action,
        counterPrice: counterPrice,
      ),
    );

    return Response.json(body: offer.toJson());
  } on StateError catch (e) {
    return notFound(e.message);
  } on ArgumentError catch (e) {
    return badRequest(e.message?.toString() ?? 'Invalid request');
  }
}

Future<void> _notifyBuyer({
  required Db db,
  required EmailService email,
  required String offerId,
  required String action,
  double? counterPrice,
}) async {
  try {
    final rows = await db.query(
      '''
      SELECT u.email AS buyer_email, a.model_name AS product_name
      FROM buyer_offers bo
      JOIN companies bc ON bc.id = bo.buyer_company_id
      JOIN users u ON u.company_id = bc.id
      JOIN listings l ON l.id = bo.listing_id
      JOIN assets a ON a.id = l.asset_id
      WHERE bo.id = @oid
      ORDER BY u.role = 'admin' DESC, u.created_at
      LIMIT 1
      ''',
      parameters: {'oid': offerId},
    );
    if (rows.isEmpty) return;
    final row = rows.first.toColumnMap();
    final buyerEmail = row['buyer_email'] as String?;
    final productName = row['product_name'] as String? ?? 'IT Asset';
    if (buyerEmail == null) return;

    await email.sendOfferStatus(
      toEmail: buyerEmail,
      productName: productName,
      status: action == 'accept'
          ? 'accepted'
          : action == 'reject'
          ? 'rejected'
          : 'countered',
      counterPrice: counterPrice,
      offersUrl: 'https://app.guildmark.co/orders',
    );
  } catch (e) {
    // Best-effort — email failure must never affect the response.
    stderr.writeln('[offer] Failed to send buyer notification: $e');
  }
}
