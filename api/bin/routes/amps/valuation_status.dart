import 'package:dart_appwrite/dart_appwrite.dart' show AppwriteException;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  }
  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  final Map<String, dynamic> data;
  try {
    final row = await aw.tablesDB.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.companies,
      rowId: auth.companyId,
    );
    data = row.data;
  } on AppwriteException catch (e) {
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
