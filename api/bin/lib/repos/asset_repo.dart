/// Assets data-access. Handles both manual entries and MDM-synced records.
library;

import '../db/pool.dart';
import '../models/asset.dart';
import '../models/paginated.dart';

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
  AssetRepo(this._db);
  final Db _db;

  /// Shared SELECT columns for the assets table.
  static const _cols = '''
    id, company_id, mdm_source, serial_number, model_name, asset_type,
    condition_grade, quantity, reason_for_offload, purchase_date,
    original_purchase_price, os_version, battery_health_pct, battery_cycles,
    compliance_state, assigned_user, department, cost_center, last_mdm_sync,
    cpu_score, ram_gb, storage_gb, created_at, updated_at
  ''';

  /// Manual /assets endpoint: a flat list for one company.
  Future<List<Asset>> findByCompany(String companyId) async {
    final result = await _db.query(
      'SELECT $_cols FROM assets WHERE company_id = @cid ORDER BY created_at DESC',
      parameters: {'cid': companyId},
    );
    return result.map((r) => Asset.fromRow(r.toColumnMap())).toList();
  }

  /// AMPS inventory: paginated, filterable, searchable.
  ///
  /// Builds the WHERE clause dynamically so that unset filters add no
  /// predicates, which keeps the query plan simple and avoids COALESCE tricks
  /// that confuse the planner.
  Future<PaginatedResponse<Asset>> searchAmps({
    required String companyId,
    required AmpsAssetFilters filters,
  }) async {
    final where = StringBuffer('WHERE a.company_id = @cid');
    final params = <String, Object?>{'cid': companyId};

    if (filters.assetType != null) {
      where.write(' AND a.asset_type = @assetType::asset_type');
      params['assetType'] = filters.assetType;
    }
    if (filters.conditionGrade != null) {
      where.write(' AND a.condition_grade = @condGrade::condition_grade');
      params['condGrade'] = filters.conditionGrade;
    }
    if (filters.search != null && filters.search!.isNotEmpty) {
      where.write(' AND a.model_name ILIKE @search');
      params['search'] = '%${filters.search}%';
    }
    if (filters.filter == 'aging') {
      // Assets whose purchase date is more than 36 months ago, or that have
      // no purchase date but were created more than 36 months ago.
      where.write('''
        AND (
          (a.purchase_date IS NOT NULL AND a.purchase_date < now() - INTERVAL '36 months')
          OR (a.purchase_date IS NULL   AND a.created_at  < now() - INTERVAL '36 months')
        )
      ''');
    }

    final offset = (filters.page - 1) * filters.pageSize;
    params['limit']  = filters.pageSize;
    params['offset'] = offset;

    final countResult = await _db.query(
      'SELECT COUNT(*) AS n FROM assets a $where',
      parameters: params,
    );
    final total = (countResult.first.toColumnMap()['n'] as int?) ?? 0;

    final rows = await _db.query(
      'SELECT a.$_cols FROM assets a $where ORDER BY a.created_at DESC LIMIT @limit OFFSET @offset',
      parameters: params,
    );

    return PaginatedResponse.paginate(
      data:     rows.map((r) => Asset.fromRow(r.toColumnMap())).toList(),
      total:    total,
      page:     filters.page,
      pageSize: filters.pageSize,
    );
  }

  /// Single asset detail (validates company ownership).
  Future<Asset?> findById({required String id, required String companyId}) async {
    final result = await _db.query(
      'SELECT $_cols FROM assets WHERE id = @id AND company_id = @cid LIMIT 1',
      parameters: {'id': id, 'cid': companyId},
    );
    if (result.isEmpty) return null;
    return Asset.fromRow(result.first.toColumnMap());
  }
}
