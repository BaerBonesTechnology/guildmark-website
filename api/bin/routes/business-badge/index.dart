import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/business_verification.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get)
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  final company = context.request.uri.queryParameters['company_id'];
  if (company == null || !RegExp(r'^[a-zA-Z0-9_-]{1,128}$').hasMatch(company))
    return badRequest('Valid company_id required');
  final store = context.read<FirebaseService?>();
  if (store == null)
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore unavailable');
  final record = await BusinessVerification(store.tablesDB).record(company);
  return Response.json(
    body: {
      'verified_business': BusinessVerification.status(record) == 'approved',
    },
    headers: {'Cache-Control': 'no-store'},
  );
}
