import 'package:dart_appwrite/dart_appwrite.dart' show AppwriteException;
import 'package:dart_appwrite/models.dart' show Row;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  switch (context.request.method) {
    case HttpMethod.patch:
      final body = await context.request.json() as Map<String, dynamic>?;
      if (body == null) return badRequest('Request body required');

      final data = <String, dynamic>{};

      if (body.containsKey('role')) {
        const validRoles = ['superadmin', 'engineer', 'support', 'marketing'];
        final role = body['role'] as String?;
        if (role == null || !validRoles.contains(role)) {
          return badRequest('Invalid role');
        }
        data['role'] = role;
      }

      if (body.containsKey('is_active')) {
        data['is_active'] = body['is_active'] as bool;
      }

      if (body.containsKey('full_name')) {
        final name = (body['full_name'] as String?)?.trim();
        if (name == null || name.isEmpty) {
          return badRequest('full_name cannot be empty');
        }
        data['full_name'] = name;
      }

      if (data.isEmpty) return badRequest('No updatable fields provided');

      Row row;
      try {
        row = await db.updateRow(
          databaseId: Aw.databaseId,
          tableId: Aw.guildmarkEmployees,
          rowId: id,
          data: data,
        );
      } on AppwriteException catch (e) {
        if (e.code == 404) return notFound('Employee not found');
        rethrow;
      }

      return Response.json(
        body: {
          'id': row.$id,
          'email': row.data['email'].toString(),
          'full_name': row.data['full_name'].toString(),
          'role': row.data['role'].toString(),
          'is_active': (row.data['is_active'] as bool?) ?? true,
        },
      );

    case HttpMethod.delete:
      // Soft-delete: deactivate rather than remove audit trail.
      try {
        await db.updateRow(
          databaseId: Aw.databaseId,
          tableId: Aw.guildmarkEmployees,
          rowId: id,
          data: {'is_active': false},
        );
      } on AppwriteException catch (e) {
        if (e.code == 404) return notFound('Employee not found');
        rethrow;
      }
      return Response.json(body: {'id': id, 'is_active': false});

    default:
      return jsonError(405, 'METHOD_NOT_ALLOWED', 'PATCH or DELETE only');
  }
}
