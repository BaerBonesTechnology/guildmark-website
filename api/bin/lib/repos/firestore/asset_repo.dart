/// Firestore-backed repository retaining the existing API contract.
/// Multi-step business workflows still require their own concurrency controls.
library;

import 'package:guildmark_api/firebase/firestore.dart';

import 'package:guildmark_api/firebase/collections.dart';
import 'package:guildmark_api/models/asset.dart';
import 'package:guildmark_api/repos/firestore/amps_inventory_repo.dart';
import 'package:guildmark_api/models/json_helpers.dart';
import 'package:guildmark_api/models/paginated.dart';

class AmpsAssetFilters {
  AmpsAssetFilters({
    this.assetType,
    this.conditionGrade,
    this.search,
    this.filter, // e.g. "aging" — assets > 36 months old
    this.page = 1,
    this.pageSize = 50,
  });

  final String? assetType;
  final String? conditionGrade;
  final String? search;
  final String? filter;
  final int page;
  final int pageSize;
}

class AssetRepo {
  AssetRepo(this._aw);
  final FirebaseService _aw;

  TablesDB get _db => _aw.tablesDB;

  /// Manual /assets endpoint: a flat list for one company.
  Future<List<Asset>> findByCompany(String companyId) async {
    final rows = await _listAll([
      Query.equal('company_id', companyId),
      Query.orderDesc(r'$createdAt'),
    ]);
    return rows.where((r) => r.data['archived'] != true).map(_fromRow).toList();
  }

  /// AMPS inventory: paginated, filterable, searchable.
  ///
  /// Page the complete company inventory before applying archive and display
  /// filters; no adapter materialization cap may silently omit owned assets.
  Future<PaginatedResponse<Asset>> searchAmps({
    required String companyId,
    required AmpsAssetFilters filters,
  }) async {
    final all = await findByCompany(companyId);
    final cutoff = DateTime.now().subtract(const Duration(days: 1096));
    final matched = all
        .where(
          (a) =>
              (filters.assetType == null || a.assetType == filters.assetType) &&
              (filters.conditionGrade == null ||
                  a.conditionGrade == filters.conditionGrade) &&
              (filters.search == null ||
                  a.modelName.toLowerCase().contains(
                    filters.search!.toLowerCase(),
                  )) &&
              (filters.filter != 'aging' ||
                  (a.purchaseDate ?? a.createdAt).isBefore(cutoff)),
        )
        .toList();
    return PaginatedResponse.paginate(
      data: matched
          .skip((filters.page - 1) * filters.pageSize)
          .take(filters.pageSize)
          .toList(),
      total: matched.length,
      page: filters.page,
      pageSize: filters.pageSize,
    );
  }

  /// Create a new manual asset record and return the persisted row.
  Future<Asset> create({
    required String companyId,
    required String modelName,
    required String assetType,
    required String conditionGrade,
    required int quantity,
    String? reasonForOffload,
    double? ramGb,
    double? storageGb,
    int? cpuScore,
    String? serialNumber,
    String? department,
    // ── Marketplace device-spec fields ─────────────────────────────────────
    String? manufacturer,
    String? modelNumber,
    int? yearOfManufacture,
    String? functionalStatus,
    String? knownDefects,
    String? dataWipeStatus,
    String? warrantyStatus,
    DateTime? warrantyExpiration,
    String? includedAccessories,
    String? shipsFromLocation,
    String? cpuModel,
    int? cpuCores,
    double? cpuSpeedGhz,
    String? ramType,
    String? storageType,
    String? gpuModel,
    double? screenSizeIn,
    String? screenResolution,
    bool? touchscreen,
    String? formFactor,
    int? powerSupplyWatts,
    String? panelType,
    int? refreshRateHz,
    String? ports,
    int? portCount,
    String? throughput,
    bool? managed,
    bool? carrierLocked,
  }) async {
    // Generate the row id client-side so a missing serial can be replaced
    // with a per-row placeholder that satisfies the unique index
    // (company_id, mdm_source, serial_number) without colliding the way
    // repeated NULLs would.

    try {
      final row = (await AmpsInventoryRepo(_aw).createRows(companyId, [
        {
          'company_id': companyId,
          'mdm_source': 'manual',
          'model_name': modelName,
          'asset_type': assetType,
          'condition_grade': conditionGrade,
          'quantity': quantity,
          'reason_for_offload': reasonForOffload,
          'ram_gb': ramGb,
          'storage_gb': storageGb,
          'cpu_score': cpuScore?.toDouble(),
          'serial_number': serialNumber,
          'department': department,
          // Device-spec fields — only sent when provided so enum columns fall
          // back to their schema defaults rather than being nulled out.
          'manufacturer': ?manufacturer,
          'model_number': ?modelNumber,
          'year_of_manufacture': ?yearOfManufacture,
          'functional_status': ?functionalStatus,
          'known_defects': ?knownDefects,
          'data_wipe_status': ?dataWipeStatus,
          'warranty_status': ?warrantyStatus,
          'warranty_expiration': ?warrantyExpiration?.toUtc().toIso8601String(),
          'included_accessories': ?includedAccessories,
          'ships_from_location': ?shipsFromLocation,
          'cpu_model': ?cpuModel,
          'cpu_cores': ?cpuCores,
          'cpu_speed_ghz': ?cpuSpeedGhz,
          'ram_type': ?ramType,
          'storage_type': ?storageType,
          'gpu_model': ?gpuModel,
          'screen_size_in': ?screenSizeIn,
          'screen_resolution': ?screenResolution,
          'touchscreen': ?touchscreen,
          'form_factor': ?formFactor,
          'power_supply_watts': ?powerSupplyWatts,
          'panel_type': ?panelType,
          'refresh_rate_hz': ?refreshRateHz,
          'ports': ?ports,
          'port_count': ?portCount,
          'throughput': ?throughput,
          'managed': ?managed,
          'carrier_locked': ?carrierLocked,
        },
      ], requirePaid: false)).single;
      return _fromRow(row);
    } on DatastoreException catch (e) {
      // Unique-index race on (company_id, mdm_source, serial_number) — the
      // Postgres version surfaced a unique violation; translate to a
      // StateError with an explanatory message.
      if (e.code == 409) {
        throw StateError(
          'Asset with serial number $serialNumber already exists for company '
          '$companyId',
        );
      }
      rethrow;
    }
  }

  /// Single asset detail (validates company ownership).
  Future<Asset?> findById({
    required String id,
    required String companyId,
  }) async {
    try {
      final row = await _db.getRow(
        databaseId: Collections.databaseId,
        tableId: Collections.assets,
        rowId: id,
      );
      if (row.data['company_id'] != companyId || row.data['archived'] == true) {
        return null;
      }
      return _fromRow(row);
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /// Page through every row matching [queries] (Appwrite caps single pages).
  Future<List<Row>> _listAll(List<String> queries) async {
    const pageSize = 100;
    final rows = <Row>[];
    var offset = 0;
    while (true) {
      final res = await _db.listRows(
        databaseId: Collections.databaseId,
        tableId: Collections.assets,
        queries: [...queries, Query.limit(pageSize), Query.offset(offset)],
      );
      rows.addAll(res.rows);
      if (res.rows.length < pageSize) break;
      offset += pageSize;
    }
    return rows;
  }

  Asset _fromRow(Row row) {
    final d = row.data;
    return Asset(
      id: row.$id,
      companyId: d['company_id'] as String,
      mdmSource: (d['mdm_source'] as String?) ?? 'manual',
      modelName: d['model_name'] as String,
      assetType: d['asset_type'] as String,
      conditionGrade: (d['condition_grade'] as String?) ?? 'B',
      quantity: numToIntOrNull(d['quantity']) ?? 1,
      createdAt: DateTime.parse(row.$createdAt),
      updatedAt: DateTime.parse(row.$updatedAt),
      serialNumber: _publicSerial(row),
      reasonForOffload: d['reason_for_offload'] as String?,
      purchaseDate: _dt(d['purchase_date']),
      originalPurchasePrice: _centsToDollars(
        d['original_purchase_price_cents'],
      ),
      osVersion: d['os_version'] as String?,
      batteryHealthPct: numToDoubleOrNull(d['battery_health_pct']),
      batteryCycles: numToIntOrNull(d['battery_cycles']),
      complianceState: d['compliance_state'] as String?,
      assignedUser: d['assigned_user'] as String?,
      department: d['department'] as String?,
      costCenter: d['cost_center'] as String?,
      lastMdmSync: _dt(d['last_mdm_sync']),
      cpuScore: numToDoubleOrNull(d['cpu_score']),
      ramGb: numToDoubleOrNull(d['ram_gb']),
      storageGb: numToDoubleOrNull(d['storage_gb']),
      manufacturer: d['manufacturer'] as String?,
      modelNumber: d['model_number'] as String?,
      yearOfManufacture: numToIntOrNull(d['year_of_manufacture']),
      functionalStatus: d['functional_status'] as String?,
      knownDefects: d['known_defects'] as String?,
      dataWipeStatus: d['data_wipe_status'] as String?,
      warrantyStatus: d['warranty_status'] as String?,
      warrantyExpiration: _dt(d['warranty_expiration']),
      includedAccessories: d['included_accessories'] as String?,
      shipsFromLocation: d['ships_from_location'] as String?,
      cpuModel: d['cpu_model'] as String?,
      cpuCores: numToIntOrNull(d['cpu_cores']),
      cpuSpeedGhz: numToDoubleOrNull(d['cpu_speed_ghz']),
      ramType: d['ram_type'] as String?,
      storageType: d['storage_type'] as String?,
      gpuModel: d['gpu_model'] as String?,
      screenSizeIn: numToDoubleOrNull(d['screen_size_in']),
      screenResolution: d['screen_resolution'] as String?,
      touchscreen: d['touchscreen'] as bool?,
      formFactor: d['form_factor'] as String?,
      powerSupplyWatts: numToIntOrNull(d['power_supply_watts']),
      panelType: d['panel_type'] as String?,
      refreshRateHz: numToIntOrNull(d['refresh_rate_hz']),
      ports: d['ports'] as String?,
      portCount: numToIntOrNull(d['port_count']),
      throughput: d['throughput'] as String?,
      managed: d['managed'] as bool?,
      carrierLocked: d['carrier_locked'] as bool?,
    );
  }

  /// Map the synthesized `manual-<rowId>` placeholder back to null so callers
  /// see the same shape the Postgres repo produced (NULL serial for manual
  /// entries). Real serials — even ones starting with "manual-" — are
  /// untouched because the placeholder embeds this exact row's id.
  static String? _publicSerial(Row row) {
    final serial = row.data['serial_number'] as String?;
    if (serial == 'manual-${row.$id}') return null;
    return serial;
  }
}

double? _centsToDollars(Object? cents) =>
    cents == null ? null : (cents as num) / 100.0;

DateTime? _dt(Object? iso) =>
    iso == null ? null : DateTime.parse(iso as String);
