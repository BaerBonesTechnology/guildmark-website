/// GET /marketplace/listings/:id
///
/// Public single-listing detail. Returns 404 if the listing isn't active.

import 'package:dart_frog/dart_frog.dart';

import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';
import '../../../../lib/repos/listing_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final listing = await ListingRepo(context.read<Db>()).findActiveById(id);
  if (listing == null) return notFound('Listing $id not found or no longer active');
  return Response.json(body: listing.toJson());
}
