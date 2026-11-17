import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/firestore/checkout_repo.dart';
import 'package:guildmark_api/repos/firestore/config_repo.dart';
import 'package:guildmark_api/repos/firestore/order_repo.dart';
import 'package:guildmark_api/repos/firestore/subscription_repo.dart';
import 'package:guildmark_api/services/checkout_service.dart';
import 'package:guildmark_api/services/square_service.dart';
import 'package:guildmark_api/services/business_verification.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  if (auth.audience != 'customer') {
    return forbidden('Customer authentication required');
  }
  final dynamic body;
  try {
    body = await context.request.json();
  } catch (_) {
    return badRequest('A JSON object is required');
  }
  if (body is! Map<String, dynamic>) {
    return badRequest('A JSON object is required');
  }
  final key = body['idempotency_key'];
  final quantity = body['quantity'];
  final source = body['source_id'];
  final expectedTotal = body['expected_total_cents'];
  if (key is! String || !RegExp(r'^[a-zA-Z0-9_-]{16,64}$').hasMatch(key)) {
    return badRequest('A valid idempotency_key is required');
  }
  if (quantity is! int || quantity <= 0 || quantity > 100000) {
    return badRequest(
      'quantity must be a positive integer within the checkout limit',
    );
  }
  if (expectedTotal is! int || expectedTotal <= 0) {
    return badRequest('expected_total_cents must be a positive integer');
  }
  if (source != null &&
      (source is! String || source.trim().isEmpty || source.length > 4096)) {
    return badRequest('Invalid payment source');
  }
  if ((body['payment_terms'] ?? 'immediate') != 'immediate') {
    return jsonError(
      403,
      'PAYMENT_TERMS_DISABLED',
      'Only immediate payment is available for the pilot',
    );
  }
  final service = context.read<FirebaseService?>();
  final square = context.read<SquareService?>();
  if (service == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  if (square == null) {
    return jsonError(
      503,
      'PAYMENTS_UNAVAILABLE',
      'Payments are not configured',
    );
  }
  final repo = CheckoutRepo(service);
  try {
    Row? existing;
    try {
      existing = await service.tablesDB.getRow(
        databaseId: '',
        tableId: 'orders',
        rowId: CheckoutRepo.orderId(auth.companyId, key),
      );
    } on DatastoreException catch (error) {
      if (error.code != 404) rethrow;
    }
    var sellerFee = 0.0;
    var buyerFee = 0.0;
    if (existing == null) {
      final listing = await service.tablesDB.getRow(
        databaseId: '',
        tableId: 'listings',
        rowId: id,
      );
      final config = await ConfigRepo(service).get();
      final subscription = await SubscriptionRepo(
        service,
      ).findByCompany(listing.data['company_id'] as String);
      sellerFee = config.sellerFeeForPlan(
        subscription?.isActive == true ? subscription!.plan : 'free',
      );
      buyerFee = config.buyerFee;
    }
    final intent = await repo.reserve(
      listingId: id,
      buyer: auth.companyId,
      key: key,
      quantity: quantity,
      sourceId: source as String?,
      sellerFee: sellerFee,
      buyerFee: buyerFee,
      expectedTotalCents: expectedTotal,
    );
    final result = await CheckoutService(repo, square).pay(intent, source);
    if (result.data['status'] == 'cancelled') {
      return jsonError(
        402,
        'PAYMENT_DECLINED',
        'Payment failed. Inventory was released; start a new checkout to try another card.',
      );
    }
    if (result.data['status'] == 'payment_pending') {
      return jsonError(
        409,
        'PAYMENT_PENDING',
        'Payment is not yet confirmed. Retry this checkout; do not start another payment.',
      );
    }
    return Response.json(
      statusCode: 201,
      body: Order.fromRow(
        result,
        viewerCompanyId: auth.companyId,
        productName: result.data['product_name'] as String?,
      ).toJson(),
    );
  } on SellerVerificationRequired {
    return jsonError(
      403,
      SellerVerificationRequired.code,
      SellerVerificationRequired.message,
    );
  } on CheckoutConflict catch (error) {
    return jsonError(error.status, error.code, error.message);
  } on DatastoreException catch (error) {
    if (error.code == 404) return notFound('Listing not found');
    return jsonError(
      503,
      'CHECKOUT_RETRY',
      'Checkout could not be confirmed. Retry using the same checkout key.',
    );
  } catch (_) {
    return jsonError(
      503,
      'CHECKOUT_RETRY',
      'Checkout could not be confirmed. Retry using the same checkout key.',
    );
  }
}
