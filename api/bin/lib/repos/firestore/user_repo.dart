/// Firestore-backed repository retaining the existing API contract.
/// Multi-step business workflows still require their own concurrency controls.
library;

import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';

import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/services/business_verification.dart';

class UserRecord {
  UserRecord({
    required this.id,
    required this.companyId,
    required this.email,
    required this.passwordHash,
    required this.fullName,
    required this.role,
    required this.companyName,
    this.subscriptionPlan = 'free',
    this.subscriptionStatus = 'active',
    this.businessVerificationStatus = 'unsubmitted',
  });

  final String id;
  final String companyId;
  final String email;
  final String passwordHash;
  final String fullName;
  final String role;
  final String companyName;

  /// Current subscription plan: 'free' | 'starter' | 'growth' | 'pro'
  final String subscriptionPlan;

  /// 'active' | 'cancelled' | 'past_due'
  final String subscriptionStatus;
  final String businessVerificationStatus;

  Map<String, dynamic> toAuthUser() => {
    'id': id,
    'email': email,
    'full_name': fullName,
    'role': role,
    'company_id': companyId,
    'company': companyName,
    'subscription_plan': subscriptionPlan,
    'subscription_status': subscriptionStatus,
    'business_verification_status': businessVerificationStatus,
  };
}

class UserRepo {
  UserRepo(this._aw);
  final FirebaseService _aw;

  TablesDB get _db => _aw.tablesDB;

  Future<UserRecord?> findByEmail(String email) async {
    // Postgres used CITEXT for email; Appwrite's index is case-sensitive, so
    // normalize app-side (the same normalization is applied on write).
    final normalized = email.toLowerCase().trim();
    final res = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.users,
      queries: [Query.equal('email', normalized), Query.limit(1)],
    );
    if (res.rows.isEmpty) return null;
    return _loadRecord(res.rows.first);
  }

  /// Signup saga (replaces the Postgres transaction, see design doc §1a):
  /// create `companies` → `users` → `subscriptions` (free plan) in dependency
  /// order; on failure delete the rows already written, then rethrow.
  Future<UserRecord> create({
    required String email,
    required String passwordHash,
    required String fullName,
    required String companyName,
    required String companySize,
    required String industry,
    String? firebaseUid,
  }) async {
    final normalized = email.toLowerCase().trim();

    // Step 1 — company (parent row; highest-value invariant is that a user
    // always references an existing company, so this goes first).
    final company = await _db.createRow(
      databaseId: Collections.databaseId,
      tableId: Collections.companies,
      rowId: ID.unique(),
      data: {
        'name': companyName,
        'size_band': companySize,
        'industry': industry,
      },
    );
    final companyId = company.$id;

    // Step 2 — user. On failure (incl. losing a race on the unique email
    // index), compensate by deleting the orphan company.
    final Row user;
    try {
      user = await _db.createRow(
        databaseId: Collections.databaseId,
        tableId: Collections.users,
        rowId: ID.unique(),
        data: {
          'company_id': companyId,
          'email': normalized,
          if (firebaseUid == null) 'password_hash': passwordHash,
          'firebase_uid': ?firebaseUid,
          'full_name': fullName,
          'role': 'admin',
        },
      );
    } on DatastoreException catch (e) {
      await _compensateDelete(Collections.companies, companyId);
      if (e.code == 409) {
        // Unique email index rejected us — the Postgres unique violation
        // surfaced as a thrown exception too; the signup route's catch-all
        // turns either into a 500 (it pre-checks findByEmail for the 409 path).
        throw StateError('email already registered');
      }
      rethrow;
    } catch (_) {
      await _compensateDelete(Collections.companies, companyId);
      rethrow;
    }

    // Step 3 — free subscription. On failure, unwind user + company.
    try {
      await _db.createRow(
        databaseId: Collections.databaseId,
        tableId: Collections.subscriptions,
        rowId: ID.unique(),
        data: {
          'company_id': companyId,
          'plan': 'free',
          'status': 'active',
        },
      );
    } catch (_) {
      await _compensateDelete(Collections.users, user.$id);
      await _compensateDelete(Collections.companies, companyId);
      rethrow;
    }

    return UserRecord(
      id: user.$id,
      companyId: companyId,
      email: user.data['email'] as String,
      passwordHash: user.data['password_hash'] as String? ?? '',
      fullName: user.data['full_name'] as String,
      role: user.data['role'] as String,
      companyName: company.data['name'] as String,
    );
  }

  Future<void> insertRefreshToken({
    required String userId,
    required String plaintextToken,
    required DateTime expiresAt,
  }) async {
    await _db.createRow(
      databaseId: Collections.databaseId,
      tableId: Collections.refreshTokens,
      rowId: ID.unique(),
      data: {
        'user_id': userId,
        'token_hash': _hash(plaintextToken),
        'expires_at': expiresAt.toUtc().toIso8601String(),
      },
    );
  }

  /// Validate + rotate a refresh token. Returns the user the token belongs
  /// to, or null if invalid/expired/revoked.
  ///
  /// Saga replacing the Postgres transaction (§1a). Ordering choice: the NEW
  /// token row is created FIRST, and the old one is revoked only after that
  /// insert succeeds — if we revoked first and the insert failed, the client
  /// would be left with no valid token (locked out). The trade-off is a brief
  /// window where both tokens are valid; if revoking the old token then
  /// fails, we compensate by deleting the new row and rethrow so the old
  /// token stays usable. Note: without Postgres' `FOR UPDATE` row lock, two
  /// concurrent rotations of the same token can both pass the lookup; the
  /// loser merely re-revokes an already-revoked row (idempotent update).
  Future<UserRecord?> rotateRefreshToken({
    required String plaintextToken,
    required String newPlaintextToken,
    required DateTime newExpiresAt,
  }) async {
    final oldHash = _hash(plaintextToken);
    final nowIso = DateTime.now().toUtc().toIso8601String();

    // Lookup: valid = matching hash, not revoked, not expired.
    final lookup = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.refreshTokens,
      queries: [
        Query.equal('token_hash', oldHash),
        Query.isNull('revoked_at'),
        Query.greaterThan('expires_at', nowIso),
        Query.limit(1),
      ],
    );
    if (lookup.rows.isEmpty) return null;
    final oldToken = lookup.rows.first;
    final userId = oldToken.data['user_id'] as String;

    // Step 1 — insert the replacement token.
    final newToken = await _db.createRow(
      databaseId: Collections.databaseId,
      tableId: Collections.refreshTokens,
      rowId: ID.unique(),
      data: {
        'user_id': userId,
        'token_hash': _hash(newPlaintextToken),
        'expires_at': newExpiresAt.toUtc().toIso8601String(),
      },
    );

    // Step 2 — revoke the old token; on failure delete the new one so the
    // rotation is a no-op (old token remains valid), then rethrow.
    try {
      await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.refreshTokens,
        rowId: oldToken.$id,
        data: {'revoked_at': DateTime.now().toUtc().toIso8601String()},
      );
    } catch (_) {
      await _compensateDelete(Collections.refreshTokens, newToken.$id);
      rethrow;
    }

    // Fetch the user (JOIN users + companies + subscriptions, stitched).
    final Row userRow;
    try {
      userRow = await _db.getRow(
        databaseId: Collections.databaseId,
        tableId: Collections.users,
        rowId: userId,
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return null; // user deleted out from under the token
      rethrow;
    }
    return _loadRecord(userRow);
  }

  Future<void> revokeRefreshToken(String plaintextToken) async {
    // UPDATE ... WHERE token_hash = @h AND revoked_at IS NULL — silently a
    // no-op when nothing matches, same as the Postgres version.
    final res = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.refreshTokens,
      queries: [
        Query.equal('token_hash', _hash(plaintextToken)),
        Query.isNull('revoked_at'),
        Query.limit(1),
      ],
    );
    if (res.rows.isEmpty) return;
    try {
      await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.refreshTokens,
        rowId: res.rows.first.$id,
        data: {'revoked_at': DateTime.now().toUtc().toIso8601String()},
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return; // row deleted between list and update
      rethrow;
    }
  }

  /// Emulates the Postgres JOIN companies / LEFT JOIN subscriptions: given a
  /// users row, fetch its company (inner join — missing company ⇒ null, like
  /// a JOIN dropping the row) and its subscription (left join — missing ⇒
  /// COALESCE defaults 'free'/'active').
  Future<UserRecord?> _loadRecord(Row userRow) async {
    final companyId = userRow.data['company_id'] as String;

    final Row company;
    try {
      company = await _db.getRow(
        databaseId: Collections.databaseId,
        tableId: Collections.companies,
        rowId: companyId,
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }

    final subs = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.subscriptions,
      queries: [Query.equal('company_id', companyId), Query.limit(1)],
    );
    final sub = subs.rows.isEmpty ? null : subs.rows.first;

    return UserRecord(
      id: userRow.$id,
      companyId: companyId,
      email: userRow.data['email'] as String,
      passwordHash: userRow.data['password_hash'] as String? ?? '',
      fullName: userRow.data['full_name'] as String,
      role: (userRow.data['role'] as String?) ?? 'member',
      companyName: company.data['name'] as String,
      subscriptionPlan: (sub?.data['plan'] as String?) ?? 'free',
      subscriptionStatus: (sub?.data['status'] as String?) ?? 'active',
      businessVerificationStatus: BusinessVerification.status(
        await BusinessVerification(_db).record(companyId),
      ),
    );
  }

  /// Best-effort saga compensation: delete a row written earlier in the saga,
  /// swallowing every error (the original failure is what gets rethrown).
  Future<void> _compensateDelete(String tableId, String rowId) async {
    try {
      await _db.deleteRow(
        databaseId: Collections.databaseId,
        tableId: tableId,
        rowId: rowId,
      );
    } catch (_) {
      // Best effort — an orphan row is preferable to masking the real error.
    }
  }

  static String _hash(String plaintext) =>
      sha256.convert(utf8.encode(plaintext)).toString();
}
