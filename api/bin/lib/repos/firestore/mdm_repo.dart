/// Firestore-backed repository retaining the existing API contract.
/// Multi-step business workflows still require their own concurrency controls.
library;

import 'dart:convert';

import 'package:guildmark_api/firebase/firestore.dart';

import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/models/mdm_connection.dart';

class MdmRepo {
  MdmRepo(this._aw);
  final FirebaseService _aw;

  TablesDB get _db => _aw.tablesDB;

  Future<List<MdmConnection>> findByCompany(String companyId) async {
    // A company has at most one connection per mdm_type (3 today), so a
    // single page is always enough.
    final res = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.mdmConnections,
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
  /// most one connection per MDM type. A conflict throws (DatastoreException
  /// 409) — same behavior as the Postgres unique violation.
  Future<MdmConnection> create({
    required String companyId,
    required String mdmType,
    required List<int> encryptedCredentials,
    required List<int> nonce,
  }) async {
    final row = await _db.createRow(
      databaseId: Collections.databaseId,
      tableId: Collections.mdmConnections,
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
        databaseId: Collections.databaseId,
        tableId: Collections.mdmConnections,
        rowId: id,
      );
      // WHERE company_id = @cid — ownership mismatch deletes nothing.
      if (row.data['company_id'] != companyId) return;
      await _db.deleteRow(
        databaseId: Collections.databaseId,
        tableId: Collections.mdmConnections,
        rowId: id,
      );
    } on DatastoreException catch (e) {
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
        databaseId: Collections.databaseId,
        tableId: Collections.mdmConnections,
        rowId: id,
        data: {
          'last_sync_at': DateTime.now().toUtc().toIso8601String(),
          'last_sync_status': status,
          // Postgres set last_sync_error unconditionally (clears on success).
          'last_sync_error': error,
          // COALESCE(@deviceCount, device_count) — only send when provided.
          'device_count': ?deviceCount,
        },
      );
    } on DatastoreException catch (e) {
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
