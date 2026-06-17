import '../db/pool.dart';
import '../models/mdm_connection.dart';

const _mdmCols = '''
  id, company_id, mdm_type, sync_enabled, last_sync_at, last_sync_status,
  device_count, created_at
''';

class MdmRepo {
  MdmRepo(this._db);
  final Db _db;

  Future<List<MdmConnection>> findByCompany(String companyId) async {
    final result = await _db.query(
      'SELECT $_mdmCols FROM mdm_connections WHERE company_id = @cid ORDER BY created_at DESC',
      parameters: {'cid': companyId},
    );
    return result.map((r) => MdmConnection.fromRow(r.toColumnMap())).toList();
  }

  Future<MdmConnection> create({
    required String companyId,
    required String mdmType,
    required List<int> encryptedCredentials,
    required List<int> nonce,
  }) async {
    final result = await _db.query(
      '''
      INSERT INTO mdm_connections (company_id, mdm_type, credentials_cipher, credentials_nonce)
      VALUES (@cid, @mdmType::mdm_type, @cipher, @nonce)
      RETURNING $_mdmCols
      ''',
      parameters: {
        'cid': companyId,
        'mdmType': mdmType,
        'cipher': encryptedCredentials,
        'nonce': nonce,
      },
    );
    return MdmConnection.fromRow(result.first.toColumnMap());
  }

  Future<void> delete({required String id, required String companyId}) async {
    await _db.query(
      'DELETE FROM mdm_connections WHERE id = @id AND company_id = @cid',
      parameters: {'id': id, 'cid': companyId},
    );
    // No-op if not found — idempotent deletes are fine; the resource is gone.
  }

  Future<void> recordSyncResult({
    required String id,
    required String status,
    String? error,
    int? deviceCount,
  }) async {
    await _db.query(
      '''
      UPDATE mdm_connections
      SET last_sync_at     = now(),
          last_sync_status = @status::mdm_sync_status,
          last_sync_error  = @error,
          device_count     = COALESCE(@deviceCount, device_count)
      WHERE id = @id
      ''',
      parameters: {
        'id': id,
        'status': status,
        'error': error,
        'deviceCount': deviceCount,
      },
    );
  }
}
