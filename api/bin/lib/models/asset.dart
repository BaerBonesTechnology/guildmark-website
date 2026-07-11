/// Asset model — mirrors the `Asset` interface in src/app/lib/types.ts.
///
/// Two factory paths:
///   - `Asset.fromJson(Map)` — used by the HTTP layer; expects ISO date
///     strings, plain JSON numbers/booleans.
///   - `Asset.fromRow(Map)`  — used by repos; expects DateTime objects and
///     `num` from the postgres package.
///
/// Run `dart run build_runner build` to regenerate `.freezed.dart` / `.g.dart`.
library;

import 'package:freezed_annotation/freezed_annotation.dart';

import 'json_helpers.dart';

part 'asset.freezed.dart';
part 'asset.g.dart';

@Freezed()
abstract class Asset with _$Asset {
  const Asset._();

  const factory Asset({
    required String id,
    required String companyId,
    required String mdmSource,
    required String modelName,
    required String assetType,
    required String conditionGrade,
    required int    quantity,
    @IsoDateTimeConverter()      required DateTime createdAt,
    @IsoDateTimeConverter()      required DateTime updatedAt,
    String?  serialNumber,
    String?  reasonForOffload,
    @NullableDateOnlyConverter()      DateTime? purchaseDate,
    double?  originalPurchasePrice,
    String?  osVersion,
    double?  batteryHealthPct,
    int?     batteryCycles,
    String?  complianceState,
    String?  assignedUser,
    String?  department,
    String?  costCenter,
    @NullableIsoDateTimeConverter()   DateTime? lastMdmSync,
    double?  cpuScore,
    double?  ramGb,
    double?  storageGb,
    // ── Marketplace device-spec fields (buyer-facing listing detail) ────────
    String?  manufacturer,
    String?  modelNumber,
    int?     yearOfManufacture,
    String?  functionalStatus,
    String?  knownDefects,
    String?  dataWipeStatus,
    String?  warrantyStatus,
    @NullableIsoDateTimeConverter()   DateTime? warrantyExpiration,
    String?  includedAccessories,
    String?  shipsFromLocation,
    String?  cpuModel,
    int?     cpuCores,
    double?  cpuSpeedGhz,
    String?  ramType,
    String?  storageType,
    String?  gpuModel,
    double?  screenSizeIn,
    String?  screenResolution,
    bool?    touchscreen,
    String?  formFactor,
    int?     powerSupplyWatts,
    String?  panelType,
    int?     refreshRateHz,
    String?  ports,
    int?     portCount,
    String?  throughput,
    bool?    managed,
    bool?    carrierLocked,
  }) = _Asset;

  factory Asset.fromJson(Map<String, dynamic> json) => _$AssetFromJson(json);

  /// Build directly from a Postgres row map. Date columns come back as
  /// `DateTime` already; numerics as `num`.
  factory Asset.fromRow(Map<String, dynamic> row) => Asset(
        id:                    row['id']                    as String,
        companyId:             row['company_id']            as String,
        mdmSource:             enumStr(row['mdm_source']),
        modelName:             row['model_name']            as String,
        assetType:             enumStr(row['asset_type']),
        conditionGrade:        enumStr(row['condition_grade']),
        quantity:              numToIntOrNull(row['quantity']) ?? 1,
        createdAt:             row['created_at']            as DateTime,
        updatedAt:             row['updated_at']            as DateTime,
        serialNumber:          row['serial_number']         as String?,
        reasonForOffload:      row['reason_for_offload']    as String?,
        purchaseDate:          row['purchase_date']         as DateTime?,
        originalPurchasePrice: numToDoubleOrNull(row['original_purchase_price']),
        osVersion:             row['os_version']            as String?,
        batteryHealthPct:      numToDoubleOrNull(row['battery_health_pct']),
        batteryCycles:         numToIntOrNull(row['battery_cycles']),
        complianceState:       row['compliance_state']      as String?,
        assignedUser:          row['assigned_user']         as String?,
        department:            row['department']            as String?,
        costCenter:            row['cost_center']           as String?,
        lastMdmSync:           row['last_mdm_sync']         as DateTime?,
        cpuScore:              numToDoubleOrNull(row['cpu_score']),
        ramGb:                 numToDoubleOrNull(row['ram_gb']),
        storageGb:             numToDoubleOrNull(row['storage_gb']),
        manufacturer:          row['manufacturer']          as String?,
        modelNumber:           row['model_number']          as String?,
        yearOfManufacture:     numToIntOrNull(row['year_of_manufacture']),
        functionalStatus:      enumStrOrNull(row['functional_status']),
        knownDefects:          row['known_defects']         as String?,
        dataWipeStatus:        enumStrOrNull(row['data_wipe_status']),
        warrantyStatus:        enumStrOrNull(row['warranty_status']),
        warrantyExpiration:    row['warranty_expiration']   as DateTime?,
        includedAccessories:   row['included_accessories']  as String?,
        shipsFromLocation:     row['ships_from_location']   as String?,
        cpuModel:              row['cpu_model']             as String?,
        cpuCores:              numToIntOrNull(row['cpu_cores']),
        cpuSpeedGhz:           numToDoubleOrNull(row['cpu_speed_ghz']),
        ramType:               row['ram_type']              as String?,
        storageType:           enumStrOrNull(row['storage_type']),
        gpuModel:              row['gpu_model']             as String?,
        screenSizeIn:          numToDoubleOrNull(row['screen_size_in']),
        screenResolution:      row['screen_resolution']     as String?,
        touchscreen:           row['touchscreen']           as bool?,
        formFactor:            row['form_factor']           as String?,
        powerSupplyWatts:      numToIntOrNull(row['power_supply_watts']),
        panelType:             row['panel_type']            as String?,
        refreshRateHz:         numToIntOrNull(row['refresh_rate_hz']),
        ports:                 row['ports']                 as String?,
        portCount:             numToIntOrNull(row['port_count']),
        throughput:            row['throughput']            as String?,
        managed:               row['managed']               as bool?,
        carrierLocked:         row['carrier_locked']        as bool?,
      );
}
