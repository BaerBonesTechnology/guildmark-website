/// PATCH /seller/listings/:id  — update listed price (re-evaluates flag vs FMV).

import 'package:dart_frog/dart_frog.dart';

import '../../../../lib/context.dart';
import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';
import '../../../../lib/repos/listing_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.patch) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'PATCH only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final body = await context.request.json() as Map<String, dynamic>?;
  if (body == null) return badRequest('Request body required');

  final priceRaw = body['listed_price'];
  if (priceRaw == null) return badRequest('listed_price required');

  final listedPrice = priceRaw is num
      ? priceRaw.toDouble()
      : double.tryParse(priceRaw.toString());
  if (listedPrice == null || listedPrice <= 0) {
    return badRequest('listed_price must be a positive number');
  }

  try {
    final listing = await ListingRepo(context.read<Db>()).updatePrice(
      id:           id,
      companyId:    auth.companyId,
      listedPrice:  listedPrice,
    );
    return Response.json(body: listing.toJson());
  } on StateError {
    return notFound('Listing $id not found');
  }
}
