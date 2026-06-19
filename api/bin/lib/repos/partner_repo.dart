import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:postgres/postgres.dart';

import 'package:guildmark_api/db/pool.dart';

class PartnerRecord {
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
  PartnerRepo(this._db);
  final Db _db;

  Future<PartnerRecord?> findByEmail(String email) async {
    final result = await _db.query(
      '''
      SELECT id::text, email::text, password_hash,
             company_name, partner_code, status::text,
             rating::float8, total_jobs_completed,
             available_balance::float8, city, state
      FROM partners
      WHERE email = @email
      LIMIT 1
      ''',
      parameters: {'email': email},
    );
    if (result.isEmpty) return null;
    return _fromRow(result.first.toColumnMap());
  }

  Future<PartnerRecord?> findById(String id) async {
    final result = await _db.query(
      '''
      SELECT id::text, email::text, password_hash,
             company_name, partner_code, status::text,
             rating::float8, total_jobs_completed,
             available_balance::float8, city, state
      FROM partners
      WHERE id = @id
      LIMIT 1
      ''',
      parameters: {'id': id},
    );
    if (result.isEmpty) return null;
    return _fromRow(result.first.toColumnMap());
  }

  Future<void> insertRefreshToken({
    required String partnerId,
    required String plaintextToken,
    required DateTime expiresAt,
  }) async {
    final hash = _hash(plaintextToken);
    await _db.query(
      'INSERT INTO partner_refresh_tokens (partner_id, token_hash, expires_at) '
      'VALUES (@pid, @hash, @exp)',
      parameters: {'pid': partnerId, 'hash': hash, 'exp': expiresAt},
    );
  }

  Future<PartnerRecord?> rotateRefreshToken({
    required String plaintextToken,
    required String newPlaintextToken,
    required DateTime newExpiresAt,
  }) async {
    final oldHash = _hash(plaintextToken);
    final newHash = _hash(newPlaintextToken);

    return _db.tx<PartnerRecord?>((tx) async {
      final lookup = await tx.execute(
        Sql.named(
          'SELECT partner_id::text FROM partner_refresh_tokens '
          'WHERE token_hash = @h AND revoked_at IS NULL AND expires_at > now() '
          'FOR UPDATE',
        ),
        parameters: {'h': oldHash},
      );
      if (lookup.isEmpty) return null;
      final partnerId = lookup.first.toColumnMap()['partner_id'].toString();

      await tx.execute(
        Sql.named(
          'UPDATE partner_refresh_tokens SET revoked_at = now() WHERE token_hash = @h',
        ),
        parameters: {'h': oldHash},
      );
      await tx.execute(
        Sql.named(
          'INSERT INTO partner_refresh_tokens (partner_id, token_hash, expires_at) '
          'VALUES (@pid, @h, @exp)',
        ),
        parameters: {'pid': partnerId, 'h': newHash, 'exp': newExpiresAt},
      );

      final partnerResult = await tx.execute(
        Sql.named(
          'SELECT id::text, email::text, password_hash, '
          '       company_name, partner_code, status::text, '
          '       rating::float8, total_jobs_completed, '
          '       available_balance::float8, city, state '
          'FROM partners WHERE id = @id',
        ),
        parameters: {'id': partnerId},
      );
      if (partnerResult.isEmpty) return null;
      return _fromRow(partnerResult.first.toColumnMap());
    });
  }

  Future<void> revokeRefreshToken(String plaintextToken) async {
    await _db.query(
      'UPDATE partner_refresh_tokens SET revoked_at = now() '
      'WHERE token_hash = @h AND revoked_at IS NULL',
      parameters: {'h': _hash(plaintextToken)},
    );
  }

  static PartnerRecord _fromRow(Map<String, dynamic> row) => PartnerRecord(
    id: row['id'].toString(),
    email: row['email'].toString(),
    passwordHash: row['password_hash'].toString(),
    companyName: row['company_name'].toString(),
    partnerCode: row['partner_code'].toString(),
    status: row['status'].toString(),
    rating: (row['rating'] as num?)?.toDouble() ?? 5.0,
    totalJobsCompleted: (row['total_jobs_completed'] as num?)?.toInt() ?? 0,
    availableBalance: (row['available_balance'] as num?)?.toDouble() ?? 0.0,
    city: row['city']?.toString(),
    state: row['state']?.toString(),
  );

  static String _hash(String plaintext) =>
      sha256.convert(utf8.encode(plaintext)).toString();
}
