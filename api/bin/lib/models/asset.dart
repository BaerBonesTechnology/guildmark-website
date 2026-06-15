/// Asset model — mirrors the `Asset` interface in src/app/lib/types.ts.
///
/// Two factory paths:
///   - `Asset.fromJson(Map)` — used by the HTTP layer; expects ISO date
///     strings, plain JSON numbers/booleans.
///   - `Asset.fromRow(Map)`  — used by repos; expects DateTime objects and
///     `num` from the postgres package.
///
/// Run `dart run build_runner build` to regenerate `.freezed.dart` / `.g.dart`.

import 'package:freezed_annotation/freezed_annotation.dart';

import 'json_helpers.dart';

part 'asset.freezed.dart';
part 'asset.g.dart';

@Freezed()
class Asset with _$Asset {
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
   