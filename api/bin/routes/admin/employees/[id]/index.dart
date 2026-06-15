/// PATCH /admin/employees/:id — update role or active status
/// DELETE /admin/employees/:id — deactivate (soft delete)

import 'package:dart_frog/dart_frog.dart';

import '../../../../lib/context.dart';
import '../../../../lib/db/pool.dart';
import '../../../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  final db = context.read<Db>();

  switch (context.request.method) {
    case HttpMethod.patch:
      final body = await context.request.json() as Map<String, dynamic>?;
      if (body == null) return badRequest('Request body required');

      final updates = <String>[];
      final params  = <String, Object?>{'id': id};

      if (body.containsKey('role')) {
        const validRoles = ['superadmin', 'engineer', 'support', 'marketing'];
        final role = body['role'] as String?;
        if (role == null || !validRoles.contains(role)) return badRequest('Invalid role');
        updates.add('role = @role::employee_role');
        params['role'] = role;
      }

      if (body.containsKey('is_active')) {
        updates.add('is_active = @isActive');
        params['isActive'] = body['is_active'] as bool;
      }

      if (body.containsKey('full_name')) {
        final name = (body['full_name'] as String?)?.trim();
        if (name == null || name.isEmpty) return badRequest('full_name cannot be empty');
        updates.add('full_name = @name');
        params['name'] = name;
      }

      if (updates.isEmpty) return badRequest('No updatable fields provided');

      final result = await db.query(
        '''
        UPDATE guildmark_employees
        SET ${updates.join(', ')}
        WHERE id = @id::uuid
        RETURNING id::text, email::text, full_name, role::text, is_active
        ''',
        parameters: params,
      );
      if (result.isEmpty) return notFound('Employee not found');

      final row = result.first.toColumnMap();
      return Response.json(body: {
        'id':        row['id'].toString(),
        'email':     row['email'].toString(),
        'full_name': row['full_name'].toString(),
        'role':      row['role'].toString(),
        'is_active': row['is_active'] as bool,
      });

    case HttpMethod.delete:
      // Soft-delete: deactivate rather than remove audit trail.
      final result = await db.query(
        '''
        UPDATE guildmark_employees
        SET is_active = false
        WHERE id = @id::uuid
        RETURNING id::text
        ''',
        parameters: {'id': id},
      );
      if (result.isEmpty) return notFound('Employee not found');
      return Response.json(body: {'id': id, 'is_active': false});

    default:
      return jsonError(405, 'METHOD_NOT_ALLOWED', 'PATCH or DELETE only');
  }
}
