import 'dart:async';
import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/offer_repo.dart';
import 'package:guildmark_api/services/email_service.dart';

Future<Response> onRequest(RequestContext context) async {
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  switch (context.request.method) {
    case HttpMethod.get:
      final offers = await OfferRepo(
        context.read<Db>(),
      ).findByBuyerCompany(auth.companyId);
      return Response.json(body: offers.map((o) => o.toJson()).toList());

    case HttpMethod.post:
      final body = await context.request.json() as Map<String, dynamic>?;
      final listingId = body?['listing_id'] as String?;
      final offerPrice = (body?['offer_price'] as num?)?.toDouble();
      final quantity = body?['quantity'] as int?;
      final message = body?['message'] as String?;

      if (listingId == null || offerPrice == null || quantity == null) {
        return badRequest('listing_id, offer_price, quantity required');
      }

      try {
        final db = context.read<Db>();
        final offer = await OfferRepo(db).create(
          listingId: listingId,
          buyerCompanyId: auth.companyId,
          offerPrice: offerPrice,
          quantity: quantity,
          message: message,
        );

        // Notify seller (fire and forget)
        unawaited(() async {
          try {
            final rows = await db.query(
              '''
              SELECT u.email AS seller_email, a.model_name AS product_name
              FROM listings l
              JOIN companies c ON c.id = l.company_id
              JOIN users u ON u.company_id = c.id
              JOIN assets a ON a.id = l.asset_id
              WHERE l.id = @lid
              ORDER BY u.role = 'admin' DESC, u.created_at
              LIMIT 1
              ''',
              parameters: {'lid': listingId},
            );
            if (rows.isEmpty) return;
            final row = rows.first.toColumnMap();
            final sellerEmail = row['seller_email'] as String?;
            final productName = row['product_name'] as String? ?? 'IT Asset';
            if (sellerEmail == null) return;

            final emailService = context.read<EmailService>();
            await emailService.sendOfferReceived(
              toEmail: sellerEmail,
              productName: productName,
              offerPrice: offerPrice,
              listingUrl:
                  'https://app.guildmark.co/marketplace/$listingId', // Could be updated to seller's listing details URL
            );
          } catch (e) {
            stderr.writeln('[offer] Failed to send seller notification: $e');
          }
        }());

        return Response.json(statusCode: 201, body: offer.toJson());
      } on StateError catch (e) {
        return badRequest(e.message);
      } on ArgumentError catch (e) {
        return badRequest(e.message?.toString() ?? 'Invalid request');
      }

    default:
      return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST');
  }
}
