/// POST /subscriptions/cancel
///
/// Cancels the calling company's active subscription. If a Square subscription
/// ID is on record, it is cancelled via the Square Subscriptions API first so
/// that Square stops billing automatically. Our DB row is then marked as
/// cancelled regardless of the Square API result (Square errors are logged but
/// do not block the cancellation from the user's perspective).

import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import '../../lib/context.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/subscription_repo.dart';
import '../../lib/services/square_service.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final db     = context.read<Db>();
  final square = context.read<SquareService?>();
  final repo   = SubscriptionRepo(db);

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