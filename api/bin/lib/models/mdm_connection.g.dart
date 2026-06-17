// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mdm_connection.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_MdmConnection _$MdmConnectionFromJson(Map<String, dynamic> json) =>
    _MdmConnection(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      mdmType: json['mdm_type'] as String,
      syncEnabled: json['sync_enabled'] as bool,
      createdAt: const IsoDateTimeConverter().fromJson(
        json['created_at'] as String,
      ),
      lastSyncAt: const NullableIsoDateTimeConverter().fromJson(
        json['last_sync_at'] as String?,
      ),
      lastSyncStatus: json['last_sync_status'] as String?,
      deviceCount: (json['device_count'] as num?)?.toInt(),
    );

Map<String, dynamic> _$MdmConnectionToJson(_MdmConnection instance) =>
    <String, dynamic>{
      'id': instance.id,
      'company_id': instance.companyId,
      'mdm_type': instance.mdmType,
      'sync_enabled': instance.syncEnabled,
      'created_at': const IsoDateTimeConverter().toJson(instance.createdAt),
      'last_sync_at': ?const NullableIsoDateTimeConverter().toJson(
        instance.lastSyncAt,
      ),
      'last_sync_status': ?instance.lastSyncStatus,
      'device_count': ?instance.deviceCount,
    };
