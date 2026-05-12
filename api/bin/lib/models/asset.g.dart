// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'asset.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AssetImpl _$$AssetImplFromJson(Map<String, dynamic> json) => _$AssetImpl(
      id: json['id'] as String,
      companyId: json['company_id'] as String,
      mdmSource: json['mdm_source'] as String,
      modelName: json['model_name'] as String,
      assetType: json['asset_type'] as String,
      conditionGrade: json['condition_grade'] as String,
      quantity: (json['quantity'] as num).toInt(),
      createdAt:
          const IsoDateTimeConverter().fromJson(json['created_at'] as String),
      updatedAt:
          const IsoDateTimeConverter().fromJson(json['updated_at'] as String),
      serialNumber: json['serial_number'] as String?,
      reasonForOffload: json['reason_for_offload'] as String?,
      purchaseDate: const NullableDateOnlyConverter()
          .fromJson(json['purchase_date'] as String?),
      originalPurchasePrice:
          (json['original_purchase_price'] as num?)?.toDouble(),
      osVersion: json['os_version'] as String?,
      batteryHealthPct: (json['battery_health_pct'] as num?)?.toDouble(),
      batteryCycles: (json['battery_cycles'] as num?)?.toInt(),
      complianceState: json['compliance_state'] as String?,
      assignedUser: json['assigned_user'] as String?,
      department: json['department'] as String?,
      costCenter: json['cost_center'] as String?,
      lastMdmSync: const NullableIsoDateTimeConverter()
          .fromJson(json['last_mdm_sync'] as String?),
      cpuScore: (json['cpu_score'] as num?)?.toDouble(),
      ramGb: (json['ram_gb'] as num?)?.toDouble(),
      storageGb: (json['storage_gb'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$$AssetImplToJson(_$AssetImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'company_id': instance.companyId,
      'mdm_source': instance.mdmSource,
      'model_name': instance.modelName,
      'asset_type': instance.assetType,
      'condition_grade': instance.conditionGrade,
      'quantity': instance.quantity,
      'created_at': const IsoDateTimeConverter().toJson(instance.createdAt),
      'updated_at': const IsoDateTimeConverter().toJson(instance.updatedAt),
      if (instance.serialNumber case final value?) 'serial_number': value,
      if (instance.reasonForOffload case final value?)
        'reason_for_offload': value,
      if (const NullableDateOnlyConverter().toJson(instance.purchaseDate)
          case final value?)
        'purchase_date': value,
      if (instance.originalPurchasePrice case final value?)
        'original_purchase_price': value,
      if (instance.osVersion case final value?) 'os_version': value,
      if (instance.batteryHealthPct case final value?)
        'battery_health_pct': value,
      if (instance.batteryCycles case final value?) 'battery_cycles': value,
      if (instance.complianceState case final value?) 'compliance_state': value,
      if (instance.assignedUser case final value?) 'assigned_user': value,
      if (instance.department case final value?) 'department': value,
      if (instance.costCenter case final value?) 'cost_center': value,
      if (const NullableIsoDateTimeConverter().toJson(instance.lastMdmSync)
          case final value?)
        'last_mdm_sync': value,
      if (instance.cpuScore case final value?) 'cpu_score': value,
      if (instance.ramGb case final value?) 'ram_gb': value,
      if (instance.storageGb case final value?) 'storage_gb': value,
    };
