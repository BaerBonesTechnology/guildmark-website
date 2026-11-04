/// Firestore-backed repository retaining the existing API contract.
/// Multi-step business workflows still require their own concurrency controls.
library;

import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';

import 'package:guildmark_api/firebase/collections.dart';

class PartnerRecord {

  /// Build from an Appwrite row. Money is stored as integer cents
  /// (`available_balance_cents`) and surfaced as double dollars to keep the
  /// public model identical to the Postgres one.
  factory PartnerRecord.fromRow(Row row) {
    final d = row.data;
    return PartnerRecord(
      id: row.$id,
      email: d['email'] as String,
      passwordHash: d['password_hash'] as String? ?? '',
      companyName: d['company_name'] as String,
      partnerCode: d['partner_code'] as String,
      status: (d['status'] as String?) ?? 'pending',
      rating: (d['rating'] as num?)?.toDouble() ?? 5.0,
      totalJobsCompleted: (d['total_jobs_completed'] as num?)?.toInt() ?? 0,
      availableBalance:
          ((d['available_balance_cents'] as num?)?.toInt() ?? 0) / 100.0,
      city: d['city'] as String?,
      state: d['state'] as String?,
    );
  }
  PartnerRecord({
    required this.id,
    required this.email,
    required this.passwordHash,
    required this.companyName,
    required this.partnerCode,
    required this.status,
    required this.rating,
    required this.totalJobsCompleted,
    required this.availableBalance,
    this.city,
    this.state,
  });

  final String id;
  final String email;
  final String passwordHash;
  final String companyName;
  final String partnerCode;
  final String status;
  final double rating;
  final int totalJobsCompleted;
  final double availableBalance;
  final String? city;
  final String? state;

  Map<String, dynamic> toAuthPartner() => {
    'id': id,
    'email': email,
    'company_name': companyName,
    'partner_code': partnerCode,
    'status': status,
    'rating': rating,
    'total_jobs_completed': totalJobsCompleted,
    'available_balance': availableBalance,
    'city': city,
    'state': state,
  };
}

class PartnerRepo {
  PartnerRepo(this._aw);
  final FirebaseService _aw;

  TablesDB get _db => _aw.tablesDB;

  /// Bounded retries when a generated partner code loses the unique-index
  /// race (409).
  static const _codeAttempts = 5;

  Future<PartnerRecord?> findByEmail(String email) async {
    final res = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.partners,
      queries: [Query.equal('email', email), Query.limit(1)],
    );
    if (res.rows.isEmpty) return null;
    return PartnerRecord.fromRow(res.rows.first);
  }

  Future<PartnerRecord?> findById(String id) async {
    try {
      final row = await _db.getRow(
        databaseId: Collections.databaseId,
        tableId: Collections.partners,
        rowId: id,
      );
      return PartnerRecord.fromRow(row);
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  /// Register a new partner.
  ///
  /// Postgres derived `partner_code` from `partner_code_seq`; Appwrite has no
  /// sequences, so a random "GM-XXXX" code is generated app-side. The
  /// `partner_code_unique` index rejects collisions and we retry with a new
  /// code (bounded). A 409 caused by the `email_unique` index is rethrown —
  /// same behavior as the Postgres unique violation.
  Future<PartnerRecord> create({
    required String companyName,
    required String email,
    required String passwordHash,
    String? city,
    String? state,
  }) async {
    final normalized = email.toLowerCase().trim();
    final rand = Random.secure();
    late DatastoreException lastConflict;

    for (var attempt = 0; attempt < _codeAttempts; attempt++) {
      final code = 'GM-${1000 + rand.nextInt(9000)}';
      try {
        final row = await _db.createRow(
          databaseId: Collections.databaseId,
          tableId: Collections.partners,
          rowId: ID.unique(),
          data: {
            'company_name': companyName,
            'email': normalized,
            'password_hash': passwordHash,
            'partner_code': code,
            'city': ?city,
            'state': ?state,
          },
        );
        return PartnerRecord.fromRow(row);
      } on DatastoreException catch (e) {
        if (e.code != 409) rethrow;
        // Disambiguate which unique index rejected us: if the email is now
        // taken, this is a duplicate-signup error the caller must handle
        // (matches the Postgres unique-violation throw). Otherwise it was a
        // partner_code collision — retry with a fresh code.
        final emailTaken = await _db.listRows(
          databaseId: Collections.databaseId,
          tableId: Collections.partners,
          queries: [Query.equal('email', normalized), Query.limit(1)],
        );
        if (emailTaken.rows.isNotEmpty) rethrow;
        lastConflict = e;
      }
    }
    throw lastConflict;
  }

  /// Adjust the partner's available balance by [delta] dollars and return the
  /// updated record (null if the partner doesn't exist).
  ///
  /// ⚠ Race caveat: Postgres did `SET available_balance = available_balance
  /// + x` atomically in the database. Appwrite has no server-side arithmetic,
  /// so this is a read-modify-write — two concurrent adjustments can lose one
  /// update. Acceptable for the current low-frequency payout/credit flow;
  /// revisit (single-writer queue or conditional update) before high-volume
  /// money movement.
  Future<PartnerRecord?> adjustBalance({
    required String partnerId,
    required double delta,
  }) async {
    try {
      final row = await _db.getRow(
        databaseId: Collections.databaseId,
        tableId: Collections.partners,
        rowId: partnerId,
      );
      final currentCents =
          (row.data['available_balance_cents'] as num?)?.toInt() ?? 0;
      final updated = await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.partners,
        rowId: partnerId,
        data: {
          'available_balance_cents': currentCents + (delta * 100).round(),
        },
      );
      return PartnerRecord.fromRow(updated);
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  Future<void> insertRefreshToken({
    required String partnerId,
    required String plaintextToken,
    required DateTime expiresAt,
  }) async {
    final hash = _hash(plaintextToken);
    await _db.createRow(
      databaseId: Collections.databaseId,
      tableId: Collections.partnerRefreshTokens,
      rowId: ID.unique(),
      data: {
        'partner_id': partnerId,
        'token_hash': hash,
        'expires_at': expiresAt.toUtc().toIso8601String(),
      },
    );
  }

  /// Validate + rotate a partner refresh token. Returns the partner the token
  /// belongs to, or null if the token is invalid/expired/revoked.
  ///
  /// Postgres wrapped this in a transaction with `FOR UPDATE`; Appwrite has
  /// neither, so this is a §1a saga:
  ///   1. revoke the old token FIRST (the commit point — a concurrent
  ///      rotation of the same token loses at this step because the lookup
  ///      filters on `revoked_at IS NULL`),
  ///   2. insert the new token; on failure, compensate by un-revoking the
  ///      old one,
  ///   3. load the partner; if it vanished, compensate by deleting the new
  ///      token and un-revoking the old one (best-effort).
  /// Without row locking a narrow race remains where two concurrent calls
  /// both pass step 0's lookup; the loser then double-revokes harmlessly and
  /// both callers get valid (distinct) new tokens.
  Future<PartnerRecord?> rotateRefreshToken({
    required String plaintextToken,
    required String newPlaintextToken,
    required DateTime newExpiresAt,
  }) async {
    final oldHash = _hash(plaintextToken);
    final newHash = _hash(newPlaintextToken);
    final nowIso = DateTime.now().toUtc().toIso8601String();

    // Step 0 — lookup: token exists, not revoked, not expired.
    final lookup = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.partnerRefreshTokens,
      queries: [
        Query.equal('token_hash', oldHash),
        Query.isNull('revoked_at'),
        Query.greaterThan('expires_at', nowIso),
        Query.limit(1),
      ],
    );
    if (lookup.rows.isEmpty) return null;
    final oldRow = lookup.rows.first;
    final partnerId = oldRow.data['partner_id'] as String;

    // Step 1 — revoke old token (commit point).
    await _db.updateRow(
      databaseId: Collections.databaseId,
      tableId: Collections.partnerRefreshTokens,
      rowId: oldRow.$id,
      data: {'revoked_at': nowIso},
    );

    // Step 2 — insert the replacement; compensate on failure.
    final Row newRow;
    try {
      newRow = await _db.createRow(
        databaseId: Collections.databaseId,
        tableId: Collections.partnerRefreshTokens,
        rowId: ID.unique(),
        data: {
          'partner_id': partnerId,
          'token_hash': newHash,
          'expires_at': newExpiresAt.toUtc().toIso8601String(),
        },
      );
    } catch (_) {
      await _tryUnrevoke(oldRow.$id);
      rethrow;
    }

    // Step 3 — load the partner; compensate if it no longer exists.
    try {
      final partner = await _db.getRow(
        databaseId: Collections.databaseId,
        tableId: Collections.partners,
        rowId: partnerId,
      );
      return PartnerRecord.fromRow(partner);
    } on DatastoreException catch (e) {
      if (e.code == 404) {
        try {
          await _db.deleteRow(
            databaseId: Collections.databaseId,
            tableId: Collections.partnerRefreshTokens,
            rowId: newRow.$id,
          );
        } on DatastoreException {
          // best-effort compensation
        }
        await _tryUnrevoke(oldRow.$id);
        return null;
      }
      rethrow;
    }
  }

  Future<void> revokeRefreshToken(String plaintextToken) async {
    final res = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.partnerRefreshTokens,
      queries: [
        Query.equal('token_hash', _hash(plaintextToken)),
        Query.isNull('revoked_at'),
        Query.limit(1),
      ],
    );
    if (res.rows.isEmpty) return; // UPDATE matched 0 rows — no-op like PG
    await _db.updateRow(
      databaseId: Collections.databaseId,
      tableId: Collections.partnerRefreshTokens,
      rowId: res.rows.first.$id,
      data: {'revoked_at': DateTime.now().toUtc().toIso8601String()},
    );
  }

  Future<void> _tryUnrevoke(String tokenRowId) async {
    try {
      await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.partnerRefreshTokens,
        rowId: tokenRowId,
        data: {'revoked_at': null},
      );
    } on DatastoreException {
      // best-effort compensation
    }
  }

  static String _hash(String plaintext) =>
      sha256.convert(utf8.encode(plaintext)).toString();
}
