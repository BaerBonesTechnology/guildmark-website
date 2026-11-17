import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext c, String id) async {
  final auth = c.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();
  if (!auth.isStaffAdministrator) return forbidden();
  if (c.request.method != HttpMethod.patch)
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'PATCH only');
  final db = c.read<FirebaseService?>();
  if (db == null)
    return jsonError(503, 'DB_UNAVAILABLE', 'Partner accounts unavailable.');
  final body = await boundedJson(c.request);
  if (body is! Map<String, dynamic> ||
      body.keys.any((k) => k != 'status') ||
      !{'pending', 'active', 'suspended'}.contains(body['status']))
    return badRequest('A supported partner status is required.');
  try {
    await db.tablesDB.transaction((tx) async {
      final actor = await tx.get('guildmark_employees', auth.userId);
      final partner = await tx.get('partners', id);
      if (!{'admin', 'superadmin'}.contains(actor?.data['role']) ||
          actor?.data['is_active'] != true)
        throw StateError('Staff access changed');
      if (partner == null)
        throw const DatastoreException('Partner not found', code: 404);
      if (partner.data['status'] == body['status']) return;
      tx.update('partners', id, {'status': body['status']});
      tx.create('partner_access_audit', ID.unique(), {
        'actor_id': auth.userId,
        'partner_id': id,
        'previous_status': partner.data['status'],
        'status': body['status'],
        'changed_at': DateTime.now().toUtc().toIso8601String(),
      });
    });
    return Response.json(
      headers: {'Cache-Control': 'no-store'},
      body: {'id': id, 'status': body['status']},
    );
  } on DatastoreException catch (e) {
    if (e.code == 404) return notFound('Partner not found');
    rethrow;
  } on StateError {
    return forbidden('Staff access changed. Sign in again.');
  }
}
