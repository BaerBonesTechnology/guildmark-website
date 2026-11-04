/// Firestore-backed repository retaining the existing API contract.
/// Multi-step business workflows still require their own concurrency controls.
library;

import 'package:guildmark_api/firebase/firestore.dart';

import 'package:guildmark_api/firebase/collections.dart';

class MailingListEntry {

  /// Build from an Appwrite document. `$id`/`$createdAt` are system fields;
  /// the rest come from `data`.
  factory MailingListEntry.fromDocument(Row doc) {
    final d = doc.data;
    final contacted = d['contacted_at'] as String?;
    return MailingListEntry(
      id: doc.$id,
      email: d['email'] as String,
      source: (d['source'] as String?) ?? 'waitlist',
      notes: d['notes'] as String?,
      contactedAt: contacted == null ? null : DateTime.parse(contacted),
      createdAt: DateTime.parse(doc.$createdAt),
    );
  }
  MailingListEntry({
    required this.id,
    required this.email,
    required this.source,
    required this.createdAt, this.notes,
    this.contactedAt,
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
}

class MailingListRepo {
  MailingListRepo(this._aw);
  final FirebaseService _aw;

  TablesDB get _db => _aw.tablesDB;

  Future<MailingListEntry?> subscribe({
    required String email,
    String source = 'waitlist',
    String? notes,
    bool upsert = false,
  }) async {
    final normalized = email.toLowerCase().trim();

    // Emulate ON CONFLICT (email): look for an existing document first.
    final existing = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.mailingList,
      queries: [Query.equal('email', normalized), Query.limit(1)],
    );

    if (existing.rows.isNotEmpty) {
      if (!upsert) return null; // already subscribed (no-op path)
      final doc = await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.mailingList,
        rowId: existing.rows.first.$id,
        data: {'source': source, 'notes': ?notes},
      );
      return MailingListEntry.fromDocument(doc);
    }

    try {
      final doc = await _db.createRow(
        databaseId: Collections.databaseId,
        tableId: Collections.mailingList,
        rowId: ID.unique(),
        data: {
          'email': normalized,
          'source': source,
          'notes': ?notes,
        },
      );
      return MailingListEntry.fromDocument(doc);
    } on DatastoreException catch (e) {
      // Lost a race against the unique index — treat as already subscribed.
      if (e.code == 409) return null;
      rethrow;
    }
  }

  Future<List<MailingListEntry>> list({
    int limit = 50,
    int offset = 0,
    bool uncontactedOnly = false,
    String? source,
  }) async {
    final queries = <String>[
      Query.orderDesc(r'$createdAt'),
      Query.limit(limit),
      Query.offset(offset),
      if (uncontactedOnly) Query.isNull('contacted_at'),
      if (source != null) Query.equal('source', source),
    ];

    final res = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.mailingList,
      queries: queries,
    );
    return res.rows.map<MailingListEntry>(MailingListEntry.fromDocument).toList();
  }

  Future<int> count({String? source}) async {
    final res = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.mailingList,
      queries: [
        Query.limit(1),
        if (source != null) Query.equal('source', source),
      ],
    );
    return res.total;
  }

  Future<MailingListEntry?> markContacted({
    required String id,
    String? notes,
  }) async {
    try {
      final doc = await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.mailingList,
        rowId: id,
        data: {
          'contacted_at': DateTime.now().toUtc().toIso8601String(),
          'notes': ?notes, // COALESCE(@notes, notes)
        },
      );
      return MailingListEntry.fromDocument(doc);
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  Future<MailingListEntry?> updateNotes({
    required String id,
    required String notes,
  }) async {
    try {
      final doc = await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.mailingList,
        rowId: id,
        data: {'notes': notes},
      );
      return MailingListEntry.fromDocument(doc);
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  Future<bool> delete(String id) async {
    try {
      await _db.deleteRow(
        databaseId: Collections.databaseId,
        tableId: Collections.mailingList,
        rowId: id,
      );
      return true;
    } on DatastoreException catch (e) {
      if (e.code == 404) return false;
      rethrow;
    }
  }
}
