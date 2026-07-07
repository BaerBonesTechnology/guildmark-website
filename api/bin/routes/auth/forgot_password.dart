import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/user_repo.dart';
import 'package:guildmark_api/services/email_service.dart';

import 'package:dart_appwrite/dart_appwrite.dart' show ID, Query;

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  final email = (body?['email'] as String?)?.toLowerCase().trim();
  if (email == null || email.isEmpty) {
    return badRequest('email is required');
  }

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final mail = context.read<EmailService>();
  final cfg = context.read<AppConfig>();

  // Always return 200 — never disclose whether the address exists.
  final user = await UserRepo(aw).findByEmail(email);
  if (user != null) {
    final plaintext = _randomToken();
    final hash = _hash(plaintext);
    final now = DateTime.now().toUtc();
    final expiresAt = now.add(const Duration(hours: 1));
    final db = aw.tablesDB;

    // Revoke any existing unused tokens for this user before issuing a new
    // one, so only the most-recently-requested token is ever valid. No
    // multi-row UPDATE in Appwrite — list then update each.
    final live = await db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.passwordResetTokens,
      queries: [
        Query.equal('user_id', user.id),
        Query.isNull('used_at'),
        Query.greaterThan('expires_at', now.toIso8601String()),
        Query.limit(100),
      ],
    );
    for (final row in live.rows) {
      await db.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.passwordResetTokens,
        rowId: row.$id,
        data: {'used_at': now.toIso8601String()},
      );
    }

    await db.createRow(
      databaseId: Aw.databaseId,
      tableId: Aw.passwordResetTokens,
      rowId: ID.unique(),
      data: {
        'user_id': user.id,
        'token_hash': hash,
        'expires_at': expiresAt.toIso8601String(),
      },
    );

    final frontendUrl = cfg.corsOrigin;
    final resetLink = '$frontendUrl/reset-password?token=$plaintext';

    unawaited(mail.sendPasswordReset(toEmail: email, resetLink: resetLink));
  }

  return Response.json(
    body: {
      'message': 'If that email is registered, a reset link has been sent.',
    },
  );
}

String _randomToken({int byteLength = 48}) {
  final rng = Random.secure();
  final bytes = List<int>.generate(byteLength, (_) => rng.nextInt(256));
  return base64Url.encode(bytes).replaceAll('=', '');
}

String _hash(String plaintext) =>
    sha256.convert(utf8.encode(plaintext)).toString();
