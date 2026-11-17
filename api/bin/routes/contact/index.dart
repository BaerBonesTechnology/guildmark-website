import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/firebase/firestore.dart';
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
  if (message.length > 5000) {
    return badRequest('message is too long (max 5000 characters)');
  }

  final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
  if (!emailRegex.hasMatch(email)) {
    return badRequest('Invalid email address');
  }

  // Build notes string: "Message: <message> | Name: <name>"
  final parts = <String>[
    'Message: $message',
    if (name != null && name.isNotEmpty) 'Name: $name',
  ];
  final notes = parts.join(' | ');

  final aw = context.read<FirebaseService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;
  final normalized = email.toLowerCase();

  // Emulate the PG ON CONFLICT upsert: if the email is already on the list,
  // append the new message to notes (separated by " || ") and keep the
  // existing source; otherwise insert with source 'contact'. The unique
  // email index rejects the loser of a create race — retried as an update.
  final existing = await db.listRows(
    databaseId: Collections.databaseId,
    tableId: Collections.mailingList,
    queries: [Query.equal('email', normalized), Query.limit(1)],
  );

  Future<void> appendToExisting(String rowId, String? existingNotes) =>
      db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.mailingList,
        rowId: rowId,
        data: {
          'notes': existingNotes == null ? notes : '$existingNotes || $notes',
        },
      );

  if (existing.rows.isNotEmpty) {
    final row = existing.rows.first;
    await appendToExisting(row.$id, row.data['notes'] as String?);
  } else {
    try {
      await db.createRow(
        databaseId: Collections.databaseId,
        tableId: Collections.mailingList,
        rowId: ID.unique(),
        data: {'email': normalized, 'source': 'contact', 'notes': notes},
      );
    } on DatastoreException catch (e) {
      if (e.code != 409) rethrow;
      final raced = await db.listRows(
        databaseId: Collections.databaseId,
        tableId: Collections.mailingList,
        queries: [Query.equal('email', normalized), Query.limit(1)],
      );
      if (raced.rows.isNotEmpty) {
        final row = raced.rows.first;
        await appendToExisting(row.$id, row.data['notes'] as String?);
      }
    }
  }

  return Response.json(
    body: {'message': "Message received. We'll be in touch soon."},
  );
}
