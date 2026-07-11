/// Appwrite implementation of AssetRepo — same public interface as the
/// Postgres version (lib/repos/asset_repo.dart) so routes switch by changing
/// only the import (see ../../../POSTGRES_TO_APPWRITE.md §4).
///
/// Conventions:
///   - `created_at`/`updated_at` → system `$createdAt`/`$updatedAt`.
///   - money: `original_purchase_price_cents` (int) ↔ dollars (double) at the
///     boundary.
///   - The `(company_id, mdm_source, serial_number)` unique index does not
///     treat NULL serials as distinct the way Postgres does, so manual
///     entries without a serial get a per-row placeholder `manual-<rowId>`
///     (see the note in tool/appwrite_setup.dart). The placeholder is mapped
///     back to null on read so the model shape matches the Postgres repo.
library;

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/models/asset.dart';
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
  final AppwriteService _aw;

  TablesDB get _db => _aw.tablesDB;

  /// Manual /assets endpoint: a flat list for one company.
  Future<List<Asset>> findByCompany(String companyId) async {
    final rows = await _listAll([
      Query.equal('company_id', companyId),
      Query.orderDesc(r'$createdAt'),
    ]);
    return rows.map(_fromRow).toList();
  }

  /// AMPS inventory: paginated, filterable, searchable.
  ///
  /// All predicates live on the assets table, so this stays a single
  /// server-side query; `RowList.total` replaces the SQL COUNT(*).
  Future<PaginatedResponse<Asset>> searchAmps({
    required String companyId,
    required AmpsAssetFilters filters,
  }) async {
    // "36 months ago" — calendar months, like Postgres INTERVAL '36 months'.
    final now = DateTime.now().toUtc();
    final agingCutoff = DateTime.utc(
      now.year,
      now.month - 36,
      now.day,
      now.hour,
      now.minute,
      now.second,
    ).toIso8601String();

    final queries = <String>[
      Query.equal('company_id', companyId),
      if (filters.assetType != null)
        Query.equal('asset_type', filters.assetType),
      if (filters.conditionGrade != null)
        Query.equal('condition_grade', filters.conditionGrade),
      if (filters.search != null && filters.search!.isNotEmpty)
        // ILIKE '%search%' → contains (case-insensitive on the default
        // MariaDB collation Appwrite uses).
        Query.contains('model_name', filters.search),
      if (filters.filter == 'aging')
        Query.or([
          // lessThan on a null column never matches, mirroring SQL NULL
          // comparison semantics — no explicit isNotNull needed.
          Query.lessThan('purchase_date', agingCutoff),
          Query.and([
            Query.isNull('purchase_date'),
            Query.lessThan(r'$createdAt', agingCutoff),
          ]),
        ]),
      Query.orderDesc(r'$createdAt'),
      Query.limit(filters.pageSize),
      Query.offset((filters.page - 1) * filters.pageSize),
    ];

    final res = await _db.listRows(
      databaseId: Aw.databaseId,
      tableId: Aw.assets,
      queries: queries,
    );

    return PaginatedResponse.paginate(
      data: res.rows.map(_fromRow).toList(),
      total: res.total,
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
    final rowId = ID.unique();

    try {
      final row = await _db.createRow(
        databaseId: Aw.databaseId,
        tableId: Aw.assets,
        rowId: rowId,
        data: {
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
          'serial_number': serialNumber ?? 'manual-$rowId',
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
      );
      return _fromRow(row);
    } on AppwriteException catch (e) {
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
        databaseId: Aw.databaseId,
        tableId: Aw.assets,
        rowId: id,
      );
      if (row.data['company_id'] != companyId) return null;
      return _fromRow(row);
    } on AppwriteException catch (e) {
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
        databaseId: Aw.databaseId,
        tableId: Aw.assets,
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
      originalPurchasePrice:
          _centsToDollars(d['original_purchase_price_cents']),
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
