import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:postgres/postgres.dart';

import 'package:guildmark_api/auth/password.dart';
import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  final token = (body?['token'] as String?)?.trim();
  final newPassword = (body?['new_password'] as String?)?.trim();

  if (token == null || token.isEmpty) return badRequest('token is required');
  if (newPassword == null || newPassword.length < 8) {
    return badRequest('new_password must be at least 8 characters');
  }

  final db = context.read<Db>();
  final hash = sha256.convert(utf8.encode(token)).toString();

  // Validate and mark the token used atomically.
  final userId = await db.tx<String?>((tx) async {
    final rows = await tx.execute(
      Sql.named('''
        SELECT id, user_id FROM password_reset_tokens
        WHERE token_hash = @hash
          AND used_at IS NULL
          AND expires_at > now()
        FOR UPDATE
      '''),
      parameters: {'hash': hash},
    );
    if (rows.isEmpty) return null;

    final row = rows.first.toColumnMap();
    final tokenId = row['id'] as String;
    final uid = row['user_id'] as String;

    await tx.execute(
      Sql.named(
        'UPDATE password_reset_tokens SET used_at = now() WHERE id = @id',
      ),
      parameters: {'id': tokenId},
    );

    return uid;
  });

  if (userId == null) {
    return jsonError(
      422,
      'TOKEN_INVALID',
      'Reset token is invalid or has expired',
    );
  }

  final newHash = hashPassword(newPassword);
  await db.query(
    'UPDATE users SET password_hash = @h WHERE id = @uid',
    parameters: {'h': newHash, 'uid': userId},
  );

  // Revoke all existing refresh tokens so other sessions are invalidated.
  await db.query(
    'UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = @uid AND revoked_at IS NULL',
    parameters: {'uid': userId},
  );

  return Response.json(body: {'message': 'Password updated successfully'});
}
