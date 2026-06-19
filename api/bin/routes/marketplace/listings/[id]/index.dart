import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/listing_repo.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }

  final listing = await ListingRepo(context.read<Db>()).findActiveById(id);
  if (listing == null)
    return notFound('Listing $id not found or no longer active');
  return Response.json(body: listing.toJson());
}
