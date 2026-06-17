import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:postgres/postgres.dart';

import '../../lib/config.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/user_repo.dart';
import '../../lib/services/email_service.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  final email = (body?['email'] as String?)?.toLowerCase().trim();
  if (email == null || email.isEmpty) {
    return badRequest('email is required');
  }

  final db = context.read<Db>();
  final mail = context.read<EmailService>();
  final cfg = context.read<AppConfig>();

  // Always return 200 — never disclose whether the address exists.
  final user = await UserRepo(db).findByEmail(email);
  if (user != null) {
    final plaintext = _randomToken();
    final hash = _hash(plaintext);
    final expiresAt = DateTime.now().toUtc().add(const Duration(hours: 1));

    // Revoke any existing unused tokens for this user before issuing a new one.
    // This ensures only the most-recently-requested token is ever valid,
    // preventing a confused-deputy scenario where an older intercepted email
    // can still be used after the user requested a fresh reset.
    await db.query(
      '''
      UPDATE password_reset_tokens
         SET used_at = NOW()
       WHERE user_id = @uid
         AND used_at IS NULL
         AND expires_at > NOW()
      ''',
      parameters: {'uid': user.id},
    );

    await db.query(
      '''
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (@uid, @hash, @exp)
      ''',
      parameters: {'uid': user.id, 'hash': hash, 'exp': expiresAt},
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
