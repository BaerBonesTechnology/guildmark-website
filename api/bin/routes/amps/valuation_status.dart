import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  final Map<String, dynamic> data;
  try {
    final row = await aw.tablesDB.getRow(
      databaseId: Collections.databaseId,
      tableId: Collections.companies,
      rowId: auth.companyId,
    );
    data = row.data;
  } on DatastoreException catch (e) {
    if (e.code == 404) return notFound('Company not found');
    rethrow;
  }

  return Response.json(
    body: {
      'status': data['valuation_status'] as String? ?? 'idle',
      'asset_count': (data['valuation_asset_count'] as num?)?.toInt() ?? 0,
      'started_at': data['valuation_started_at'] as String?,
    },
  );
}
