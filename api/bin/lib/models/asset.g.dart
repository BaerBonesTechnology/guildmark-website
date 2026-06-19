// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'asset.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Asset _$AssetFromJson(Map<String, dynamic> json) => _Asset(
  id: json['id'] as String,
  companyId: json['company_id'] as String,
  mdmSource: json['mdm_source'] as String,
  modelName: json['model_name'] as String,
  assetType: json['asset_type'] as String,
  conditionGrade: json['condition_grade'] as String,
  quantity: (json['quantity'] as num).toInt(),
  createdAt: const IsoDateTimeConverter().fromJson(
    json['created_at'] as String,
  ),
  updatedAt: const IsoDateTimeConverter().fromJson(
    json['updated_at'] as String,
  ),
  serialNumber: json['serial_number'] as String?,
  reasonForOffload: json['reason_for_offload'] as String?,
  purchaseDate: const NullableDateOnlyConverter().fromJson(
    json['purchase_date'] as String?,
  ),
  originalPurchasePrice: (json['original_purchase_price'] as num?)?.toDouble(),
  osVersion: json['os_version'] as String?,
  batteryHealthPct: (json['battery_health_pct'] as num?)?.toDouble(),
  batteryCycles: (json['battery_cycles'] as num?)?.toInt(),
  complianceState: json['compliance_state'] as String?,
  assignedUser: json['assigned_user'] as String?,
  department: json['department'] as String?,
  costCenter: json['cost_center'] as String?,
  lastMdmSync: const NullableIsoDateTimeConverter().fromJson(
    json['last_mdm_sync'] as String?,
  ),
  cpuScore: (json['cpu_score'] as num?)?.toDouble(),
  ramGb: (json['ram_gb'] as num?)?.toDouble(),
  storageGb: (json['storage_gb'] as num?)?.toDouble(),
);

Map<String, dynamic> _$AssetToJson(_Asset instance) => <String, dynamic>{
  'id': instance.id,
  'company_id': instance.companyId,
  'mdm_source': instance.mdmSource,
  'model_name': instance.modelName,
  'asset_type': instance.assetType,
  'condition_grade': instance.conditionGrade,
  'quantity': instance.quantity,
  'created_at': const IsoDateTimeConverter().toJson(instance.createdAt),
  'updated_at': const IsoDateTimeConverter().toJson(instance.updatedAt),
  'serial_number': ?instance.serialNumber,
  'reason_for_offload': ?instance.reasonForOffload,
  'purchase_date': ?const NullableDateOnlyConverter().toJson(
    instance.purchaseDate,
  ),
  'original_purchase_price': ?instance.originalPurchasePrice,
  'os_version': ?instance.osVersion,
  'battery_health_pct': ?instance.batteryHealthPct,
  'battery_cycles': ?instance.batteryCycles,
  'compliance_state': ?instance.complianceState,
  'assigned_user': ?instance.assignedUser,
  'department': ?instance.department,
  'cost_center': ?instance.costCenter,
  'last_mdm_sync': ?const NullableIsoDateTimeConverter().toJson(
    instance.lastMdmSync,
  ),
  'cpu_score': ?instance.cpuScore,
  'ram_gb': ?instance.ramGb,
  'storage_gb': ?instance.storageGb,
};
