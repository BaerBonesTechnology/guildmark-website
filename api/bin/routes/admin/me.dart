import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/services/cms.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/business_verification.dart';

Future<Response> onRequest(RequestContext c) async {
  if (c.request.method != HttpMethod.get)
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET only');
  final principal = c.read<AuthPrincipal?>();
  if (principal?.audience != 'staff')
    return unauthorized('Staff session required');
  final db = c.read<FirebaseService?>();
  if (db == null)
    return jsonError(503, 'DB_UNAVAILABLE', 'Staff access unavailable');
  try {
    final row = await db.tablesDB.getRow(
      databaseId: '',
      tableId: 'guildmark_employees',
      rowId: principal!.userId,
    );
    if (row.data['is_active'] != true)
      return forbidden('Staff account disabled');
    return Response.json(
      headers: {'Cache-Control': 'no-store'},
      body: {
        'can_edit_content': Cms.canEdit(row.data['role'] as String? ?? ''),
        'can_publish_content': Cms.canPublish(
          row.data['role'] as String? ?? '',
        ),
        'employee': {
          'id': row.$id,
          'email': row.data['email'],
          'full_name': row.data['full_name'],
          'role': row.data['role'],
        },
        'can_review_business': BusinessVerification.canReview(
          'staff',
          row.data['role'] as String? ?? '',
        ),
        'can_administer':
            principal.isStaffAdministrator &&
            {'admin', 'superadmin'}.contains(row.data['role']),
      },
    );
  } on DatastoreException {
    return unauthorized();
  }
}
