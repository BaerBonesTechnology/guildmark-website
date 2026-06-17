import 'package:dart_frog/dart_frog.dart';

import '../../lib/context.dart';
import '../../lib/http_helpers.dart';
import '../../lib/services/square_service.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();

  final body = await context.request.json() as Map<String, dynamic>?;
  final sourceId = body?['source_id'] as String?;
  final amountCents = body?['amount_cents'] as int?;

  if (sourceId == null || sourceId.isEmpty) {
    return badRequest('source_id is required');
  }
  // 50,000,000 cents = USD $500,000 — generous ceiling for hardware asset
  // transactions while catching runaway values from bugs or bad actors.
  const maxAmountCents = 50000000;
  if (amountCents == null || amountCents <= 0) {
    return badRequest('amount_cents must be a positive integer');
  }
  if (amountCents > maxAmountCents) {
    return badRequest('amount_cents exceeds maximum allowed value');
  }

  try {
    final result = await context.read<SquareService?>()!.createPayment(
      sourceId: sourceId,
      amountCents: amountCents,
      note: body?['note'] as String?,
      referenceId: body?['reference_id'] as String?,
    );
    return Response.json(body: result.toJson());
  } on SquareException catch (e) {
    return jsonError(502, 'PAYMENT_FAILED', e.detail);
  }
}
