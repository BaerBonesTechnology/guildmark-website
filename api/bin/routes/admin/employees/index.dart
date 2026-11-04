import 'package:guildmark_api/firebase/firestore.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';

import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/auth/password.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (!principal.isStaffAdministrator) return forbidden();

  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  switch (context.request.method) {
    case HttpMethod.get:
      // The SQL was unbounded (SELECT … ORDER BY created_at ASC); Appwrite
      // paginates, so page through the whole (small, staff-sized) table.
      final rows = <Row>[];
      String? cursor;
      while (true) {
        final page = await db.listRows(
          databaseId: Collections.databaseId,
          tableId: Collections.guildmarkEmployees,
          queries: [
            Query.orderAsc(r'$createdAt'),
            Query.limit(100),
            if (cursor != null) Query.cursorAfter(cursor),
          ],
        );
        rows.addAll(page.rows);
        if (page.rows.length < 100) break;
        cursor = page.rows.last.$id;
      }

      final employees = rows.map((r) {
        final d = r.data;
        return {
          'id': r.$id,
          'email': d['email'].toString(),
          'full_name': d['full_name'].toString(),
          'role': d['role'].toString(),
          'is_active': (d['is_active'] as bool?) ?? true,
          'last_login_at': d['last_login_at'] as String?,
          'created_at': r.$createdAt,
        };
      }).toList();
      return Response.json(body: employees);

    case HttpMethod.post:
      final body = await context.request.json() as Map<String, dynamic>?;
      final email = (body?['email'] as String?)?.trim().toLowerCase();
      final password = body?['password'] as String?;
      final fullName = (body?['full_name'] as String?)?.trim();
      final role = (body?['role'] as String?) ?? 'support';

      if (email == null || password == null || fullName == null) {
        return badRequest('email, password, and full_name are required');
      }
      if (password.length < 10) {
        return badRequest('password must be at least 10 characters');
      }

      const validRoles = [
        'superadmin',
        'compliance',
        'engineer',
        'support',
        'marketing',
      ];
      if (!validRoles.contains(role)) return badRequest('Invalid role');

      final sessions = firebaseSessions(context);
      final account = sessions == null
          ? null
          : await sessions.auth.signUp(email, password);
      final hash = sessions == null ? hashPassword(password) : null;
      // A duplicate email hits the unique index (409) and propagates as a 500,
      // matching the old PG unique-violation behavior.
      late Row row;
      try {
        row = await db.createRow(
          databaseId: Collections.databaseId,
          tableId: Collections.guildmarkEmployees,
          rowId: ID.unique(),
          data: {
            'email': email,
            'password_hash': ?hash,
            if (account != null) 'firebase_uid': account['localId'],
            'full_name': fullName,
            'role': role,
          },
        );
      } catch (_) {
        if (account != null) {
          await sessions!.auth.deleteUser(account['localId'] as String);
        }
        rethrow;
      }
      return Response.json(
        statusCode: 201,
        body: {
          'id': row.$id,
          'email': row.data['email'].toString(),
          'full_name': row.data['full_name'].toString(),
          'role': row.data['role'].toString(),
          'is_active': (row.data['is_active'] as bool?) ?? true,
          'created_at': row.$createdAt,
        },
      );

    default:
      return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST only');
  }
}
