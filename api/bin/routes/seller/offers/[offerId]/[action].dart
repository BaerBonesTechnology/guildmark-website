import 'dart:async';
import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart' show AppwriteException;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/appwrite/lookups.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/offer_repo.dart';
import 'package:guildmark_api/services/email_service.dart';

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

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  try {
    final offer = await OfferRepo(aw).respond(
      offerId: offerId,
      sellerCompanyId: auth.companyId,
      action: action,
      counterPrice: counterPrice,
    );

    // Fire-and-forget: notify the buyer of the offer status change.
    final email = context.read<EmailService>();
    unawaited(
      _notifyBuyer(
        aw: aw,
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
  required AppwriteService aw,
  required EmailService email,
  required String offerId,
  required String action,
  double? counterPrice,
}) async {
  try {
    // Was a 5-table JOIN — now stitched: offer → buyer company contact,
    // offer → listing → asset model name.
    final offerRow = await aw.tablesDB.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.buyerOffers,
      rowId: offerId,
    );
    final buyerEmail = await companyContactEmail(
      aw,
      offerRow.data['buyer_company_id'] as String,
    );
    if (buyerEmail == null) return;
    final productName = await listingProductName(
          aw,
          offerRow.data['listing_id'] as String,
        ) ??
        'IT Asset';

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
  } on AppwriteException catch (e) {
    if (e.code != 404) {
      stderr.writeln('[offer] Failed to send buyer notification: $e');
    }
  } catch (e) {
    // Best-effort — email failure must never affect the response.
    stderr.writeln('[offer] Failed to send buyer notification: $e');
  }
}
