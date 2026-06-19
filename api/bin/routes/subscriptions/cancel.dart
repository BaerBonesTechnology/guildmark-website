import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/subscription_repo.dart';
import 'package:guildmark_api/services/square_service.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final db = context.read<Db>();
  final square = context.read<SquareService?>();
  final repo = SubscriptionRepo(db);

  final currentSub = await repo.findByCompany(auth.companyId);
  if (currentSub == null) return notFound('Subscription record not found');

  if (!currentSub.isActive) {
    return badRequest('Subscription is already cancelled or past due');
  }

  // Cancel the Square subscription if one exists, so Square stops billing.
  // We intentionally log and swallow Square errors so the user can always
  // cancel even if the Square API is temporarily unavailable.
  if (square != null && currentSub.squareSubscriptionId != null) {
    try {
      await square.cancelSubscription(currentSub.squareSubscriptionId!);
    } catch (e) {
      stderr.writeln('[cancel] Square cancelSubscription error (ignored): $e');
    }
  }

  // Mark as cancelled in our DB regardless of the Square result.
  await repo.cancel(auth.companyId);

  return Response.json(
    body: {'status': 'cancelled'},
  );
}
