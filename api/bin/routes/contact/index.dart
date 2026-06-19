import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/db/pool.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final body = await context.request.json() as Map<String, dynamic>?;

  final email = (body?['email'] as String?)?.trim();
  final name = (body?['name'] as String?)?.trim();
  final message = (body?['message'] as String?)?.trim();

  if (email == null || email.isEmpty) {
    return badRequest('email is required');
  }
  if (message == null || message.isEmpty) {
    return badRequest('message is required');
  }

  // Field-length limits — prevent oversized payloads from inflating the DB
  // or causing downstream email services to process unexpectedly large content.
  if (email.length > 254) return badRequest('email is too long');
  if (name != null && name.length > 200) return badRequest('name is too long');
  if (message.length > 5000)
    return badRequest('message is too long (max 5000 characters)');

  final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
  if (!emailRegex.hasMatch(email)) {
    return badRequest('Invalid email address');
  }

  // Build notes string: "Contact: <message> | Name: <name>"
  final parts = <String>[
    'Message: $message',
    if (name != null && name.isNotEmpty) 'Name: $name',
  ];
  final notes = parts.join(' | ');

  final db = context.read<Db>();

  // Insert or append to existing record.
  // If the email is already on the list, append the new message to notes
  // separated by " || " so the admin can see multiple submissions.
  await db.query(
    '''
    INSERT INTO mailing_list (email, source, notes)
    VALUES (@email, 'contact', @notes)
    ON CONFLICT (email) DO UPDATE
      SET notes = CASE
            WHEN mailing_list.notes IS NULL THEN EXCLUDED.notes
            ELSE mailing_list.notes || ' || ' || EXCLUDED.notes
          END,
          source = CASE
            WHEN mailing_list.source = 'contact' THEN 'contact'
            ELSE mailing_list.source
          END
    ''',
    parameters: {'email': email.toLowerCase(), 'notes': notes},
  );

  return Response.json(
    body: {'message': "Message received. We'll be in touch soon."},
  );
}
