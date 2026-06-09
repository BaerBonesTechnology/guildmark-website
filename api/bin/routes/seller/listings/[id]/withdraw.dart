/// PATCH /seller/listings/:id/withdraw

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

  try {
    final listing = await ListingRepo(context.read<Db>())
        .withdraw(id: id, companyId: auth.companyId);
    return Response.json(body: listing.toJson());
  } on StateError {
    return notFound('Listing $id not found or already inactive');
  }
}
