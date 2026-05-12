/// Data-access for the pre-launch mailing list.
library;

import 'package:postgres/postgres.dart';

import '../db/pool.dart';
import '../models/json_helpers.dart';

class MailingListEntry {
  MailingListEntry({
    required this.id,
    required this.email,
    required this.source,
    this.notes,
    this.contactedAt,
    required this.createdAt,
  });

  final String id;
  final String email;
  final String source;
  final String? notes;
  final DateTime? contactedAt;
  final DateTime createdAt;

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'source': source,
        if (notes != null) 'notes': notes,
        'contacted_at': contactedAt?.toIso8601String(),
        'created_at': createdAt.toIso8601String(),
      };

  factory MailingListEntry.fromRow(Map<String, dynamic> row) =>
      MailingListEntry(
        id: row['id'] as String,
        email: row['email'] as String,
        source: row['source'] as String,
        notes: row['notes'] as String?,
        contactedAt: row['contacted_at'] as DateTime?,
        createdAt: row['created_at'] as DateTime,
      );
}

class MailingListRepo {
  MailingListRepo(this._db);
  final Db _db;

  /// Insert an email. Returns null if the email already exists (no-op).
  ///
  /// Set [upsert] = true to overwrite the source and notes when the email
  /// already exists — used for partner LOI submissions where the contact may
  /// have previously signed up on the regular waitlist.
  Future<MailingListEntry?> subscribe({
    required String email,
    String source = 'waitlist',
    String? notes,
    bool upsert = false,
  }) async {
    final conflict = upsert
        ? 'ON CONFLICT (email) DO UPDATE SET source = EXCLUDED.source, notes = EXCLUDED.notes'
        : 'ON CONFLICT (email) DO NOTHING';

    final result = await _db.query(
      '''
      INSERT INTO mailing_list (email, source, notes)
      VALUES (@email, @source, @notes)
      $conflict
      RETURNING id, email::text, source, notes, contacted_at, created_at
      ''',
      parameters: {
        'email': email.toLowerCase().trim(),
        'source': source,
        'notes': notes,
      },
    );
    if (result.isEmpty) return null; // already subscribed (no-op path)
    return MailingListEntry.fromRow(result.first.toColumnMap());
  }

  /// Paginated list for the admin dashboard, newest first.
  Future<List<MailingListEntry>> list({
    int limit = 50,
    int offset = 0,
    bool uncontactedOnly = false,
    String? source,
  }) async {
    final conditions = <String>[];
    if (uncontactedOnly) conditions.add('contacted_at IS NULL');
    if (source != null)  conditions.add("source = @source");
    final where = conditions.isEmpty ? '' : 'WHERE ${conditions.join(' AND ')}';

    final result = await _db.query(
      '''
      SELECT id, email::text, source, notes, contacted_at, created_at
      FROM mailing_list
      $where
      ORDER BY created_at DESC
      LIMIT @limit OFFSET @offset
      ''',
      parameters: {
        'limit': limit,
        'offset': offset,
        if (source != null) 'source': source,
      },
    );
    return result.map((r) => MailingListEntry.fromRow(r.toColumnMap())).toList();
  }

  /// Total subscriber count, optionally scoped to a source.
  Future<int> count({String? source}) async {
    final where = source != null ? 'WHERE source = @source' : '';
    final result = await _db.query(
      'SELECT COUNT(*)::int AS n FROM mailing_list $where',
      parameters: source != null ? {'source': source} : {},
    );
    return numToIntOrNull(result.first.toColumnMap()['n']) ?? 0;
  }

  /// Mark a subscriber as contacted and optionally add a note.
  Future<MailingListEntry?> markContacted({
    required String id,
    String? notes,
  }) async {
    final result = await _db.query(
      '''
      UPDATE mailing_list
      SET contacted_at = now(),
          notes = COALESCE(@notes, notes)
      WHERE id = @id
      RETURNING id, email::text, source, notes, contacted_at, created_at
      ''',
      parameters: {'id': id, 'notes': notes},
    );
    if (result.isEmpty) return null;
    return MailingListEntry.fromRow(result.first.toColumnMap());
  }

  /// Update notes on a subscriber without marking them as contacted.
  Future<MailingListEntry?> updateNotes({
    required String id,
    required String notes,
  }) async {
    final result = await _db.query(
      '''
      UPDATE mailing_list SET notes = @notes
      WHERE id = @id
      RETURNING id, email::text, source, notes, contacted_at, created_at
      ''',
      parameters: {'id': id, 'notes': notes},
    );
    if (result.isEmpty) return null;
    return MailingListEntry.fromRow(result.first.toColumnMap());
  }

  /// Permanently remove a subscriber by id. Returns true if a row was deleted.
  Future<bool> delete(String id) async {
    final result = await _db.query(
      'DELETE FROM mailing_list WHERE id = @id RETURNING id::text',
      parameters: {'id': id},
    );
    return result.isNotEmpty;
  }
}
