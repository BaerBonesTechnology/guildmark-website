import 'package:dart_frog/dart_frog.dart';

import '../../../lib/auth/password.dart';
import '../../../lib/context.dart';
import '../../../lib/db/pool.dart';
import '../../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  final db = context.read<Db>();

  switch (context.request.method) {
    case HttpMethod.get:
      final rows = await db.query(
        '''
        SELECT id::text, email::text, full_name, role::text,
               is_active, last_login_at, created_at
        FROM guildmark_employees
        ORDER BY created_at ASC
        ''',
      );
      final employees = rows.map((r) {
        final m = r.toColumnMap();
        return {
          'id': m['id'].toString(),
          'email': m['email'].toString(),
          'full_name': m['full_name'].toString(),
          'role': m['role'].toString(),
          'is_active': m['is_active'] as bool,
          'last_login_at': (m['last_login_at'] as DateTime?)?.toIso8601String(),
          'created_at': (m['created_at'] as DateTime).toIso8601String(),
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
      final result = await db.query(
        '''
        INSERT INTO guildmark_employees (email, password_hash, full_name, role)
        VALUES (@email, @hash, @name, @role::employee_role)
        RETURNING id::text, email::text, full_name, role::text, is_active, created_at
        ''',
        parameters: {
          'email': email,
          'hash': hash,
          'name': fullName,
          'role': role,
        },
      );
      final row = result.first.toColumnMap();
      return Response.json(
        statusCode: 201,
        body: {
          'id': row['id'].toString(),
          'email': row['email'].toString(),
          'full_name': row['full_name'].toString(),
          'role': row['role'].toString(),
          'is_active': row['is_active'] as bool,
          'created_at': (row['created_at'] as DateTime).toIso8601String(),
        },
      );

    default:
      return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST only');
  }
}
