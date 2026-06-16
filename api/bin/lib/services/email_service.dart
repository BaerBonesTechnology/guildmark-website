/// Resend email service — thin wrapper over the Resend HTTP API.
///
/// Docs: https://resend.com/docs/api-reference/emails/send-email
/// All sends are fire-and-forget: failures are logged but never propagate
/// to the caller, so a transient email outage never breaks the main request.
library;

import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

class EmailService {
  EmailService({
    required this.apiKey,
    this.from = 'GuildMark <noreply@guildmark.co>',
    String? apiUrl,
  }) : _endpoint = apiUrl ?? 'https://api.resend.com/emails';

  final String apiKey;

  /// The RFC 5322 "From" address used for every outbound email.
  final String from;

  /// Resend emails endpoint — injected from RESEND_API_URL.
  final String _endpoint;

  // ---------------------------------------------------------------------------
  // Public send methods
  // ---------------------------------------------------------------------------

  /// Sends a waitlist confirmation to a newly-subscribed address.
  Future<bool> sendWaitlistConfirmation(String toEmail) => _send(
        to: toEmail,
        subject: "You're on the GuildMark waitlist 🎉",
        html: _waitlistHtml(toEmail),
        text: _waitlistText(toEmail),
      );

  /// Notifies the buyer that escrow has been opened and they need to fund it.
  Future<bool> sendOrderEscrowCreated({
    required String toEmail,
    required String productName,
    required double amount,
    required String paymentUrl,
  }) => _send(
        to: toEmail,
        subject: 'Action required: Fund your GuildMark escrow for $productName',
        html: _escrowCreatedHtml(
          email: toEmail,
          productName: productName,
          amount: amount,
          paymentUrl: paymentUrl,
        ),
      );

  /// Notifies the buyer that their order has been delivered.
  Future<bool> sendDeliveryConfirmation({
    required String toEmail,
    required String productName,
    required String trackingNumber,
    required DateTime inspectionEndsAt,
    required String confirmUrl,
  }) => _send(
        to: toEmail,
        subject: 'Your GuildMark order has been delivered — confirm receipt',
        html: _deliveryHtml(
          email: toEmail,
          productName: productName,
          trackingNumber: trackingNumber,
          inspectionEndsAt: inspectionEndsAt,
          confirmUrl: confirmUrl,
        ),
      );

  /// Sends a password reset link to the user.
  Future<bool> sendPasswordReset({
    required String toEmail,
    required String resetLink,
  }) => _send(
        to: toEmail,
        subject: 'Reset your GuildMark password',
        html: _passwordResetHtml(email: toEmail, resetLink: resetLink),
      );

  /// Notifies operations@guildmark.co that a new subscriber has joined.
  ///
  /// [source]  — 'waitlist' | 'partner' | 'contact'
  /// [notes]   — raw notes string stored in the DB (may contain partner fields)
  /// [message] — contact message, only set for source='contact'
  Future<bool> sendNewSubscriberNotification({
    required String subscriberEmail,
    required String source,
    String? notes,
    String? message,
    DateTime? signedUpAt,
  }) => _send(
        to: 'operations@guildmark.co',
        subject: '[GuildMark] New $source signup: $subscriberEmail',
        html: _newSubscriberHtml(
          subscriberEmail: subscriberEmail,
          source: source,
          notes: notes,
          message: message,
          signedUpAt: signedUpAt ?? DateTime.now().toUtc(),
        ),
      );

  /// Notifies a seller that they received a new offer on their listing.
  Future<bool> sendOfferReceived({
    required String toEmail,
    required String productName,
    required double offerPrice,
    required String listingUrl,
  }) => _send(
        to: toEmail,
        subject: 'New offer received on your GuildMark listing: $productName',
        html: _offerReceivedHtml(
          email: toEmail,
          productName: productName,
          offerPrice: offerPrice,
          listingUrl: listingUrl,
        ),
      );

  /// Notifies a buyer when their offer is accepted, rejected, or countered.
  Future<bool> sendOfferStatus({
    required String toEmail,
    required String productName,
    required String status, // 'accepted' | 'rejected' | 'countered'
    double? counterPrice,
    required String offersUrl,
  }) => _send(
        to: toEmail,
        subject: 'Your GuildMark offer on $productName has been ${status}',
        html: _offerStatusHtml(
          email: toEmail,
          productName: productName,
          status: status,
          counterPrice: counterPrice,
          offersUrl: offersUrl,
        ),
      );

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  Future<bool> _send({
    required String to,
    required String subject,
    required String html,
    String? text,
  }) async {
    if (apiKey.isEmpty) {
      stderr.writeln('[email] RESEND_API_KEY not set — skipping send to $to');
      return false;
    }

    try {
      final response = await http
          .post(
            Uri.parse(_endpoint),
            headers: {
              HttpHeaders.authorizationHeader: 'Bearer $apiKey',
              HttpHeaders.contentTypeHeader: 'application/json',
            },
            body: jsonEncode({
              'from': from,
              'to': [to],
              'subject': subject,
              'html': html,
              if (text != null) 'text': text,
            }),
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        stdout.writeln('[email] sent "$subject" → $to');
        return true;
      }

      stderr.writeln(
        '[email] Resend API error ${response.statusCode}: ${response.body}',
      );
      return false;
    } catch (e) {
      stderr.writeln('[email] failed to send to $to: $e');
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Templates
  // ---------------------------------------------------------------------------

  String _waitlistHtml(String email) => '''
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the GuildMark waitlist</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    .header { background: #0f172a; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -.3px; }
    .header span { color: #6366f1; }
    .body { padding: 36px 40px; }
    .body p { margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6; }
    .body p:last-child { margin-bottom: 0; }
    .highlight { background: #f0f1fe; border-left: 3px solid #6366f1; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 24px 0; }
    .highlight p { margin: 0; color: #312e81; font-size: 14px; }
    .footer { background: #f9fafb; padding: 20px 40px; text-align: center; }
    .footer p { margin: 0; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Guild<span>Mark</span></h1>
    </div>
    <div class="body">
      <p>Hey there,</p>
      <p>Thanks for joining the <strong>GuildMark</strong> waitlist. You're in — we'll reach out as soon as your spot opens up.</p>
      <div class="highlight">
        <p>GuildMark is the B2B marketplace for buying and selling enterprise IT assets. We handle valuation, compliance, and settlement so your team doesn't have to.</p>
      </div>
      <p>In the meantime, if you have any questions you can reply to this email and our team will get back to you.</p>
      <p>Talk soon,<br /><strong>The GuildMark Team</strong></p>
    </div>
    <div class="footer">
      <p>You're receiving this because $email signed up at guildmark.co</p>
    </div>
  </div>
</body>
</html>
''';

  String _escrowCreatedHtml({
    required String email,
    required String productName,
    required double amount,
    required String paymentUrl,
  }) {
    final amountFmt = '\$${amount.toStringAsFixed(2)}';
    return '''
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><style>
  body{margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .wrapper{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .header{background:#0f172a;padding:32px 40px;text-align:center}
  .header h1{margin:0;color:#fff;font-size:22px;font-weight:700}
  .header span{color:#6366f1}
  .body{padding:36px 40px}
  .body p{margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6}
  .cta{display:block;margin:28px 0;padding:14px 24px;background:#6366f1;color:#fff!important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;text-align:center}
  .detail{background:#f0f1fe;border-left:3px solid #6366f1;padding:12px 16px;border-radius:0 6px 6px 0;margin:24px 0}
  .detail p{margin:0;color:#312e81;font-size:14px}
  .footer{background:#f9fafb;padding:20px 40px;text-align:center}
  .footer p{margin:0;color:#9ca3af;font-size:12px}
</style></head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Guild<span>Mark</span></h1></div>
    <div class="body">
      <p>Your order for <strong>$productName</strong> has been confirmed.</p>
      <p>To proceed, please fund the escrow account. Funds are held securely and only released to the seller after you confirm delivery.</p>
      <div class="detail">
        <p><strong>Amount to escrow:</strong> $amountFmt</p>
        <p><strong>Item:</strong> $productName</p>
        <p><strong>Inspection period:</strong> 48 hours after delivery</p>
      </div>
      <a href="$paymentUrl" class="cta">Fund Escrow — $amountFmt</a>
      <p>If the button doesn't work, copy this link:<br/><a href="$paymentUrl">$paymentUrl</a></p>
      <p>— The GuildMark Team</p>
    </div>
    <div class="footer"><p>Sent to $email via guildmark.co</p></div>
  </div>
</body>
</html>
''';
  }

  String _deliveryHtml({
    required String email,
    required String productName,
    required String trackingNumber,
    required DateTime inspectionEndsAt,
    required String confirmUrl,
  }) {
    final deadline =
        '${inspectionEndsAt.toUtc().toString().substring(0, 16)} UTC';
    return '''
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><style>
  body{margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .wrapper{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .header{background:#0f172a;padding:32px 40px;text-align:center}
  .header h1{margin:0;color:#fff;font-size:22px;font-weight:700}
  .header span{color:#6366f1}
  .body{padding:36px 40px}
  .body p{margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6}
  .cta{display:block;margin:28px 0;padding:14px 24px;background:#22c55e;color:#fff!important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;text-align:center}
  .detail{background:#f0fdf4;border-left:3px solid #22c55e;padding:12px 16px;border-radius:0 6px 6px 0;margin:24px 0}
  .detail p{margin:0;color:#14532d;font-size:14px}
  .warn{background:#fef9c3;border-left:3px solid #eab308;padding:12px 16px;border-radius:0 6px 6px 0;margin:24px 0}
  .warn p{margin:0;color:#713f12;font-size:14px}
  .footer{background:#f9fafb;padding:20px 40px;text-align:center}
  .footer p{margin:0;color:#9ca3af;font-size:12px}
</style></head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Guild<span>Mark</span></h1></div>
    <div class="body">
      <p>Good news — your order has been delivered!</p>
      <div class="detail">
        <p><strong>Item:</strong> $productName</p>
        <p><strong>Tracking number:</strong> $trackingNumber</p>
      </div>
      <p>Please inspect the items and confirm receipt to release payment to the seller.</p>
      <div class="warn">
        <p>⏰ <strong>Confirm by $deadline.</strong> If you don't confirm or raise a dispute before then, funds will be released automatically.</p>
      </div>
      <a href="${confirmUrl.isNotEmpty ? confirmUrl : 'https://app.guildmark.co/orders'}" class="cta">Confirm Receipt</a>
      <p>If there's an issue with the items, log in to GuildMark and open a dispute before the inspection period expires.</p>
      <p>— The GuildMark Team</p>
    </div>
    <div class="footer"><p>Sent to $email via guildmark.co</p></div>
  </div>
</body>
</html>
''';
  }

  String _waitlistText(String email) => '''
You're on the GuildMark waitlist!

Thanks for signing up. We'll reach out as soon as your spot opens up.

GuildMark is the B2B marketplace for buying and selling enterprise IT assets. We handle valuation, compliance, and settlement so your team doesn't have to.

Have questions? Reply to this email and our team will get back to you.

— The GuildMark Team

You're receiving this because $email signed up at guildmark.co
''';

  String _passwordResetHtml({required String email, required String resetLink}) => '''
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><style>
  body{margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .wrapper{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .header{background:#0f172a;padding:32px 40px;text-align:center}
  .header h1{margin:0;color:#fff;font-size:22px;font-weight:700}
  .header span{color:#6366f1}
  .body{padding:36px 40px}
  .body p{margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6}
  .cta{display:block;margin:28px 0;padding:14px 24px;background:#6366f1;color:#fff!important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;text-align:center}
  .warn{background:#fef9c3;border-left:3px solid #eab308;padding:12px 16px;border-radius:0 6px 6px 0;margin:24px 0}
  .warn p{margin:0;color:#713f12;font-size:14px}
  .footer{background:#f9fafb;padding:20px 40px;text-align:center}
  .footer p{margin:0;color:#9ca3af;font-size:12px}
</style></head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Guild<span>Mark</span></h1></div>
    <div class="body">
      <p>Hi there,</p>
      <p>We received a request to reset the password for the GuildMark account associated with <strong>$email</strong>.</p>
      <a href="$resetLink" class="cta">Reset Password</a>
      <div class="warn"><p>⏰ This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p></div>
      <p>If the button doesn't work, copy this link:<br/><a href="$resetLink">$resetLink</a></p>
      <p>— The GuildMark Team</p>
    </div>
    <div class="footer"><p>Sent to $email via guildmark.co</p></div>
  </div>
</body></html>
''';

  String _offerReceivedHtml({
    required String email,
    required String productName,
    required double offerPrice,
    required String listingUrl,
  }) {
    final fmt = '\$${offerPrice.toStringAsFixed(2)}';
    return '''
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><style>
  body{margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .wrapper{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .header{background:#0f172a;padding:32px 40px;text-align:center}
  .header h1{margin:0;color:#fff;font-size:22px;font-weight:700}
  .header span{color:#6366f1}
  .body{padding:36px 40px}
  .body p{margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6}
  .detail{background:#f0f1fe;border-left:3px solid #6366f1;padding:12px 16px;border-radius:0 6px 6px 0;margin:24px 0}
  .detail p{margin:0 0 6px;color:#312e81;font-size:14px}
  .detail p:last-child{margin-bottom:0}
  .cta{display:block;margin:28px 0;padding:14px 24px;background:#6366f1;color:#fff!important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;text-align:center}
  .footer{background:#f9fafb;padding:20px 40px;text-align:center}
  .footer p{margin:0;color:#9ca3af;font-size:12px}
</style></head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Guild<span>Mark</span></h1></div>
    <div class="body">
      <p>You have a new offer on one of your listings!</p>
      <div class="detail">
        <p><strong>Listing:</strong> $productName</p>
        <p><strong>Offer amount:</strong> $fmt</p>
      </div>
      <p>Log in to GuildMark to review and respond to the offer.</p>
      <a href="$listingUrl" class="cta">Review Offer</a>
      <p>— The GuildMark Team</p>
    </div>
    <div class="footer"><p>Sent to $email via guildmark.co</p></div>
  </div>
</body></html>
''';
  }

  String _newSubscriberHtml({
    required String subscriberEmail,
    required String source,
    String? notes,
    String? message,
    required DateTime signedUpAt,
  }) {
    final ts = signedUpAt.toString().substring(0, 19) + ' UTC';

    // Parse structured partner fields out of the notes string.
    // Format: "Name: X | Company: Y | Type: Z | Phone: X | LOI: accepted YYYY-MM-DD"
    final fields = <String, String>{};
    if (notes != null && notes.isNotEmpty) {
      for (final part in notes.split(' | ')) {
        final idx = part.indexOf(': ');
        if (idx != -1) {
          fields[part.substring(0, idx).trim()] = part.substring(idx + 2).trim();
        }
      }
    }

    final sourceLabel = source == 'partner'
        ? '🤝 Partner'
        : source == 'contact'
            ? '✉️ Contact'
            : '📋 Waitlist';

    final sourceColor = source == 'partner'
        ? '#7c3aed'
        : source == 'contact'
            ? '#0369a1'
            : '#4f46e5';

    String rows = '';
    void row(String label, String? value) {
      if (value == null || value.isEmpty) return;
      rows += '''
        <tr>
          <td style="padding:8px 12px;font-size:13px;color:#6b7280;font-weight:600;white-space:nowrap;vertical-align:top;">$label</td>
          <td style="padding:8px 12px;font-size:13px;color:#111827;word-break:break-all;">$value</td>
        </tr>''';
    }

    row('Email', subscriberEmail);
    row('Source', source);
    row('Signed up', ts);
    if (fields.isNotEmpty) {
      row('Name', fields['Name']);
      row('Company', fields['Company']);
      row('Type', fields['Type']);
      row('Phone', fields['Phone']);
      row('LOI', fields['LOI']);
    }
    if (message != null && message.isNotEmpty) {
      row('Message', message);
    }

    return '''
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .wrapper{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
  .header{background:#0f172a;padding:24px 32px;display:flex;align-items:center;gap:12px}
  .badge{background:$sourceColor;color:#fff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:99px;letter-spacing:.4px;text-transform:uppercase}
  .header h1{margin:0;color:#fff;font-size:18px;font-weight:700}
  .header span{color:#6366f1}
  .body{padding:28px 32px}
  .body p{margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6}
  table{width:100%;border-collapse:collapse;margin-top:4px}
  tr:nth-child(odd) td{background:#f9fafb}
  td{border:1px solid #e5e7eb}
  .footer{background:#f9fafb;padding:16px 32px;text-align:center}
  .footer p{margin:0;color:#9ca3af;font-size:11px}
</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Guild<span>Mark</span></h1>
      <span class="badge">$sourceLabel</span>
    </div>
    <div class="body">
      <p>A new <strong>$source</strong> signup just came in:</p>
      <table>$rows</table>
    </div>
    <div class="footer"><p>GuildMark internal notification — do not reply to this email</p></div>
  </div>
</body>
</html>
''';
  }

  String _offerStatusHtml({
    required String email,
    required String productName,
    required String status,
    double? counterPrice,
    required String offersUrl,
  }) {
    final statusLabel = status == 'accepted'
        ? '✅ Accepted'
        : status == 'rejected'
            ? '❌ Rejected'
            : '↩️ Countered';
    final counterLine = counterPrice != null
        ? '<p><strong>Counter offer:</strong> \$${counterPrice.toStringAsFixed(2)}</p>'
        : '';
    return '''
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><style>
  body{margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .wrapper{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .header{background:#0f172a;padding:32px 40px;text-align:center}
  .header h1{margin:0;color:#fff;font-size:22px;font-weight:700}
  .header span{color:#6366f1}
  .body{padding:36px 40px}
  .body p{margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6}
  .detail{background:#f0f1fe;border-left:3px solid #6366f1;padding:12px 16px;border-radius:0 6px 6px 0;margin:24px 0}
  .detail p{margin:0 0 6px;color:#312e81;font-size:14px}
  .detail p:last-child{margin-bottom:0}
  .cta{display:block;margin:28px 0;padding:14px 24px;background:#6366f1;color:#fff!important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;text-align:center}
  .footer{background:#f9fafb;padding:20px 40px;text-align:center}
  .footer p{margin:0;color:#9ca3af;font-size:12px}
</style></head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Guild<span>Mark</span></h1></div>
    <div class="body">
      <p>An update on your GuildMark offer:</p>
      <div class="detail">
        <p><strong>Listing:</strong> $productName</p>
        <p><strong>Status:</strong> $statusLabel</p>
        $counterLine
      </div>
      <a href="$offersUrl" class="cta">View My Offers</a>
      <p>— The GuildMark Team</p>
    </div>
    <div class="footer"><p>Sent to $email via guildmark.co</p></div>
  </div>
</body></html>
''';
  }
}

