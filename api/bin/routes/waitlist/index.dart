/// POST /waitlist
///
/// Public endpoint — no auth required.
/// Accepts an email and adds it to the mailing_list table.
/// Responds 200 whether the email is new or already registered
/// to avoid leaking whether an address exists.
///
/// Optional partner fields (stored in notes):
///   name         — contact name
///   company      — company name
///   partner_type — reseller | msp | refurbisher | itservices | other
///   phone        — contact phone number
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

  // Field-length limits — prevent oversized payloads.
  if (email.length > 254) return badRequest('email is too long');

  final source = (body?['source'] as String?) ?? 'waitlist';

  // Build notes string from optional partner fields.
  String? notes;
  final name        = (body?['name']         as String?)?.trim();
  final company     = (body?['company']       as String?)?.trim();
  final partnerType = (body?['partner_type']  as String?)?.trim();
  final phone       = (body?['phone']         as String?)?.trim();

  if (name != null && name.length > 200) return badRequest('name is too long');
  if (company != null && company.length > 200) return badRequest('company is too long');
  if (phone != null && phone.length > 50) return badRequest('phone is too long');
  final loiAccepted = body?['loi_accepted'] == true;

  if (name != null || company != null || partnerType != null || phone != null || loiAccepted) {
    final parts = <String>[
      if (name        != null && name.isNotEmpty)        'Name: $name',
      if (company     != null && company.isNotEmpty)     'Company: $company',
      if (partnerType != null && partnerType.isNotEmpty) 'Type: $partnerType',
      if (phone       != null && phone.isNotEmpty)       'Phone: $phone',
      if (loiAccepted)                                   'LOI: accepted ${DateTime.now().toUtc().toIso8601String().substring(0, 10)}',
    ];
    if (parts.isNotEmpty) notes = parts.join(' | ');
  }

  final repo  = MailingListRepo(context.read<Db>());
  final entry = await repo.subscribe(
    email:  email,
    source: source,
    notes:  notes,
    // Partner LOI submissions must overwrite any prior waitlist entry so that
    // the signed LOI date and partner fields are always stored, even if the
    // contact's email already exists from an earlier sign-up.
    upsert: source == 'partner' && loiAccepted,
  );

  final mail = context.read<EmailService>();

  // Send confirmation only for genuinely new subscribers (entry is null when
  // the email already existed — avoids spamming existing contacts).
  if (entry != null) {
    // Fire-and-forget: email failures must never break the signup flow.
    unawaited(mail.sendWaitlistConfirmation(email));
  }

  // Notify operations@guildmark.co for every new signup, plus partner LOI
  // re-submissions (upserts where email already existed) since the signed
  // LOI date and partner fields are always worth surfacing to the team.
  final isPartnerLoi = source == 'partner' && loiAccepted;
  if (entry != null || isPartnerLoi) {
    unawaited(
      mail.sendNewSubscriberNotification(
        subscriberEmail: email,
        source: source,
        notes: notes,
        signedUpAt: entry?.createdAt,
      ),
    );
  }

  // Always return 200 — don't reveal whether the email was already registered.
  return Response.json(
    body: {'message': "You're on the list. We'll be in touch."},
  );
}
