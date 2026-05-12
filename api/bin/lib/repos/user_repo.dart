/// Data-access for users + companies + refresh tokens.
library;

import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:postgres/postgres.dart';

import '../db/pool.dart';

class UserRecord {
  UserRecord({
    required this.id,
    required this.companyId,
    required this.email,
    required this.passwordHash,
    required this.fullName,
    required this.role,
    required this.companyName,
    this.subscriptionPlan   = 'free',
    this.subscriptionStatus = 'active',
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

  Map<String, dynamic> toAuthUser() => {
        'id':                  id,
        'email':               email,
        'full_name':           fullName,
        'role':                role,
        'company_id':          companyId,
        'company':             companyName,
        'subscription_plan':   subscriptionPlan,
        'subscription_status': subscriptionStatus,
      };
}

class UserRepo {
  UserRepo(this._db);
  final Db _db;

  Future<UserRecord?> findByEmail(String email) async {
    final result = await _db.query(
      '''
      SELECT u.id::text, u.company_id::text, u.email::text, u.password_hash,
             u.full_name, u.role::text,
             c.name AS company_name,
             COALESCE(s.plan::text,   'free')   AS subscription_plan,
             COALESCE(s.status::text, 'active') AS subscription_status
      FROM users u
      JOIN companies c ON c.id = u.company_id
      LEFT JOIN subscriptions s ON s.company_id = u.company_id
      WHERE u.email = @email
      LIMIT 1
      ''',
      parameters: {'email': email},
    );
    if (result.isEmpty) return null;
    final row = result.first.toColumnMap();
    return _fromRow(row);
  }

  Future<UserRecord> create({
    required String email,
    required String passwordHash,
    required String fullName,
    required String companyName,
    required String companySize,
    required String industry,
  }) async {
    return _db.tx<UserRecord>((tx) async {
      final companyResult = await tx.execute(
        Sql.named(
          'INSERT INTO companies (name, size_band, industry) '
          'VALUES (@name, @size, @industry) RETURNING id::text, name',
        ),
        parameters: {
          'name':     companyName,
          'size':     companySize,
          'industry': industry,
        },
      );
      final companyRow = companyResult.first.toColumnMap();
      final companyId  = companyRow['id'].toString();
      final compName   = companyRow['name'].toString();

      final userResult = await tx.execute(
        Sql.named(
          'INSERT INTO users (company_id, email, password_hash, full_name, role) '
          "VALUES (@cid, @email, @hash, @name, 'admin') "
          'RETURNING id::text, email::text, password_hash, full_name, role::text',
        ),
        parameters: {
          'cid':   companyId,
          'email': email,
          'hash':  passwordHash,
          'name':  fullName,
        },
      );
      final userRow = userResult.first.toColumnMap();

      return UserRecord(
        id:                 userRow['id'].toString(),
        companyId:          companyId,
        email:              userRow['email'].toString(),
        passwordHash:       userRow['password_hash'].toString(),
        fullName:           userRow['full_name'].toString(),
        role:               userRow['role'].toString(),
        companyName:        compName,
        subscriptionPlan:   'free',
        subscriptionStatus: 'active',
      );
    });
  }

  Future<void> insertRefreshToken({
    required String userId,
    required String plaintextToken,
    required DateTime expiresAt,
  }) async {
    final hash = _hash(plaintextToken);
    await _db.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) '
      'VALUES (@uid, @hash, @exp)',
      parameters: {'uid': userId, 'hash': hash, 'exp': expiresAt},
    );
  }

  /// Atomically validate + rotate a refresh token. Returns the user the
  /// token belongs to, or null if invalid/expired/revoked.
  Future<UserRecord?> rotateRefreshToken({
    required String plaintextToken,
    required String newPlaintextToken,
    required DateTime newExpiresAt,
  }) async {
    final oldHash = _hash(plaintextToken);
    final newHash = _hash(newPlaintextToken);

    return _db.tx<UserRecord?>((tx) async {
      final lookup = await tx.execute(
        Sql.named(
          'SELECT user_id::text FROM refresh_tokens '
          'WHERE token_hash = @h AND revoked_at IS NULL AND expires_at > now() '
          'FOR UPDATE',
        ),
        parameters: {'h': oldHash},
      );
      if (lookup.isEmpty) return null;
      final userId = lookup.first.toColumnMap()['user_id'].toString();

      await tx.execute(
        Sql.named(
            'UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = @h'),
        parameters: {'h': oldHash},
      );
      await tx.execute(
        Sql.named(
          'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) '
          'VALUES (@uid, @h, @exp)',
        ),
        parameters: {'uid': userId, 'h': newHash, 'exp': newExpiresAt},
      );

      final userResult = await tx.execute(
        Sql.named(
          'SELECT u.id::text, u.company_id::text, u.email::text, u.password_hash, '
          '       u.full_name, u.role::text, '
          '       c.name AS company_name, '
          "       COALESCE(s.plan::text,   'free')   AS subscription_plan, "
          "       COALESCE(s.status::text, 'active') AS subscription_status "
          'FROM users u '
          'JOIN companies c ON c.id = u.company_id '
          'LEFT JOIN subscriptions s ON s.company_id = u.company_id '
          'WHERE u.id = @uid',
        ),
        parameters: {'uid': userId},
      );
      final row = userResult.first.toColumnMap();
      return _fromRow(row);
    });
  }

  Future<void> revokeRefreshToken(String plaintextToken) async {
    await _db.query(
      'UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = @h AND revoked_at IS NULL',
      parameters: {'h': _hash(plaintextToken)},
    );
  }

  static UserRecord _fromRow(Map<String, dynamic> row) => UserRecord(
    id:                 row['id'].toString(),
    companyId:          row['company_id'].toString(),
    email:              row['email'].toString(),
    passwordHash:       row['password_hash'].toString(),
    fullName:           row['full_name'].toString(),
    role:               row['role'].toString(),
    companyName:        row['company_name'].toString(),
    subscriptionPlan:   row['subscription_plan']?.toString()   ?? 'free',
    subscriptionStatus: row['subscription_status']?.toString() ?? 'active',
  );

  static String _hash(String plaintext) =>
      sha256.convert(utf8.encode(plaintext)).toString();
}
