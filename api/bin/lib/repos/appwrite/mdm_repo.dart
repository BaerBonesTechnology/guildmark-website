/// Appwrite implementation of MdmRepo — MDM connections (see
/// ../../../POSTGRES_TO_APPWRITE.md and mailing_list_repo.dart for the
/// reference pattern).
///
/// The public interface is IDENTICAL to the Postgres MdmRepo so the routes
/// that consume it don't change; only the constructor dependency
/// (AppwriteService instead of Db) and the bodies differ.
///
/// Credential blobs are stored AES-GCM encrypted. Postgres kept the cipher
/// and nonce as BYTEA; Appwrite has no binary column type, so they are stored
/// as base64 strings (`credentials_cipher_b64` / `credentials_nonce_b64`).
/// The public signature still takes raw bytes — base64 encoding happens at
/// this boundary. Callers remain responsible for the app-layer encryption
/// (see the TODO on the Postgres repo about lib/mdm/credentials.dart).
library;

import 'dart:convert';

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/models/mdm_connection.dart';

class MdmRepo {
  MdmRepo(this._aw);
  final AppwriteService _aw;

  TablesDB get _db => _aw.tablesDB;

  Future<List<MdmConnection>> findByCompany(String companyId) async {
    // A company has at most one connection per mdm_type (3 today), so a
    // single page is always enough.
    final res = await _db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.mdmConnections,
      queries: [
        Query.equal('company_id', companyId),
        Query.orderDesc(r'$createdAt'),
        Query.limit(100),
      ],
    );
    return res.rows.map(_toConnection).toList();
  }

  /// Persist a new MDM connection.
  ///
  /// [encryptedCredentials] and [nonce] must come from the credentials
  /// encryption helper. Raw plaintext credentials must never be passed here.
  ///
  /// The unique (company_id, mdm_type) index means each company can have at
  /// most one connection per MDM type. A conflict throws (AppwriteException
  /// 409) — same behavior as the Postgres unique violation.
  Future<MdmConnection> create({
    required String companyId,
    required String mdmType,
    required List<int> encryptedCredentials,
    required List<int> nonce,
  }) async {
    final row = await _db.createRow(
      databaseId: Aw.databaseId,
      tableId: Aw.mdmConnections,
      rowId: ID.unique(),
      data: {
        'company_id': companyId,
        'mdm_type': mdmType,
        // BYTEA → base64 strings at the boundary (§2 type conventions).
        'credentials_cipher_b64': base64Encode(encryptedCredentials),
        'credentials_nonce_b64': base64Encode(nonce),
      },
    );
    return _toConnection(row);
  }

  /// Remove a connection row. Validates company ownership so one company
  /// cannot delete another's connection.
  Future<void> delete({required String id, required String companyId}) async {
    try {
      final row = await _db.getRow(
        databaseId: Aw.databaseId,
        tableId: Aw.mdmConnections,
        rowId: id,
      );
      // WHERE company_id = @cid — ownership mismatch deletes nothing.
      if (row.data['company_id'] != companyId) return;
      await _db.deleteRow(
        databaseId: Aw.databaseId,
        tableId: Aw.mdmConnections,
        rowId: id,
      );
    } on AppwriteException catch (e) {
      // No-op if not found — idempotent deletes are fine; the resource is gone.
      if (e.code == 404) return;
      rethrow;
    }
  }

  /// Update sync status fields after a sync run completes.
  ///
  /// Called by the sync job worker, not from HTTP routes directly.
  Future<void> recordSyncResult({
    required String id,
    required String status,
    String? error,
    int? deviceCount,
  }) async {
    try {
      await _db.updateRow(
        databaseId: Aw.databaseId,
        tableId: Aw.mdmConnections,
        rowId: id,
        data: {
          'last_sync_at': DateTime.now().toUtc().toIso8601String(),
          'last_sync_status': status,
          // Postgres set last_sync_error unconditionally (clears on success).
          'last_sync_error': error,
          // COALESCE(@deviceCount, device_count) — only send when provided.
          if (deviceCount != null) 'device_count': deviceCount,
        },
      );
    } on AppwriteException catch (e) {
      if (e.code == 404) return; // UPDATE matched 0 rows — no-op like PG
      rethrow;
    }
  }

  MdmConnection _toConnection(Row row) {
    final d = row.data;
    final lastSync = d['last_sync_at'] as String?;
    return MdmConnection(
      id: row.$id,
      companyId: d['company_id'] as String,
      mdmType: d['mdm_type'] as String,
      syncEnabled: (d['sync_enabled'] as bool?) ?? true,
      createdAt: DateTime.parse(row.$createdAt),
      lastSyncAt: lastSync == null ? null : DateTime.parse(lastSync),
      lastSyncStatus: d['last_sync_status'] as String?,
      deviceCount: (d['device_count'] as num?)?.toInt(),
    );
  }
}
