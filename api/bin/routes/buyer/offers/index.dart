import 'dart:async';
import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/lookups.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/offer_repo.dart';
import 'package:guildmark_api/services/email_service.dart';

Future<Response> onRequest(RequestContext context) async {
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  switch (context.request.method) {
    case HttpMethod.get:
      final offers = await OfferRepo(aw).findByBuyerCompany(auth.companyId);
      return Response.json(body: offers);

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
        final offer = await OfferRepo(aw).create(
          listingId: listingId,
          buyerCompanyId: auth.companyId,
          offerPrice: offerPrice,
          quantity: quantity,
          message: message,
        );

        // Notify seller (fire and forget). Was a 4-table JOIN — now stitched
        // lookups via lib/appwrite/lookups.dart.
        final emailService = context.read<EmailService>();
        unawaited(() async {
          try {
            final sellerCompanyId =
                await listingSellerCompanyId(aw, listingId);
            if (sellerCompanyId == null) return;
            final sellerEmail = await companyContactEmail(aw, sellerCompanyId);
            if (sellerEmail == null) return;
            final productName =
                await listingProductName(aw, listingId) ?? 'IT Asset';

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
