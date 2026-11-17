/// POST /auth/reset-password
///
/// Body:    { token, new_password }
/// Returns: 200 on success, 400/422 on failure
/// Side:    Marks token used, writes new bcrypt hash to users table.
library;

import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/auth/firebase_routes.dart';
import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/auth/password.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (firebaseSessions(context) != null) {
    return firebaseAuthRoute(context, 'reset_password');
  }
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

  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;
  final hash = sha256.convert(utf8.encode(token)).toString();
  final now = DateTime.now().toUtc();

  // Look up a live token and mark it used. Appwrite has no transactions or
  // FOR UPDATE: two concurrent redemptions of the SAME token could both pass
  // the read. Accepted risk (token is secret, single email recipient) — the
  // update below is the commit point and is idempotent.
  final rows = await db.listRows(
    databaseId: Collections.databaseId,
    tableId: Collections.passwordResetTokens,
    queries: [
      Query.equal('token_hash', hash),
      Query.isNull('used_at'),
      Query.greaterThan('expires_at', now.toIso8601String()),
      Query.limit(1),
    ],
  );
  if (rows.rows.isEmpty) {
    return jsonError(
      422,
      'TOKEN_INVALID',
      'Reset token is invalid or has expired',
    );
  }
  final tokenRow = rows.rows.first;
  final userId = tokenRow.data['user_id'] as String;

  await db.updateRow(
    databaseId: Collections.databaseId,
    tableId: Collections.passwordResetTokens,
    rowId: tokenRow.$id,
    data: {'used_at': now.toIso8601String()},
  );

  final newHash = hashPassword(newPassword);
  await db.updateRow(
    databaseId: Collections.databaseId,
    tableId: Collections.users,
    rowId: userId,
    data: {'password_hash': newHash},
  );

  // Revoke all existing refresh tokens so other sessions are invalidated.
  final live = await db.listRows(
    databaseId: Collections.databaseId,
    tableId: Collections.refreshTokens,
    queries: [
      Query.equal('user_id', userId),
      Query.isNull('revoked_at'),
      Query.limit(100),
    ],
  );
  for (final row in live.rows) {
    await db.updateRow(
      databaseId: Collections.databaseId,
      tableId: Collections.refreshTokens,
      rowId: row.$id,
      data: {'revoked_at': now.toIso8601String()},
    );
  }

  return Response.json(body: {'message': 'Password updated successfully'});
}
