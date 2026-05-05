/// POST /waitlist
///
/// Public endpoint — no auth required.
/// Accepts an email and adds it to the mailing_list table.
/// Responds 200 whether the email is new or already registered
/// to avoid leaking whether an address exists.
library;

import 'dart:async';

import 'package:dart_frog/dart_frog.dart';

import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/mailing_list_repo.dart';
import '../../lib/services/email_service.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  final email = (body?['email'] as String?)?.trim();

  if (email == null || email.isEmpty) {
    return badRequest('email is required');
  }

  // Basic format check before hitting the DB.
  final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
  if (!emailRegex.hasMatch(email)) {
    return badRequest('Invalid email address');
  }

  final repo = MailingListRepo(context.read<Db>());
  final entry = await repo.subscribe(
    email: email,
    source: (body?['source'] as String?) ?? 'waitlist',
  );

  // Send confirmation only for genuinely new subscribers (entry is null when
  // the email already existed — avoids spamming existing contacts).
  if (entry != null) {
    // Fire-and-forget: email failure must never break the signup flow.
    unawaited(
      context.read<EmailService>().sendWaitlistConfirmation(email),
    );
  }

  // Always return 200 — don't reveal whether the email was already registered.
  return Response.json(
    body: {'message': 'You\'re on the list. We\'ll be in touch.'},
  );
}
