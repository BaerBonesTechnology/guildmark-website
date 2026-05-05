/// POST /auth/forgot-password
///
/// Body:    { email }
/// Returns: 200 always (don't leak whether the email exists)
/// Side:    If a user with that email exists, sends a password-reset link via Resend.
///          Token is a 48-byte random plaintext; SHA-256 hash stored in DB.
///          Link: {FRONTEND_URL}/reset-password?token={plaintext}
library;

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

  final body  = await context.request.json() as Map<String, dynamic>?;
  final email = (body?['email'] as String?)?.toLowerCase().trim();
  if (email == null || email.isEmpty) {
    return badRequest('email is required');
  }

  final db    = context.read<Db>();
  final mail  = context.read<EmailService>();
  final cfg   = context.read<AppConfig>();

  // Always return 200 — never disclose whether the address exists.
  final user = await UserRepo(db).findByEmail(email);
  if (user != null) {
    final plaintext = _randomToken();
    final hash      = _hash(plaintext);
    final expiresAt = DateTime.now().toUtc().add(const Duration(hours: 1));

    await db.query(
      '''
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (@uid, @hash, @exp)
      ''',
      parameters: {'uid': user.id, 'hash': hash, 'exp': expiresAt},
    );

    final frontendUrl = cfg.corsOrigin != '*'
        ? cfg.corsOrigin
        : 'https://app.guildmark.co';
    final resetLink = '$frontendUrl/reset-password?token=$plaintext';

    unawaited(mail.sendPasswordReset(toEmail: email, resetLink: resetLink));
  }

  return Response.json(body: {
    'message': 'If that email is registered, a reset link has been sent.',
  });
}

String _randomToken({int byteLength = 48}) {
  final rng   = Random.secure();
  final bytes = List<int>.generate(byteLength, (_) => rng.nextInt(256));
  return base64Url.encode(bytes).replaceAll('=', '');
}

String _hash(String plaintext) =>
    sha256.convert(utf8.encode(plaintext)).toString();
