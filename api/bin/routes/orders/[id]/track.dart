/// GET /orders/:id/track
///
/// Returns live FedEx tracking data for an order that has a tracking number.
///
/// Auth: buyer or seller company only.
///
/// Response:
///   {
///     "tracking_number": "...",
///     "carrier": "fedex",
///     "status_code": "IT",
///     "status": "In Transit",
///     "estimated_delivery": "2026-05-12T00:00:00.000Z",  // nullable
///     "actual_delivery":    "2026-05-12T14:23:00.000Z",  // nullable
///     "events": [
///       {
///         "event_type":        "IT",
///         "event_description": "Departed FedEx facility",
///         "timestamp":         "2026-05-11T08:45:00.000Z",
///         "city":              "Memphis",
///         "state":             "TN",
///         "country":           "US"
///       },
///       ...
///     ]
///   }
///
/// 404 when the order is not found or not accessible.
/// 409 when the order has no tracking number yet.
/// 502 when FedEx is not configured or the API call failed — the frontend
///     should fall back to displaying the stored order status.

import 'package:dart_frog/dart_frog.dart';

import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';
import '../../../lib/repos/order_repo.dart';
import '../../../lib/services/fedex_service.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final order = await OrderRepo(context.read<Db>())
      .findById(id, viewerCompanyId: auth.companyId);

  if (order == null) return notFound('Order $id not found');

  if (order.sellerCompanyId != auth.companyId &&
      order.buyerCompanyId  != auth.companyId) {
    return forbidden('Not authorised to view this order');
  }

  final trackingNumber = order.trackingNumber;
  if (trackingNumber == null || trackingNumber.isEmpty) {
    return jsonError(
      409,
      'NO_TRACKING_NUMBER',
      'This order does not have a tracking number yet',
    );
  }

  final fedex  = context.read<FedexService>();
  final result = await fedex.track(trackingNumber);

  if (result == null) {
    return jsonError(
      502,
      'TRACKING_UNAVAILABLE',
      'FedEx tracking is not available right now',
    );
  }

  return Response.json(body: {
    'tracking_number':     result.trackingNumber,
    'carrier':             order.carrier ?? 'fedex',
    'status_code':         result.statusCode,
    'status':              result.status,
    'estimated_delivery':  result.estimatedDelivery?.toIso8601String(),
    'actual_delivery':     result.actualDelivery?.toIso8601String(),
    'events': result.events.map((e) => e.toJson()).toList(),
  });
}
