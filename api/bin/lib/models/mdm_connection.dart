import 'package:freezed_annotation/freezed_annotation.dart';

import 'json_helpers.dart';

part 'mdm_connection.freezed.dart';
part 'mdm_connection.g.dart';

@freezed
abstract class MdmConnection with _$MdmConnection {
  const MdmConnection._();

  const factory MdmConnection({
    required String id,
    required String companyId,
    required String mdmType,
    required bool syncEnabled,
    @IsoDateTimeConverter() required DateTime createdAt,
    @NullableIsoDateTimeConverter() DateTime? lastSyncAt,
    String? lastSyncStatus,
    int? deviceCount,
  }) = _MdmConnection;

  factory MdmConnection.fromJson(Map<String, dynamic> json) =>
      _$MdmConnectionFromJson(json);

  factory MdmConnection.fromRow(Map<String, dynamic> row) => MdmConnection(
    id: row['id'] as String,
    companyId: row['company_id'] as String,
    mdmType: enumStr(row['mdm_type']),
    syncEnabled: row['sync_enabled'] as bool,
    createdAt: row['created_at'] as DateTime,
    lastSyncAt: row['last_sync_at'] as DateTime?,
    lastSyncStatus: enumStrOrNull(row['last_sync_status']),
    deviceCount: numToIntOrNull(row['device_count']),
  );
}
