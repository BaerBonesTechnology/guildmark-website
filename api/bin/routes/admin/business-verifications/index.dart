import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/business_verification.dart';

Future<Response> onRequest(RequestContext context) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.audience != 'staff') return forbidden();
  final store = context.read<FirebaseService?>();
  if (store == null)
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore unavailable');
  // Read current staff authority; a stale session cannot retain review rights.
  final employee = await store.tablesDB.getRow(
    databaseId: '',
    tableId: 'guildmark_employees',
    rowId: principal.userId,
  );
  if (employee.data['is_active'] != true ||
      !BusinessVerification.canReview(
        principal.audience,
        employee.data['role'] as String? ?? '',
      ))
    return forbidden();
  final service = BusinessVerification(store.tablesDB);
  if (context.request.method == HttpMethod.get) {
    final company = context.request.uri.queryParameters['company_id'];
    if (company != null) {
      if (!RegExp(r'^[a-zA-Z0-9_-]{1,128}$').hasMatch(company))
        return badRequest('Invalid company_id');
      final events = await store.tablesDB.listRows(
        databaseId: '',
        tableId: BusinessVerification.events,
        queries: [Query.equal('company_id', company), Query.limit(100)],
      );
      final ordered = events.rows.toList()
        ..sort(
          (left, right) => ((left.data['revision'] as int?) ?? 0).compareTo(
            (right.data['revision'] as int?) ?? 0,
          ),
        );
      return Response.json(
        body: {'events': ordered.map((event) => event.data).toList()},
        headers: {'Cache-Control': 'no-store'},
      );
    }
    final status = context.request.uri.queryParameters['status'] ?? 'pending';
    if (!{
      'pending',
      'approved',
      'needs_information',
      'rejected',
    }.contains(status))
      return badRequest('Invalid status');
    final cursor = context.request.uri.queryParameters['cursor'];
    final rows = await store.tablesDB.listRows(
      databaseId: '',
      tableId: BusinessVerification.table,
      queries: [
        Query.equal('status', status),
        Query.limit(50),
        if (cursor != null && cursor.isNotEmpty) Query.cursorAfter(cursor),
      ],
    );
    return Response.json(
      body: {
        'applications': rows.rows
            .map((record) => {'id': record.$id, ...record.data})
            .toList(),
        'next_cursor': rows.rows.length == 50 ? rows.rows.last.$id : null,
      },
      headers: {'Cache-Control': 'no-store'},
    );
  }
  if (context.request.method != HttpMethod.post)
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST only');
  try {
    final body = await context.request.json();
    if (body is! Map<String, dynamic> ||
        body['company_id'] is! String ||
        (body['company_id'] as String).contains('/'))
      return badRequest('company_id required');
    await service.review(body['company_id'] as String, principal.userId, body);
    return Response.json(body: {'ok': true});
  } on FormatException catch (error) {
    return badRequest(error.message);
  }
}
