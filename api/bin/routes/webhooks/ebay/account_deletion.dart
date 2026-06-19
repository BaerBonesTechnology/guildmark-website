import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  final cfg = context.read<AppConfig>();

  final token = cfg.ebayVerificationToken;
  final endpoint = cfg.ebayDeletionEndpoint;

  // ── GET — challenge / endpoint verification ───────────────────────────────
  if (context.request.method == HttpMethod.get) {
    final challengeCode = context.request.uri.queryParameters['challenge_code'];

    if (challengeCode == null || challengeCode.isEmpty) {
      return jsonError(
        400,
        'MISSING_CHALLENGE',
        'challenge_code query param required',
      );
    }

    if (token == null || endpoint == null) {
      // Misconfigured — return 500 so eBay knows the endpoint isn't ready.
      return jsonError(
        500,
        'NOT_CONFIGURED',
        'EBAY_VERIFICATION_TOKEN and EBAY_DELETION_ENDPOINT must be set',
      );
    }

    // challengeResponse = lowercase hex SHA-256 of:
    //   challengeCode + verificationToken + endpointUrl   (no separators)
    final input = utf8.encode('$challengeCode$token$endpoint');
    final digest = sha256.convert(input);

    return Response.json(body: {'challengeResponse': digest.toString()});
  }

  // ── POST — account deletion notification ─────────────────────────────────
  if (context.request.method == HttpMethod.post) {
    // Read raw body for logging; eBay does not sign POST bodies in this flow
    // so we rely on the endpoint being secret (HTTPS + non-guessable path).
    final rawBody = await context.request.body();

    Map<String, dynamic> payload;
    try {
      payload = jsonDecode(rawBody) as Map<String, dynamic>;
    } catch (_) {
      return jsonError(400, 'INVALID_JSON', 'Could not parse request body');
    }

    // eBay notification structure:
    // {
    //   "metadata": { "topic": "MARKETPLACE_ACCOUNT_DELETION", ... },
    //   "notification": {
    //     "data": {
    //       "userId":    "<eBay user ID>",
    //       "username":  "<eBay username>"
    //     }
    //   }
    // }
    final notification = payload['notification'] as Map<String, dynamic>?;
    final data = notification?['data'] as Map<String, dynamic>?;
    final ebayUserId = data?['userId'] as String?;
    final ebayUsername = data?['username'] as String?;

    if (ebayUserId != null || ebayUsername != null) {
      final db = context.read<Db>();
      await _anonymiseEbayUser(
        db: db,
        ebayUserId: ebayUserId,
        ebayUsername: ebayUsername,
      );
    }

    // eBay expects a 200 response — any non-2xx triggers a retry.
    return Response(statusCode: 200);
  }

  return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST only');
}

// ---------------------------------------------------------------------------
// Anonymisation
// ---------------------------------------------------------------------------

Future<void> _anonymiseEbayUser({
  required Db db,
  String? ebayUserId,
  String? ebayUsername,
}) async {
  // Nullify ebay_seller_id on any listing that references this account.
  // The column is nullable — we set it to NULL rather than deleting the
  // listing so the seller's own GuildMark record is preserved.
  if (ebayUserId != null) {
    await db.query(
      '''
      UPDATE listings
      SET ebay_seller_id = NULL
      WHERE ebay_seller_id = @uid
      ''',
      parameters: {'uid': ebayUserId},
    );
  }

  // If we ever cache eBay sold-listings data for valuation, wipe it here.
  // Example placeholder — extend as the schema grows:
  // await db.query(
  //   'DELETE FROM ebay_valuation_cache WHERE ebay_user_id = @uid',
  //   parameters: {'uid': ebayUserId},
  // );
}
