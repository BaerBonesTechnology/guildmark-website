import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/firestore/checkout_repo.dart';
import 'package:guildmark_api/services/checkout_service.dart';
import 'package:guildmark_api/services/square_service.dart';

/// Staff reconcile uncertain payments using the provider's authoritative result.
Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  if (!auth.isStaffAdministrator) {
    return forbidden('Staff administrator required');
  }
  final service = context.read<FirebaseService?>();
  final square = context.read<SquareService?>();
  if (service == null || square == null) {
    return jsonError(
      503,
      'UNAVAILABLE',
      'Checkout services are not configured',
    );
  }
  try {
    final body = await context.request.json();
    if (body is! Map ||
        body['payment_id'] is! String ||
        !RegExp(
          r'^[a-zA-Z0-9_-]{1,192}$',
        ).hasMatch(body['payment_id'] as String)) {
      return badRequest('payment_id is required');
    }
    final order = await service.tablesDB.getRow(
      databaseId: '',
      tableId: 'orders',
      rowId: id,
    );
    final payment = await square.getPayment(body['payment_id'] as String);
    final result = await CheckoutService(
      CheckoutRepo(service),
      square,
    ).applyPayment(order, payment);
    return Response.json(
      body: {
        'id': result.$id,
        'status': result.data['status'],
        'reservation_state': result.data['reservation_state'],
      },
    );
  } catch (_) {
    return jsonError(
      503,
      'RECONCILIATION_PENDING',
      'Payment could not be verified. Inventory remains held.',
    );
  }
}
