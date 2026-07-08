/// One-shot Postgres → Appwrite data backfill (big-bang cutover, step 2 of
/// api/POSTGRES_TO_APPWRITE.md §6). Run AFTER `tool/appwrite_setup.dart` has
/// created every table/column/index.
///
/// Conventions applied per row (design doc §2):
///   - `$id`           → the Postgres UUID with hyphens stripped (`awId`), so
///                       every FK string survives the move without remapping.
///   - FK columns      → also passed through `awId`.
///   - NUMERIC money   → integer cents: `(value * 100).round()`.
///   - NUMERIC ratios  → double (non-money only).
///   - TIMESTAMPTZ/DATE→ ISO-8601 UTC strings.
///   - BYTEA           → base64 strings (mdm credentials cipher/nonce).
///   - created_at / updated_at → NOT copied. `$createdAt`/`$updatedAt` are
///     system-managed and reflect backfill time; the original timestamps are
///     lost. Acceptable per the design doc (they were audit sugar, not logic).
///
/// Special cases:
///   - platform_config  → singleton: UPDATE the seeded `config` row.
///   - orders           → 0005 fee columns live on the same PG table and are
///                        embedded in the Appwrite row (direct copy).
///   - partner_service_assignments → seed rows carry the nil UUID
///                        (00000000-…) or NULL as partner_id → written null.
///   - assets           → NULL serial_number → 'manual-<$id>' placeholder so
///                        the (company_id, mdm_source, serial_number) unique
///                        index tolerates multiple manual rows per company.
///   - employee_group_members → composite PG PK (no UUID id); a deterministic
///                        `$id` is derived from both FKs.
///
/// Idempotent: re-running skips rows that already exist (409 → "skipped").
///
/// Usage:
///   DATABASE_URL=postgres://… APPWRITE_PROJECT_ID=… APPWRITE_API_KEY=… \
///     dart run tool/backfill_postgres_to_appwrite.dart
library;

import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:dart_appwrite/dart_appwrite.dart';

import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/db/pool.dart';

const int _pageSize = 500;
const String _nilUuid = '00000000-0000-0000-0000-000000000000';

late final Db _pg;
late final TablesDB _aw;

Future<void> main() async {
  final databaseUrl = _require('DATABASE_URL');
  final endpoint = Platform.environment['APPWRITE_ENDPOINT'] ??
      'http://localhost:8444/v1';
  final projectId = _require('APPWRITE_PROJECT_ID');
  final apiKey = _require('APPWRITE_API_KEY');

  _pg = await Db.connect(databaseUrl);
  final client = Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
  _aw = TablesDB(client);

  var anyMismatch = false;
  for (final table in _tables) {
    final ok = await _migrateTable(table);
    if (!ok) anyMismatch = true;
  }

  await _pg.close();
  if (anyMismatch) {
    stderr.writeln('[backfill] FINISHED WITH MISMATCHES — see lines above.');
    exit(1);
  }
  stdout.writeln('[backfill] done — all table counts verified.');
}

// ═══════════════════════════════════════════════════════════════════════════
// Generic runner
// ═══════════════════════════════════════════════════════════════════════════

/// Migrates one table and returns true when the final counts match.
Future<bool> _migrateTable(_Table t) async {
  final pgCount = await _pgCount(t.pgTable);
  stdout.writeln('[backfill] ${t.pgTable} → ${t.tableId} ($pgCount rows)');

  var written = 0;
  var skipped = 0;
  var failed = 0;

  for (var offset = 0;; offset += _pageSize) {
    final page = await _pg.query(
      '${t.select} LIMIT @limit OFFSET @offset',
      parameters: {'limit': _pageSize, 'offset': offset},
    );
    if (page.isEmpty) break;

    for (final r in page) {
      final row = r.toColumnMap();
      final rowId = t.rowId(row);
      final data = t.transform(row);
      try {
        if (t.singletonRowId != null) {
          // platform_config: the setup script already seeded the row; carry
          // the live Postgres values over onto it.
          await _updateOrCreate(t.tableId, t.singletonRowId!, data);
        } else {
          await _aw.createRow(
            databaseId: Aw.databaseId,
            tableId: t.tableId,
            rowId: rowId,
            data: data,
          );
        }
        written++;
      } on AppwriteException catch (e) {
        if (e.code == 409) {
          skipped++; // already migrated on a previous run
        } else {
          failed++;
          stderr.writeln(
            '[backfill]   ${t.tableId}/$rowId FAILED: ${e.code} ${e.message}',
          );
        }
      }
    }

    stdout.writeln(
      '[backfill]   … ${offset + page.length}/$pgCount '
      '(written $written, skipped $skipped, failed $failed)',
    );
    if (page.length < _pageSize) break;
  }

  // Count verification (design doc §6 step 3).
  final awTotal = (await _aw.listRows(
    databaseId: Aw.databaseId,
    tableId: t.tableId,
    queries: [Query.limit(1)],
  ))
      .total;
  final ok = awTotal == pgCount;
  stdout.writeln(
    ok
        ? '[backfill]   ✓ ${t.tableId}: appwrite $awTotal == postgres $pgCount'
        : '[backfill]   MISMATCH ${t.tableId}: '
            'appwrite $awTotal != postgres $pgCount',
  );
  return ok;
}

Future<void> _updateOrCreate(
  String tableId,
  String rowId,
  Map<String, dynamic> data,
) async {
  try {
    await _aw.updateRow(
      databaseId: Aw.databaseId,
      tableId: tableId,
      rowId: rowId,
      data: data,
    );
  } on AppwriteException catch (e) {
    if (e.code != 404) rethrow;
    // Setup seed missing — create the singleton instead.
    await _aw.createRow(
      databaseId: Aw.databaseId,
      tableId: tableId,
      rowId: rowId,
      data: data,
    );
  }
}

Future<int> _pgCount(String table) async {
  final res = await _pg.query('SELECT count(*)::int AS n FROM $table');
  return res.first.toColumnMap()['n']! as int;
}

// ═══════════════════════════════════════════════════════════════════════════
// Value converters
// ═══════════════════════════════════════════════════════════════════════════

/// Required FK / UUID → hyphen-stripped `$id` string.
String _fk(Object? v) => awId(v! as String);

/// Nullable FK.
String? _fkOpt(Object? v) => v == null ? null : awId(v as String);

/// Nullable FK where the nil UUID is a "no parent" placeholder (0015 seeds).
String? _fkOrNil(Object? v) {
  if (v == null) return null;
  final s = v as String;
  return s == _nilUuid ? null : awId(s);
}

/// NUMERIC money (dollars) → integer cents. package:postgres returns NUMERIC
/// as String; NUMERIC(12,2)*100 fits comfortably in a double's exact range.
int? _cents(Object? v) =>
    v == null ? null : (double.parse(v.toString()) * 100).round();

/// NUMERIC ratio/percentage (non-money) → double.
double? _dbl(Object? v) => v == null ? null : double.parse(v.toString());

/// INT / BIGINT / NUMERIC-that-should-be-int → int.
int? _asInt(Object? v) {
  if (v == null) return null;
  if (v is int) return v;
  return double.parse(v.toString()).round();
}

/// TIMESTAMPTZ / DATE → ISO-8601 UTC string (DATE decodes as midnight UTC).
String? _iso(Object? v) =>
    v == null ? null : (v as DateTime).toUtc().toIso8601String();

/// BYTEA → base64 string. Binary protocol yields bytes; text protocol yields
/// a `\x…` hex literal — handle both.
String _b64(Object? v) {
  if (v is Uint8List) return base64Encode(v);
  if (v is List<int>) return base64Encode(Uint8List.fromList(v));
  final s = v!.toString();
  if (s.startsWith(r'\x')) {
    final hex = s.substring(2);
    final bytes = Uint8List(hex.length ~/ 2);
    for (var i = 0; i < bytes.length; i++) {
      bytes[i] = int.parse(hex.substring(i * 2, i * 2 + 2), radix: 16);
    }
    return base64Encode(bytes);
  }
  return s; // already text (unexpected, but don't corrupt it)
}

String _defaultRowId(Map<String, dynamic> row) => awId(row['id'] as String);

// ═══════════════════════════════════════════════════════════════════════════
// Table specs — dependency order (parents first, §6). Enum + citext columns
// are cast to ::text in SQL so package:postgres always yields plain strings.
// ═══════════════════════════════════════════════════════════════════════════

class _Table {
  const _Table({
    required this.pgTable,
    required this.tableId,
    required this.select,
    required this.transform,
    this.rowId = _defaultRowId,
    this.singletonRowId,
  });

  /// Source Postgres table (also used for COUNT verification).
  final String pgTable;

  /// Target Appwrite table id.
  final String tableId;

  /// SELECT with a stable ORDER BY; the runner appends LIMIT/OFFSET.
  final String select;

  /// Source row (column map) → Appwrite row data (no `$id`).
  final Map<String, dynamic> Function(Map<String, dynamic> row) transform;

  /// Source row → Appwrite `$id`.
  final String Function(Map<String, dynamic> row) rowId;

  /// When set, updateRow(this id) instead of createRow (platform_config).
  final String? singletonRowId;
}

final List<_Table> _tables = [
  _Table(
    pgTable: 'companies',
    tableId: Aw.companies,
    select: 'SELECT id, name, size_band, industry, square_customer_id, '
        'valuation_status, valuation_started_at, valuation_asset_count '
        'FROM companies ORDER BY id',
    transform: (r) => {
      'name': r['name'],
      'size_band': r['size_band'],
      'industry': r['industry'],
      'square_customer_id': r['square_customer_id'],
      'valuation_status': r['valuation_status'],
      'valuation_started_at': _iso(r['valuation_started_at']),
      'valuation_asset_count': _asInt(r['valuation_asset_count']),
    },
  ),
  _Table(
    pgTable: 'users',
    tableId: Aw.users,
    select: 'SELECT id, company_id, email::text AS email, password_hash, '
        'full_name, role::text AS role FROM users ORDER BY id',
    transform: (r) => {
      'company_id': _fk(r['company_id']),
      'email': r['email'],
      'password_hash': r['password_hash'],
      'full_name': r['full_name'],
      'role': r['role'],
    },
  ),
  _Table(
    pgTable: 'refresh_tokens',
    tableId: Aw.refreshTokens,
    select: 'SELECT id, user_id, token_hash, expires_at, revoked_at '
        'FROM refresh_tokens ORDER BY id',
    transform: (r) => {
      'user_id': _fk(r['user_id']),
      'token_hash': r['token_hash'],
      'expires_at': _iso(r['expires_at']),
      'revoked_at': _iso(r['revoked_at']),
    },
  ),
  _Table(
    pgTable: 'subscriptions',
    tableId: Aw.subscriptions,
    select: 'SELECT id, company_id, plan::text AS plan, '
        'status::text AS status, square_subscription_id, '
        'current_period_start, current_period_end, cancelled_at '
        'FROM subscriptions ORDER BY id',
    transform: (r) => {
      'company_id': _fk(r['company_id']),
      'plan': r['plan'],
      'status': r['status'],
      'square_subscription_id': r['square_subscription_id'],
      'current_period_start': _iso(r['current_period_start']),
      'current_period_end': _iso(r['current_period_end']),
      'cancelled_at': _iso(r['cancelled_at']),
    },
  ),
  _Table(
    pgTable: 'assets',
    tableId: Aw.assets,
    select: 'SELECT id, company_id, mdm_source::text AS mdm_source, '
        'serial_number, model_name, asset_type::text AS asset_type, '
        'condition_grade::text AS condition_grade, quantity, '
        'reason_for_offload, purchase_date, original_purchase_price, '
        'os_version, battery_health_pct, battery_cycles, compliance_state, '
        'assigned_user, department, cost_center, last_mdm_sync, cpu_score, '
        'ram_gb, storage_gb FROM assets ORDER BY id',
    transform: (r) => {
      'company_id': _fk(r['company_id']),
      'mdm_source': r['mdm_source'],
      // PG treats NULL serials as distinct under the composite unique index;
      // Appwrite does not — synthesize the repos' per-row placeholder.
      'serial_number':
          r['serial_number'] ?? 'manual-${awId(r['id'] as String)}',
      'model_name': r['model_name'],
      'asset_type': r['asset_type'],
      'condition_grade': r['condition_grade'],
      'quantity': _asInt(r['quantity']),
      'reason_for_offload': r['reason_for_offload'],
      'purchase_date': _iso(r['purchase_date']),
      'original_purchase_price_cents': _cents(r['original_purchase_price']),
      'os_version': r['os_version'],
      'battery_health_pct': _dbl(r['battery_health_pct']),
      'battery_cycles': _asInt(r['battery_cycles']),
      'compliance_state': r['compliance_state'],
      'assigned_user': r['assigned_user'],
      'department': r['department'],
      'cost_center': r['cost_center'],
      'last_mdm_sync': _iso(r['last_mdm_sync']),
      'cpu_score': _dbl(r['cpu_score']),
      // 0008 widened these to NUMERIC — floats (not money)
      'ram_gb': _dbl(r['ram_gb']),
      'storage_gb': _dbl(r['storage_gb']),
    },
  ),
  _Table(
    pgTable: 'listings',
    tableId: Aw.listings,
    select: 'SELECT id, asset_id, company_id, listed_price, '
        'seller_offer_price, buyer_ask_price, gross_margin, '
        'consumer_market_anchor, fair_market_value, est_book_value, '
        'seller_recovery_ratio, depreciation_pct, age_months, '
        'valuation_flag::text AS valuation_flag, status::text AS status, '
        'last_valued_at FROM listings ORDER BY id',
    transform: (r) => {
      'asset_id': _fk(r['asset_id']),
      'company_id': _fk(r['company_id']),
      'listed_price_cents': _cents(r['listed_price']),
      'seller_offer_price_cents': _cents(r['seller_offer_price']),
      'buyer_ask_price_cents': _cents(r['buyer_ask_price']),
      'gross_margin_cents': _cents(r['gross_margin']),
      'consumer_market_anchor_cents': _cents(r['consumer_market_anchor']),
      'fair_market_value_cents': _cents(r['fair_market_value']),
      'est_book_value_cents': _cents(r['est_book_value']),
      'seller_recovery_ratio': _dbl(r['seller_recovery_ratio']),
      'depreciation_pct': _dbl(r['depreciation_pct']),
      'age_months': _asInt(r['age_months']),
      'valuation_flag': r['valuation_flag'],
      'status': r['status'],
      'last_valued_at': _iso(r['last_valued_at']),
    },
  ),
  _Table(
    pgTable: 'buyer_offers',
    tableId: Aw.buyerOffers,
    select: 'SELECT id, listing_id, buyer_company_id, offer_price, quantity, '
        'status::text AS status, counter_price, message, expires_at '
        'FROM buyer_offers ORDER BY id',
    transform: (r) => {
      'listing_id': _fk(r['listing_id']),
      'buyer_company_id': _fk(r['buyer_company_id']),
      'offer_price_cents': _cents(r['offer_price']),
      'quantity': _asInt(r['quantity']),
      'status': r['status'],
      'counter_price_cents': _cents(r['counter_price']),
      'message': r['message'],
      'expires_at': _iso(r['expires_at']),
    },
  ),
  // orders: 0005 fee columns live on the same PG table; Appwrite embeds them
  // in the orders row (order_fees never existed as a separate table) — copy.
  _Table(
    pgTable: 'orders',
    tableId: Aw.orders,
    select: 'SELECT id, offer_id, seller_company_id, buyer_company_id, '
        'amount, quantity, escrow_transaction_id, escrow_status, '
        'escrow_payment_url, carrier, tracking_number, shipped_at, '
        'delivered_at, inspection_ends_at, status::text AS status, '
        'completed_at, seller_fee_pct, seller_fee, buyer_fee_pct, buyer_fee, '
        'platform_fee, escrow_amount, payment_terms, deferral_fee_pct, '
        'deferral_fee, payment_due_at FROM orders ORDER BY id',
    transform: (r) => {
      'offer_id': _fk(r['offer_id']),
      'seller_company_id': _fk(r['seller_company_id']),
      'buyer_company_id': _fk(r['buyer_company_id']),
      'amount_cents': _cents(r['amount']),
      'quantity': _asInt(r['quantity']),
      'escrow_transaction_id': r['escrow_transaction_id'],
      'escrow_status': r['escrow_status'],
      'escrow_payment_url': r['escrow_payment_url'],
      'carrier': r['carrier'],
      'tracking_number': r['tracking_number'],
      'shipped_at': _iso(r['shipped_at']),
      'delivered_at': _iso(r['delivered_at']),
      'inspection_ends_at': _iso(r['inspection_ends_at']),
      'status': r['status'],
      'completed_at': _iso(r['completed_at']),
      // 0005 fee snapshot — pct ratios → float, money → cents
      'seller_fee_pct': _dbl(r['seller_fee_pct']),
      'seller_fee_cents': _cents(r['seller_fee']),
      'buyer_fee_pct': _dbl(r['buyer_fee_pct']),
      'buyer_fee_cents': _cents(r['buyer_fee']),
      'platform_fee_cents': _cents(r['platform_fee']),
      'escrow_amount_cents': _cents(r['escrow_amount']),
      'payment_terms': r['payment_terms'],
      'deferral_fee_pct': _dbl(r['deferral_fee_pct']),
      'deferral_fee_cents': _cents(r['deferral_fee']),
      'payment_due_at': _iso(r['payment_due_at']),
    },
  ),
  _Table(
    pgTable: 'subscription_invoices',
    tableId: Aw.subscriptionInvoices,
    select: 'SELECT id, company_id, subscription_id, square_payment_id, '
        'plan::text AS plan, amount_cents, currency::text AS currency, '
        'status, receipt_url, period_start, period_end '
        'FROM subscription_invoices ORDER BY id',
    transform: (r) => {
      'company_id': _fk(r['company_id']),
      'subscription_id': _fk(r['subscription_id']),
      'square_payment_id': r['square_payment_id'],
      'plan': r['plan'],
      'amount_cents': _asInt(r['amount_cents']),
      // CHAR(3) pads with spaces — trim defensively.
      'currency': (r['currency'] as String).trim(),
      'status': r['status'],
      'receipt_url': r['receipt_url'],
      'period_start': _iso(r['period_start']),
      'period_end': _iso(r['period_end']),
    },
  ),
  _Table(
    pgTable: 'mdm_connections',
    tableId: Aw.mdmConnections,
    select: 'SELECT id, company_id, mdm_type::text AS mdm_type, sync_enabled, '
        'credentials_cipher, credentials_nonce, last_sync_at, '
        'last_sync_status::text AS last_sync_status, last_sync_error, '
        'device_count FROM mdm_connections ORDER BY id',
    transform: (r) => {
      'company_id': _fk(r['company_id']),
      'mdm_type': r['mdm_type'],
      'sync_enabled': r['sync_enabled'],
      // BYTEA → base64 (design doc §2)
      'credentials_cipher_b64': _b64(r['credentials_cipher']),
      'credentials_nonce_b64': _b64(r['credentials_nonce']),
      'last_sync_at': _iso(r['last_sync_at']),
      'last_sync_status': r['last_sync_status'],
      'last_sync_error': r['last_sync_error'],
      'device_count': _asInt(r['device_count']),
    },
  ),
  // tax_invoices.generated_at is not copied — like created_at it becomes the
  // system $createdAt (original generation time is lost; per design doc).
  _Table(
    pgTable: 'tax_invoices',
    tableId: Aw.taxInvoices,
    select: 'SELECT id, company_id, asset_id, invoice_number, '
        'invoice_type::text AS invoice_type, invoice_date, '
        'asset_description, serial_number, original_cost, '
        'book_value_at_disposal, market_value_at_disposal, write_off_amount, '
        'market_anchor_ebay, pdf_storage_path FROM tax_invoices ORDER BY id',
    transform: (r) => {
      'company_id': _fk(r['company_id']),
      'asset_id': _fkOpt(r['asset_id']),
      'invoice_number': r['invoice_number'],
      'invoice_type': r['invoice_type'],
      'invoice_date': _iso(r['invoice_date']),
      'asset_description': r['asset_description'],
      'serial_number': r['serial_number'],
      'original_cost_cents': _cents(r['original_cost']),
      'book_value_at_disposal_cents': _cents(r['book_value_at_disposal']),
      'market_value_at_disposal_cents': _cents(r['market_value_at_disposal']),
      'write_off_amount_cents': _cents(r['write_off_amount']),
      'market_anchor_ebay_cents': _cents(r['market_anchor_ebay']),
      'pdf_storage_path': r['pdf_storage_path'],
    },
  ),
  _Table(
    pgTable: 'valuation_snapshots',
    tableId: Aw.valuationSnapshots,
    select: 'SELECT id, company_id, snapshot_date, total_portfolio_value, '
        'total_book_value, total_depreciation, total_devices '
        'FROM valuation_snapshots ORDER BY id',
    transform: (r) => {
      'company_id': _fk(r['company_id']),
      'snapshot_date': _iso(r['snapshot_date']),
      'total_portfolio_value_cents': _cents(r['total_portfolio_value']),
      'total_book_value_cents': _cents(r['total_book_value']),
      'total_depreciation_cents': _cents(r['total_depreciation']),
      'total_devices': _asInt(r['total_devices']),
    },
  ),
  _Table(
    pgTable: 'asset_valuations',
    tableId: Aw.assetValuations,
    select: 'SELECT id, asset_id, listing_id, source::text AS source, '
        'model_name, asset_type, condition_grade, age_months, '
        'fair_market_value, confidence, model_version, listed_price, '
        'price_to_fmv_ratio FROM asset_valuations ORDER BY id',
    transform: (r) => {
      'asset_id': _fk(r['asset_id']),
      'listing_id': _fkOpt(r['listing_id']),
      'source': r['source'],
      'model_name': r['model_name'],
      'asset_type': r['asset_type'],
      'condition_grade': r['condition_grade'],
      'age_months': _asInt(r['age_months']),
      'fair_market_value_cents': _cents(r['fair_market_value']),
      'confidence': _dbl(r['confidence']),
      'model_version': r['model_version'],
      'listed_price_cents': _cents(r['listed_price']),
      'price_to_fmv_ratio': _dbl(r['price_to_fmv_ratio']),
    },
  ),
  _Table(
    pgTable: 'mailing_list',
    tableId: Aw.mailingList,
    select: 'SELECT id, email::text AS email, source, notes, contacted_at '
        'FROM mailing_list ORDER BY id',
    transform: (r) => {
      'email': r['email'],
      'source': r['source'],
      'notes': r['notes'],
      'contacted_at': _iso(r['contacted_at']),
    },
  ),
  // platform_config: PG singleton (id = 1) → Appwrite singleton row seeded by
  // appwrite_setup.dart. Update it in place rather than creating a new row.
  _Table(
    pgTable: 'platform_config',
    tableId: Aw.platformConfig,
    singletonRowId: Aw.platformConfigRowId,
    rowId: (_) => Aw.platformConfigRowId,
    select: 'SELECT id, seller_fee_free, seller_fee_starter, '
        'seller_fee_growth, seller_fee_pro, buyer_fee, deferral_fee, '
        'data_wipe_price, payment_terms_enabled, updated_by '
        'FROM platform_config ORDER BY id',
    transform: (r) => {
      // Fee ratios (not money) → float
      'seller_fee_free': _dbl(r['seller_fee_free']),
      'seller_fee_starter': _dbl(r['seller_fee_starter']),
      'seller_fee_growth': _dbl(r['seller_fee_growth']),
      'seller_fee_pro': _dbl(r['seller_fee_pro']),
      'buyer_fee': _dbl(r['buyer_fee']),
      'deferral_fee': _dbl(r['deferral_fee']),
      // USD per unit → cents
      'data_wipe_price_cents': _cents(r['data_wipe_price']),
      'payment_terms_enabled': r['payment_terms_enabled'],
      'updated_by': r['updated_by'],
    },
  ),
  _Table(
    pgTable: 'guildmark_employees',
    tableId: Aw.guildmarkEmployees,
    select: 'SELECT id, email::text AS email, password_hash, full_name, '
        'role::text AS role, is_active, last_login_at '
        'FROM guildmark_employees ORDER BY id',
    transform: (r) => {
      'email': r['email'],
      'password_hash': r['password_hash'],
      'full_name': r['full_name'],
      'role': r['role'],
      'is_active': r['is_active'],
      'last_login_at': _iso(r['last_login_at']),
    },
  ),
  _Table(
    pgTable: 'employee_groups',
    tableId: Aw.employeeGroups,
    select: 'SELECT id, name, description FROM employee_groups ORDER BY id',
    transform: (r) => {
      'name': r['name'],
      'description': r['description'],
    },
  ),
  // employee_group_members has a composite PG PK (group_id, employee_id) and
  // no UUID of its own. Derive a deterministic $id from the halves of both
  // stripped UUIDs (16+1+16 = 33 chars, within Appwrite's 36-char limit;
  // collision odds are negligible and idempotency is preserved across runs).
  _Table(
    pgTable: 'employee_group_members',
    tableId: Aw.employeeGroupMembers,
    select: 'SELECT group_id, employee_id FROM employee_group_members '
        'ORDER BY group_id, employee_id',
    rowId: (r) {
      final g = awId(r['group_id'] as String);
      final e = awId(r['employee_id'] as String);
      return '${g.substring(0, 16)}_${e.substring(0, 16)}';
    },
    transform: (r) => {
      'group_id': _fk(r['group_id']),
      'employee_id': _fk(r['employee_id']),
    },
  ),
  _Table(
    pgTable: 'employee_invites',
    tableId: Aw.employeeInvites,
    select: 'SELECT id, email::text AS email, role::text AS role, '
        'invited_by, token_hash, expires_at, accepted_at '
        'FROM employee_invites ORDER BY id',
    transform: (r) => {
      'email': r['email'],
      'role': r['role'],
      'invited_by': _fkOpt(r['invited_by']),
      'token_hash': r['token_hash'],
      'expires_at': _iso(r['expires_at']),
      'accepted_at': _iso(r['accepted_at']),
    },
  ),
  _Table(
    pgTable: 'employee_passkeys',
    tableId: Aw.employeePasskeys,
    select: 'SELECT id, employee_id, credential_id, public_key_x, '
        'public_key_y, sign_count, aaguid, friendly_name, last_used_at '
        'FROM employee_passkeys ORDER BY id',
    transform: (r) => {
      'employee_id': _fk(r['employee_id']),
      'credential_id': r['credential_id'],
      'public_key_x': r['public_key_x'],
      'public_key_y': r['public_key_y'],
      'sign_count': _asInt(r['sign_count']),
      'aaguid': r['aaguid'],
      'friendly_name': r['friendly_name'],
      'last_used_at': _iso(r['last_used_at']),
    },
  ),
  _Table(
    pgTable: 'employee_passkey_challenges',
    tableId: Aw.employeePasskeyChallenges,
    select: 'SELECT id, employee_id, challenge, type, expires_at '
        'FROM employee_passkey_challenges ORDER BY id',
    transform: (r) => {
      'employee_id': _fkOpt(r['employee_id']),
      'challenge': r['challenge'],
      'type': r['type'],
      'expires_at': _iso(r['expires_at']),
    },
  ),
  _Table(
    pgTable: 'password_reset_tokens',
    tableId: Aw.passwordResetTokens,
    select: 'SELECT id, user_id, token_hash, expires_at, used_at '
        'FROM password_reset_tokens ORDER BY id',
    transform: (r) => {
      'user_id': _fk(r['user_id']),
      'token_hash': r['token_hash'],
      'expires_at': _iso(r['expires_at']),
      'used_at': _iso(r['used_at']),
    },
  ),
  _Table(
    pgTable: 'partners',
    tableId: Aw.partners,
    select: 'SELECT id, company_name, email::text AS email, password_hash, '
        'partner_code, service_radius_miles, city, state, status, rating, '
        'total_jobs_completed, available_balance, square_customer_id '
        'FROM partners ORDER BY id',
    transform: (r) => {
      'company_name': r['company_name'],
      'email': r['email'],
      'password_hash': r['password_hash'],
      'partner_code': r['partner_code'],
      'service_radius_miles': _asInt(r['service_radius_miles']),
      'city': r['city'],
      'state': r['state'],
      'status': r['status'],
      // NUMERIC(3,2) rating is a score, not money → float
      'rating': _dbl(r['rating']),
      'total_jobs_completed': _asInt(r['total_jobs_completed']),
      'available_balance_cents': _cents(r['available_balance']),
      'square_customer_id': r['square_customer_id'],
    },
  ),
  _Table(
    pgTable: 'partner_refresh_tokens',
    tableId: Aw.partnerRefreshTokens,
    select: 'SELECT id, partner_id, token_hash, expires_at, revoked_at '
        'FROM partner_refresh_tokens ORDER BY id',
    transform: (r) => {
      'partner_id': _fk(r['partner_id']),
      'token_hash': r['token_hash'],
      'expires_at': _iso(r['expires_at']),
      'revoked_at': _iso(r['revoked_at']),
    },
  ),
  _Table(
    pgTable: 'partner_reset_tokens',
    tableId: Aw.partnerResetTokens,
    select: 'SELECT id, partner_id, token_hash, expires_at, used_at '
        'FROM partner_reset_tokens ORDER BY id',
    transform: (r) => {
      'partner_id': _fk(r['partner_id']),
      'token_hash': r['token_hash'],
      'expires_at': _iso(r['expires_at']),
      'used_at': _iso(r['used_at']),
    },
  ),
  _Table(
    pgTable: 'partner_service_assignments',
    tableId: Aw.partnerServiceAssignments,
    select: 'SELECT id, partner_id, order_id, order_ref, buyer_name, '
        'buyer_city, service_type, item_count, wipe_payout_cents, '
        'reimage_payout_cents, wipe_method, reimage_os, cert_url, '
        'tracking_number, carrier, status::text AS status, claimed_at, '
        'completed_at FROM partner_service_assignments ORDER BY id',
    transform: (r) => {
      // 0015 seed/workboard rows use the nil UUID (or NULL) as "unclaimed" —
      // there is no partner to reference, so write null.
      'partner_id': _fkOrNil(r['partner_id']),
      'order_id': _fkOpt(r['order_id']),
      'order_ref': r['order_ref'],
      'buyer_name': r['buyer_name'],
      'buyer_city': r['buyer_city'],
      'service_type': r['service_type'],
      'item_count': _asInt(r['item_count']),
      'wipe_payout_cents': _asInt(r['wipe_payout_cents']),
      'reimage_payout_cents': _asInt(r['reimage_payout_cents']),
      'wipe_method': r['wipe_method'],
      'reimage_os': r['reimage_os'],
      'cert_url': r['cert_url'],
      'tracking_number': r['tracking_number'],
      'carrier': r['carrier'],
      'status': r['status'],
      'claimed_at': _iso(r['claimed_at']),
      'completed_at': _iso(r['completed_at']),
    },
  ),
  _Table(
    pgTable: 'partner_payouts',
    tableId: Aw.partnerPayouts,
    select: 'SELECT id, partner_id, payout_ref, amount_cents, method, '
        'status, paid_at FROM partner_payouts ORDER BY id',
    transform: (r) => {
      'partner_id': _fk(r['partner_id']),
      'payout_ref': r['payout_ref'],
      'amount_cents': _asInt(r['amount_cents']),
      'method': r['method'],
      'status': r['status'],
      'paid_at': _iso(r['paid_at']),
    },
  ),
];

// ═══════════════════════════════════════════════════════════════════════════
// Env helpers
// ═══════════════════════════════════════════════════════════════════════════

String _require(String key) {
  final v = Platform.environment[key];
  if (v == null || v.isEmpty) {
    stderr.writeln('Missing required env var: $key');
    exit(1);
  }
  return v;
}
