/// POST /webhooks/doppler
///
/// Receives a Doppler secret-rotation webhook, verifies the HMAC-SHA256
/// signature, then restarts the production Docker Compose stack so the
/// containers pick up the new secrets.
///
/// Doppler signs every delivery with:
///   X-Doppler-Signature: <hex(HMAC-SHA256(body, DOPPLER_SECRET))>
///
/// Verification is done with constant-time comparison to prevent
/// timing-based side-channel attacks.

import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:dart_frog/dart_frog.dart';

import '../../lib/config.dart';
import '../../lib/crypto_utils.dart';
import '../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  final cfg = context.read<AppConfig>();
  final secret = cfg.dopplerWebhookSecret;

  if (secret == null || secret.isEmpty) {
    stderr.writeln('[doppler-webhook] DOPPLER_SECRET is not configured — rejecting request');
    return forbidden('Webhook not configured');
  }

  // Read raw body bytes before any decoding so the signature covers exactly
  // what Doppler sent. We read as a string then re-encode to bytes since
  // dart_frog's request body is a Stream<List<int>> under the hood.
  final bodyString = await context.request.body();
  final bodyBytes  = utf8.encode(bodyString);

  // Verify signature ─────────────────────────────────────────────────────────
  final signatureHeader = context.request.headers['x-doppler-signature'] ?? '';
  if (signatureHeader.isEmpty) {
    return Response(
      statusCode: HttpStatus.unauthorized,
      body: jsonEncode({'error': 'Missing X-Doppler-Signature header'}),
      headers: {'Content-Type': 'application/json'},
    );
  }

  final hmac = Hmac(sha256, utf8.encode(secret));
  final digest = hmac.convert(bodyBytes);
  final expected = digest.toString(); // hex string

  if (!constantTimeEquals(expected, signatureHeader)) {
    stderr.writeln('[doppler-webhook] Signature mismatch — rejecting');
    return Response(
      statusCode: HttpStatus.unauthorized,
      body: jsonEncode({'error': 'Invalid signature'}),
      headers: {'Content-Type': 'application/json'},
    );
  }

  // Signature valid — restart the stack ──────────────────────────────────────
  stderr.writeln('[doppler-webhook] Signature verified — restarting stack');

  final bearerToken = cfg.dopplerBearerToken;

  // Run the restart asynchronously so we can ack Doppler before the process
  // completes (Doppler times out quickly on webhooks).
  _restartStack(bearerToken);

  return Response(
    statusCode: HttpStatus.ok,
    body: jsonEncode({'status': 'restarting'}),
    headers: {'Content-Type': 'application/json'},
  );
}

/// Runs `doppler run [--token <token>] --config prd -- docker compose restart`
/// and logs stdout/stderr to the container log. Errors are caught so they
/// cannot propagate back to the already-sent HTTP response.
///
/// Passing [bearerToken] via `--token` means the container needs no
/// pre-existing `doppler login` session — the service token is sufficient.
void _restartStack(String? bearerToken) {
  Future(() async {
    try {
      final args = [
        'run',
        if (bearerToken != null) ...['--token', bearerToken],
        '--config', 'prd',
        '--',
        'docker', 'compose', '-f', 'docker-compose.prod.yml', 'restart',
      ];

      final result = await Process.run(
        'doppler',
        args,
        runInShell: true,
      );

      if (result.exitCode == 0) {
        stderr.writeln('[doppler-webhook] Stack restart succeeded:\n${result.stdout}');
      } else {
        stderr.writeln(
          '[doppler-webhook] Stack restart failed (exit ${result.exitCode}):\n'
          'stdout: ${result.stdout}\nstderr: ${result.stderr}',
        );
      }
    } catch (e, st) {
      stderr.writeln('[doppler-webhook] Error running restart command: $e\n$st');
    }
  });
}
