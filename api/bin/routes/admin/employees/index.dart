import 'package:dart_appwrite/dart_appwrite.dart' show ID, Query;
import 'package:dart_appwrite/models.dart' show Row;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/auth/password.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  final aw = context.read<AppwriteService?>();
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
          databaseId: Aw.databaseId,
          tableId: Aw.guildmarkEmployees,
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

      const validRoles = ['superadmin', 'engineer', 'support', 'marketing'];
      if (!validRoles.contains(role)) return badRequest('Invalid role');

      final hash = hashPassword(password);
      // A duplicate email hits the unique index (409) and propagates as a 500,
      // matching the old PG unique-violation behavior.
      final row = await db.createRow(
        databaseId: Aw.databaseId,
        tableId: Aw.guildmarkEmployees,
        rowId: ID.unique(),
        data: {
          'email': email,
          'password_hash': hash,
          'full_name': fullName,
          'role': role,
        },
      );
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
