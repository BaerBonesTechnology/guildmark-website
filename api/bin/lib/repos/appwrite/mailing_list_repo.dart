/// Appwrite implementation of MailingListRepo — the reference for the
/// Postgres → Appwrite repo rewrite (see ../../../POSTGRES_TO_APPWRITE.md).
///
/// The public interface is IDENTICAL to the Postgres MailingListRepo so the
/// routes that consume it don't change; only the constructor dependency
/// (AppwriteService instead of Db) and the bodies differ.
library;

import 'package:dart_appwrite/dart_appwrite.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';

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

  /// Build from an Appwrite document. `$id`/`$createdAt` are system fields;
  /// the rest come from `data`.
  factory MailingListEntry.fromDocument(models.Document doc) {
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
}

class MailingListRepo {
  MailingListRepo(this._aw);
  final AppwriteService _aw;

  Databases get _db => _aw.databases;

  Future<MailingListEntry?> subscribe({
    required String email,
    String source = 'waitlist',
    String? notes,
    bool upsert = false,
  }) async {
    final normalized = email.toLowerCase().trim();

    // Emulate ON CONFLICT (email): look for an existing document first.
    final existing = await _db.listDocuments(
      databaseId: Aw.databaseId,
      collectionId: Aw.mailingList,
      queries: [Query.equal('email', normalized), Query.limit(1)],
    );

    if (existing.documents.isNotEmpty) {
      if (!upsert) return null; // already subscribed (no-op path)
      final doc = await _db.updateDocument(
        databaseId: Aw.databaseId,
        collectionId: Aw.mailingList,
        documentId: existing.documents.first.$id,
        data: {'source': source, if (notes != null) 'notes': notes},
      );
      return MailingListEntry.fromDocument(doc);
    }

    try {
      final doc = await _db.createDocument(
        databaseId: Aw.databaseId,
        collectionId: Aw.mailingList,
        documentId: ID.unique(),
        data: {
          'email': normalized,
          'source': source,
          if (notes != null) 'notes': notes,
        },
      );
      return MailingListEntry.fromDocument(doc);
    } on AppwriteException catch (e) {
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

    final res = await _db.listDocuments(
      databaseId: Aw.databaseId,
      collectionId: Aw.mailingList,
      queries: queries,
    );
    return res.documents.map(MailingListEntry.fromDocument).toList();
  }

  Future<int> count({String? source}) async {
    final res = await _db.listDocuments(
      databaseId: Aw.databaseId,
      collectionId: Aw.mailingList,
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
      final doc = await _db.updateDocument(
        databaseId: Aw.databaseId,
        collectionId: Aw.mailingList,
        documentId: id,
        data: {
          'contacted_at': DateTime.now().toUtc().toIso8601String(),
          if (notes != null) 'notes': notes, // COALESCE(@notes, notes)
        },
      );
      return MailingListEntry.fromDocument(doc);
    } on AppwriteException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  Future<MailingListEntry?> updateNotes({
    required String id,
    required String notes,
  }) async {
    try {
      final doc = await _db.updateDocument(
        databaseId: Aw.databaseId,
        collectionId: Aw.mailingList,
        documentId: id,
        data: {'notes': notes},
      );
      return MailingListEntry.fromDocument(doc);
    } on AppwriteException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  Future<bool> delete(String id) async {
    try {
      await _db.deleteDocument(
        databaseId: Aw.databaseId,
        collectionId: Aw.mailingList,
        documentId: id,
      );
      return true;
    } on AppwriteException catch (e) {
      if (e.code == 404) return false;
      rethrow;
    }
  }
}
