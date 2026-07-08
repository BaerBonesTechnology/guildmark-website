/// Idempotent Appwrite schema setup — creates the `guildmark` database and
/// every table, column, and index the API needs (the full collection map from
/// api/POSTGRES_TO_APPWRITE.md §3, i.e. migrations 0001–0017 translated).
///
/// Conventions (see the design doc):
///   - money       → integer cents (`*_cents`), never float
///   - ratios/pcts → float (non-money only)
///   - enums       → enum columns with the same elements as the PG enum
///   - FKs         → plain string columns holding the parent `$id` + key index
///   - NOT NULL DEFAULT x → xrequired: false + xdefault (Appwrite forbids
///     defaults on required columns)
///   - created_at/updated_at → system `$createdAt`/`$updatedAt`
///
/// Safe to re-run: every call swallows 409 "already exists".
///
/// Usage:
///   doppler run -- dart run tool/appwrite_setup.dart
library;

import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/enums.dart';

import 'package:guildmark_api/appwrite/collections.dart';

late final TablesDB _db;

/// Index specs are registered while columns are being created and applied in
/// a second pass — Appwrite processes new columns asynchronously, so indexes
/// on just-created columns fail until the columns become `available`.
final List<_IndexSpec> _pendingIndexes = [];

Future<void> main() async {
  final endpoint = _env(
    'APPWRITE_ENDPOINT',
    fallback: 'http://localhost:8444/v1',
  );
  final projectId = _require('APPWRITE_PROJECT_ID');
  final apiKey = _require('APPWRITE_API_KEY');

  final client = Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
  _db = TablesDB(client);

  await _ensureDatabase(Aw.databaseId, 'GuildMark');

  // ── Pass 1: tables + columns ─────────────────────────────────────────────
  await _setupCompanies();
  await _setupUsers();
  await _setupRefreshTokens();
  await _setupAssets();
  await _setupListings();
  await _setupBuyerOffers();
  await _setupMdmConnections();
  await _setupTaxInvoices();
  await _setupValuationSnapshots();
  await _setupMailingList();
  await _setupOrders();
  await _setupSubscriptions();
  await _setupSubscriptionInvoices();
  await _setupPlatformConfig();
  await _setupEmployees();
  await _setupEmployeeGroups();
  await _setupEmployeeGroupMembers();
  await _setupEmployeeInvites();
  await _setupEmployeePasskeys();
  await _setupEmployeePasskeyChallenges();
  await _setupPasswordResetTokens();
  await _setupAssetValuations();
  await _setupPartners();
  await _setupPartnerRefreshTokens();
  await _setupPartnerResetTokens();
  await _setupPartnerServiceAssignments();
  await _setupPartnerPayouts();

  // ── Pass 2: indexes (after columns settle) ───────────────────────────────
  stdout.writeln('[setup] waiting for columns to become available…');
  await Future<void>.delayed(const Duration(seconds: 15));
  for (final ix in _pendingIndexes) {
    await _applyIndex(ix);
  }

  // ── Pass 3: singleton seed rows ──────────────────────────────────────────
  await _seedPlatformConfig();

  stdout.writeln('[setup] done.');
}

// ═══════════════════════════════════════════════════════════════════════════
// Tables (one function per collection; mirrors the PG migration order)
// ═══════════════════════════════════════════════════════════════════════════

Future<void> _setupCompanies() async {
  const c = Aw.companies;
  await _ensureTable(c, 'Companies');
  await _str(c, 'name', required: true);
  await _str(c, 'size_band', required: false);
  await _str(c, 'industry', required: false);
  // 0012 — Square customer ID (null until the async Square call completes)
  await _str(c, 'square_customer_id', required: false);
  // 0014 — background valuation job state
  await _str(c, 'valuation_status', required: false, xdefault: 'idle');
  await _datetime(c, 'valuation_started_at', required: false);
  await _int(c, 'valuation_asset_count', required: false, xdefault: 0);
  _index(c, 'square_customer_idx', TablesDBIndexType.key, [
    'square_customer_id',
  ]);
}

Future<void> _setupUsers() async {
  const c = Aw.users;
  await _ensureTable(c, 'Users');
  await _str(c, 'company_id', required: true);
  await _email(c, 'email', required: true);
  await _str(c, 'password_hash', required: true);
  await _str(c, 'full_name', required: true);
  await _enum(c, 'role', ['admin', 'member', 'viewer'], xdefault: 'member');
  _index(c, 'email_unique', TablesDBIndexType.unique, ['email']);
  _index(c, 'company_id_idx', TablesDBIndexType.key, ['company_id']);
}

Future<void> _setupRefreshTokens() async {
  const c = Aw.refreshTokens;
  await _ensureTable(c, 'Refresh Tokens');
  await _str(c, 'user_id', required: true);
  await _str(c, 'token_hash', required: true);
  await _datetime(c, 'expires_at', required: true);
  await _datetime(c, 'revoked_at', required: false);
  _index(c, 'token_hash_unique', TablesDBIndexType.unique, ['token_hash']);
  _index(c, 'user_id_idx', TablesDBIndexType.key, ['user_id']);
  _index(c, 'expires_at_idx', TablesDBIndexType.key, ['expires_at']);
}

Future<void> _setupAssets() async {
  const c = Aw.assets;
  await _ensureTable(c, 'Assets');
  await _str(c, 'company_id', required: true);
  await _enum(
    c,
    'mdm_source',
    ['manual', 'jamf_pro', 'jamf_school', 'intune'],
    xdefault: 'manual',
  );
  await _str(c, 'serial_number', required: false);
  await _str(c, 'model_name', required: true);
  await _enum(c, 'asset_type', [
    'laptop', 'desktop', 'server', 'phone', 'tablet',
    'networking', 'monitor', 'software', 'license', 'other',
  ], required: true);
  await _enum(c, 'condition_grade', ['A', 'B', 'C'], xdefault: 'B');
  await _int(c, 'quantity', required: false, xdefault: 1);
  await _text(c, 'reason_for_offload', required: false);
  await _datetime(c, 'purchase_date', required: false);
  await _int(c, 'original_purchase_price_cents', required: false);
  await _str(c, 'os_version', required: false);
  await _float(c, 'battery_health_pct', required: false);
  await _int(c, 'battery_cycles', required: false);
  await _str(c, 'compliance_state', required: false);
  await _str(c, 'assigned_user', required: false);
  await _str(c, 'department', required: false);
  await _str(c, 'cost_center', required: false);
  await _datetime(c, 'last_mdm_sync', required: false);
  await _float(c, 'cpu_score', required: false);
  // 0008 widened these to NUMERIC — floats here (not money)
  await _float(c, 'ram_gb', required: false);
  await _float(c, 'storage_gb', required: false);
  _index(c, 'company_id_idx', TablesDBIndexType.key, ['company_id']);
  _index(c, 'asset_type_idx', TablesDBIndexType.key, ['asset_type']);
  _index(c, 'condition_grade_idx', TablesDBIndexType.key, ['condition_grade']);
  // ⚠ PG treats NULL serials as distinct; Appwrite may not. The manual-entry
  // path must therefore never send serial_number: null twice for the same
  // company — repos synthesize a per-row placeholder when serial is absent.
  _index(c, 'company_mdm_serial_unique', TablesDBIndexType.unique, [
    'company_id', 'mdm_source', 'serial_number',
  ]);
}

Future<void> _setupListings() async {
  const c = Aw.listings;
  await _ensureTable(c, 'Listings');
  await _str(c, 'asset_id', required: true);
  await _str(c, 'company_id', required: true);
  await _int(c, 'listed_price_cents', required: false);
  await _int(c, 'seller_offer_price_cents', required: false);
  await _int(c, 'buyer_ask_price_cents', required: false);
  await _int(c, 'gross_margin_cents', required: false);
  await _int(c, 'consumer_market_anchor_cents', required: false);
  await _int(c, 'fair_market_value_cents', required: false);
  await _int(c, 'est_book_value_cents', required: false);
  await _float(c, 'seller_recovery_ratio', required: false);
  await _float(c, 'depreciation_pct', required: false);
  await _int(c, 'age_months', required: false);
  await _enum(
    c,
    'valuation_flag',
    ['standard', 'seller_overpriced', 'distressed', 'insufficient_data'],
    xdefault: 'standard',
  );
  await _enum(
    c,
    'status',
    ['draft', 'active', 'sold', 'expired', 'withdrawn'],
    xdefault: 'draft',
  );
  await _datetime(c, 'last_valued_at', required: false);
  _index(c, 'company_id_idx', TablesDBIndexType.key, ['company_id']);
  _index(c, 'asset_id_idx', TablesDBIndexType.key, ['asset_id']);
  _index(c, 'status_idx', TablesDBIndexType.key, ['status']);
}

Future<void> _setupBuyerOffers() async {
  const c = Aw.buyerOffers;
  await _ensureTable(c, 'Buyer Offers');
  await _str(c, 'listing_id', required: true);
  await _str(c, 'buyer_company_id', required: true);
  await _int(c, 'offer_price_cents', required: true);
  await _int(c, 'quantity', required: true, min: 1);
  await _enum(
    c,
    'status',
    ['pending', 'accepted', 'rejected', 'expired', 'countered'],
    xdefault: 'pending',
  );
  await _int(c, 'counter_price_cents', required: false);
  await _text(c, 'message', required: false);
  await _datetime(c, 'expires_at', required: true);
  _index(c, 'listing_id_idx', TablesDBIndexType.key, ['listing_id']);
  _index(c, 'buyer_company_id_idx', TablesDBIndexType.key, [
    'buyer_company_id',
  ]);
  _index(c, 'status_idx', TablesDBIndexType.key, ['status']);
}

Future<void> _setupMdmConnections() async {
  const c = Aw.mdmConnections;
  await _ensureTable(c, 'MDM Connections');
  await _str(c, 'company_id', required: true);
  await _enum(c, 'mdm_type', ['jamf_pro', 'jamf_school', 'intune'],
      required: true);
  await _bool(c, 'sync_enabled', required: false, xdefault: true);
  // BYTEA cipher/nonce → base64 strings (encrypted at the app layer).
  // The cipher can be KBs → text (never indexed); the nonce is 12 bytes.
  await _text(c, 'credentials_cipher_b64', required: true);
  await _str(c, 'credentials_nonce_b64', required: true, size: 64);
  await _datetime(c, 'last_sync_at', required: false);
  await _enum(c, 'last_sync_status', ['success', 'partial', 'failed'],
      required: false);
  await _text(c, 'last_sync_error', required: false);
  await _int(c, 'device_count', required: false);
  _index(c, 'company_mdm_unique', TablesDBIndexType.unique, [
    'company_id', 'mdm_type',
  ]);
}

Future<void> _setupTaxInvoices() async {
  const c = Aw.taxInvoices;
  await _ensureTable(c, 'Tax Invoices');
  await _str(c, 'company_id', required: true);
  await _str(c, 'asset_id', required: false);
  await _str(c, 'invoice_number', required: true);
  await _enum(c, 'invoice_type', ['disposal', 'loss', 'sale', 'donation'],
      required: true);
  await _datetime(c, 'invoice_date', required: true);
  await _str(c, 'asset_description', required: true);
  await _str(c, 'serial_number', required: false);
  await _int(c, 'original_cost_cents', required: false);
  await _int(c, 'book_value_at_disposal_cents', required: false);
  await _int(c, 'market_value_at_disposal_cents', required: true);
  await _int(c, 'write_off_amount_cents', required: true);
  await _int(c, 'market_anchor_ebay_cents', required: false);
  await _str(c, 'pdf_storage_path', required: false, size: 512);
  _index(c, 'invoice_number_unique', TablesDBIndexType.unique, [
    'invoice_number',
  ]);
  _index(c, 'company_id_idx', TablesDBIndexType.key, ['company_id']);
  _index(c, 'asset_id_idx', TablesDBIndexType.key, ['asset_id']);
}

Future<void> _setupValuationSnapshots() async {
  const c = Aw.valuationSnapshots;
  await _ensureTable(c, 'Valuation Snapshots');
  await _str(c, 'company_id', required: true);
  await _datetime(c, 'snapshot_date', required: true);
  await _int(c, 'total_portfolio_value_cents', required: true);
  await _int(c, 'total_book_value_cents', required: true);
  await _int(c, 'total_depreciation_cents', required: true);
  await _int(c, 'total_devices', required: true);
  _index(c, 'company_date_unique', TablesDBIndexType.unique, [
    'company_id', 'snapshot_date',
  ]);
}

Future<void> _setupMailingList() async {
  const c = Aw.mailingList;
  await _ensureTable(c, 'Mailing List');
  await _str(c, 'source', required: false, xdefault: 'waitlist');
  await _text(c, 'notes', required: false);
  await _email(c, 'email', required: true);
  await _datetime(c, 'contacted_at', required: false);
  _index(c, 'email_unique', TablesDBIndexType.unique, ['email']);
  _index(
    c,
    'created_idx',
    TablesDBIndexType.key,
    [r'$createdAt'],
    orders: [OrderBy.desc],
  );
}

Future<void> _setupOrders() async {
  const c = Aw.orders;
  await _ensureTable(c, 'Orders');
  await _str(c, 'offer_id', required: true);
  await _str(c, 'seller_company_id', required: true);
  await _str(c, 'buyer_company_id', required: true);
  await _int(c, 'amount_cents', required: true);
  await _int(c, 'quantity', required: true, min: 1);
  // Escrow.com integration
  await _str(c, 'escrow_transaction_id', required: false);
  await _str(c, 'escrow_status', required: false);
  await _str(c, 'escrow_payment_url', required: false, size: 512);
  // Shipping / FedEx
  await _str(c, 'carrier', required: false, xdefault: 'fedex');
  await _str(c, 'tracking_number', required: false);
  await _datetime(c, 'shipped_at', required: false);
  await _datetime(c, 'delivered_at', required: false);
  await _datetime(c, 'inspection_ends_at', required: false);
  // Lifecycle
  await _enum(c, 'status', [
    'awaiting_payment', 'funded', 'shipped', 'delivered',
    'inspecting', 'complete', 'disputed', 'cancelled',
  ], xdefault: 'awaiting_payment');
  await _datetime(c, 'completed_at', required: false);
  // 0005 fee snapshot — embedded (order_fees was 1:1 with orders).
  // Percentages are ratios → float; money → cents.
  await _float(c, 'seller_fee_pct', required: false, xdefault: 0.08);
  await _int(c, 'seller_fee_cents', required: false, xdefault: 0);
  await _float(c, 'buyer_fee_pct', required: false, xdefault: 0.03);
  await _int(c, 'buyer_fee_cents', required: false, xdefault: 0);
  await _int(c, 'platform_fee_cents', required: false, xdefault: 0);
  await _int(c, 'escrow_amount_cents', required: false, xdefault: 0);
  await _enum(c, 'payment_terms', ['immediate', 'net_30', 'net_60'],
      xdefault: 'immediate');
  await _float(c, 'deferral_fee_pct', required: false, xdefault: 0);
  await _int(c, 'deferral_fee_cents', required: false, xdefault: 0);
  await _datetime(c, 'payment_due_at', required: false);
  _index(c, 'offer_unique', TablesDBIndexType.unique, ['offer_id']);
  _index(c, 'seller_company_id_idx', TablesDBIndexType.key, [
    'seller_company_id',
  ]);
  _index(c, 'buyer_company_id_idx', TablesDBIndexType.key, [
    'buyer_company_id',
  ]);
  _index(c, 'status_idx', TablesDBIndexType.key, ['status']);
  _index(c, 'tracking_number_idx', TablesDBIndexType.key, ['tracking_number']);
}

Future<void> _setupSubscriptions() async {
  const c = Aw.subscriptions;
  await _ensureTable(c, 'Subscriptions');
  await _str(c, 'company_id', required: true);
  await _enum(c, 'plan', ['free', 'starter', 'growth', 'pro'],
      xdefault: 'free');
  await _enum(c, 'status', ['active', 'cancelled', 'past_due'],
      xdefault: 'active');
  await _str(c, 'square_subscription_id', required: false);
  await _datetime(c, 'current_period_start', required: false);
  await _datetime(c, 'current_period_end', required: false);
  await _datetime(c, 'cancelled_at', required: false);
  _index(c, 'company_unique', TablesDBIndexType.unique, ['company_id']);
  _index(c, 'plan_idx', TablesDBIndexType.key, ['plan']);
  _index(c, 'status_idx', TablesDBIndexType.key, ['status']);
}

Future<void> _setupSubscriptionInvoices() async {
  const c = Aw.subscriptionInvoices;
  await _ensureTable(c, 'Subscription Invoices');
  await _str(c, 'company_id', required: true);
  await _str(c, 'subscription_id', required: true);
  await _str(c, 'square_payment_id', required: true);
  await _enum(c, 'plan', ['free', 'starter', 'growth', 'pro'], required: true);
  await _int(c, 'amount_cents', required: true);
  await _str(c, 'currency', required: false, xdefault: 'USD');
  await _str(c, 'status', required: false, xdefault: 'paid');
  await _str(c, 'receipt_url', required: false, size: 512);
  await _datetime(c, 'period_start', required: true);
  await _datetime(c, 'period_end', required: true);
  _index(c, 'company_id_idx', TablesDBIndexType.key, ['company_id']);
  _index(c, 'subscription_id_idx', TablesDBIndexType.key, ['subscription_id']);
}

Future<void> _setupPlatformConfig() async {
  const c = Aw.platformConfig;
  await _ensureTable(c, 'Platform Config');
  // Fee ratios (not money) → float
  await _float(c, 'seller_fee_free', required: false, xdefault: 0.08);
  await _float(c, 'seller_fee_starter', required: false, xdefault: 0.06);
  await _float(c, 'seller_fee_growth', required: false, xdefault: 0.05);
  await _float(c, 'seller_fee_pro', required: false, xdefault: 0.03);
  await _float(c, 'buyer_fee', required: false, xdefault: 0.03);
  await _float(c, 'deferral_fee', required: false, xdefault: 0.013);
  // USD per unit → cents
  await _int(c, 'data_wipe_price_cents', required: false, xdefault: 800);
  // 0017 — Net 30/60 feature flag. OFF until financing partners exist.
  await _bool(c, 'payment_terms_enabled', required: false, xdefault: false);
  await _str(c, 'updated_by', required: false);
}

Future<void> _setupEmployees() async {
  const c = Aw.guildmarkEmployees;
  await _ensureTable(c, 'GuildMark Employees');
  await _email(c, 'email', required: true);
  await _str(c, 'password_hash', required: true);
  await _str(c, 'full_name', required: true);
  await _enum(c, 'role', ['superadmin', 'engineer', 'support', 'marketing'],
      xdefault: 'support');
  await _bool(c, 'is_active', required: false, xdefault: true);
  await _datetime(c, 'last_login_at', required: false);
  _index(c, 'email_unique', TablesDBIndexType.unique, ['email']);
}

Future<void> _setupEmployeeGroups() async {
  const c = Aw.employeeGroups;
  await _ensureTable(c, 'Employee Groups');
  await _str(c, 'name', required: true);
  await _text(c, 'description', required: false);
  _index(c, 'name_unique', TablesDBIndexType.unique, ['name']);
}

Future<void> _setupEmployeeGroupMembers() async {
  const c = Aw.employeeGroupMembers;
  await _ensureTable(c, 'Employee Group Members');
  await _str(c, 'group_id', required: true);
  await _str(c, 'employee_id', required: true);
  _index(c, 'group_employee_unique', TablesDBIndexType.unique, [
    'group_id', 'employee_id',
  ]);
}

Future<void> _setupEmployeeInvites() async {
  const c = Aw.employeeInvites;
  await _ensureTable(c, 'Employee Invites');
  await _email(c, 'email', required: true);
  await _enum(c, 'role', ['superadmin', 'engineer', 'support', 'marketing'],
      xdefault: 'support');
  await _str(c, 'invited_by', required: false);
  await _str(c, 'token_hash', required: true);
  await _datetime(c, 'expires_at', required: true);
  await _datetime(c, 'accepted_at', required: false);
  _index(c, 'token_hash_unique', TablesDBIndexType.unique, ['token_hash']);
}

Future<void> _setupEmployeePasskeys() async {
  const c = Aw.employeePasskeys;
  await _ensureTable(c, 'Employee Passkeys');
  await _str(c, 'employee_id', required: true);
  await _str(c, 'credential_id', required: true);
  await _str(c, 'public_key_x', required: true);
  await _str(c, 'public_key_y', required: true);
  await _int(c, 'sign_count', required: false, xdefault: 0);
  await _str(c, 'aaguid', required: false);
  await _str(c, 'friendly_name', required: false, xdefault: 'Passkey');
  await _datetime(c, 'last_used_at', required: false);
  _index(c, 'credential_id_unique', TablesDBIndexType.unique, [
    'credential_id',
  ]);
  _index(c, 'employee_id_idx', TablesDBIndexType.key, ['employee_id']);
}

Future<void> _setupEmployeePasskeyChallenges() async {
  const c = Aw.employeePasskeyChallenges;
  await _ensureTable(c, 'Employee Passkey Challenges');
  // Null during authentication (employee unknown until assertion verifies)
  await _str(c, 'employee_id', required: false);
  await _str(c, 'challenge', required: true);
  await _enum(c, 'type', ['registration', 'authentication'], required: true);
  await _datetime(c, 'expires_at', required: true);
  _index(c, 'expires_at_idx', TablesDBIndexType.key, ['expires_at']);
}

Future<void> _setupPasswordResetTokens() async {
  const c = Aw.passwordResetTokens;
  await _ensureTable(c, 'Password Reset Tokens');
  await _str(c, 'user_id', required: true);
  await _str(c, 'token_hash', required: true);
  await _datetime(c, 'expires_at', required: true);
  await _datetime(c, 'used_at', required: false);
  _index(c, 'token_hash_unique', TablesDBIndexType.unique, ['token_hash']);
  _index(c, 'user_id_idx', TablesDBIndexType.key, ['user_id']);
  _index(c, 'expires_at_idx', TablesDBIndexType.key, ['expires_at']);
}

Future<void> _setupAssetValuations() async {
  const c = Aw.assetValuations;
  await _ensureTable(c, 'Asset Valuations');
  await _str(c, 'asset_id', required: true);
  await _str(c, 'listing_id', required: false);
  await _enum(c, 'source', ['listing', 'estimate', 'scheduled'],
      xdefault: 'estimate');
  // Denormalised snapshot of the asset at valuation time
  await _str(c, 'model_name', required: true);
  await _str(c, 'asset_type', required: true);
  await _str(c, 'condition_grade', required: true);
  await _int(c, 'age_months', required: true);
  // ML output
  await _int(c, 'fair_market_value_cents', required: true);
  await _float(c, 'confidence', required: true);
  await _str(c, 'model_version', required: true);
  // Listing context — null for estimate/scheduled valuations
  await _int(c, 'listed_price_cents', required: false);
  await _float(c, 'price_to_fmv_ratio', required: false);
  _index(c, 'asset_id_idx', TablesDBIndexType.key, ['asset_id']);
  _index(c, 'listing_id_idx', TablesDBIndexType.key, ['listing_id']);
  _index(c, 'asset_type_idx', TablesDBIndexType.key, ['asset_type']);
}

Future<void> _setupPartners() async {
  const c = Aw.partners;
  await _ensureTable(c, 'Partners');
  await _str(c, 'company_name', required: true);
  await _email(c, 'email', required: true);
  await _str(c, 'password_hash', required: true);
  // "GM-XXXX" — generated app-side (no sequences in Appwrite); the unique
  // index rejects collisions and the generator retries.
  await _str(c, 'partner_code', required: true);
  await _int(c, 'service_radius_miles', required: false, xdefault: 50);
  await _str(c, 'city', required: false);
  await _str(c, 'state', required: false);
  await _enum(c, 'status', ['pending', 'active', 'suspended'],
      xdefault: 'pending');
  await _float(c, 'rating', required: false, xdefault: 5);
  await _int(c, 'total_jobs_completed', required: false, xdefault: 0);
  await _int(c, 'available_balance_cents', required: false, xdefault: 0);
  await _str(c, 'square_customer_id', required: false);
  _index(c, 'email_unique', TablesDBIndexType.unique, ['email']);
  _index(c, 'partner_code_unique', TablesDBIndexType.unique, ['partner_code']);
  _index(c, 'status_idx', TablesDBIndexType.key, ['status']);
}

Future<void> _setupPartnerRefreshTokens() async {
  const c = Aw.partnerRefreshTokens;
  await _ensureTable(c, 'Partner Refresh Tokens');
  await _str(c, 'partner_id', required: true);
  await _str(c, 'token_hash', required: true);
  await _datetime(c, 'expires_at', required: true);
  await _datetime(c, 'revoked_at', required: false);
  _index(c, 'token_hash_unique', TablesDBIndexType.unique, ['token_hash']);
  _index(c, 'partner_id_idx', TablesDBIndexType.key, ['partner_id']);
  _index(c, 'expires_at_idx', TablesDBIndexType.key, ['expires_at']);
}

Future<void> _setupPartnerResetTokens() async {
  const c = Aw.partnerResetTokens;
  await _ensureTable(c, 'Partner Reset Tokens');
  await _str(c, 'partner_id', required: true);
  await _str(c, 'token_hash', required: true);
  await _datetime(c, 'expires_at', required: true);
  await _datetime(c, 'used_at', required: false);
  _index(c, 'token_hash_unique', TablesDBIndexType.unique, ['token_hash']);
  _index(c, 'partner_id_idx', TablesDBIndexType.key, ['partner_id']);
  _index(c, 'expires_at_idx', TablesDBIndexType.key, ['expires_at']);
}

Future<void> _setupPartnerServiceAssignments() async {
  const c = Aw.partnerServiceAssignments;
  await _ensureTable(c, 'Partner Service Assignments');
  // Null while on the workboard (status = available)
  await _str(c, 'partner_id', required: false);
  // Null for synthetic workboard rows created before an order exists
  await _str(c, 'order_id', required: false);
  await _str(c, 'order_ref', required: true);
  await _str(c, 'buyer_name', required: false, xdefault: '');
  await _str(c, 'buyer_city', required: false, xdefault: '');
  await _enum(c, 'service_type', ['wipe_only', 'wipe_and_reimage'],
      required: true);
  await _int(c, 'item_count', required: false, xdefault: 1);
  await _int(c, 'wipe_payout_cents', required: false, xdefault: 0);
  await _int(c, 'reimage_payout_cents', required: false, xdefault: 0);
  await _str(c, 'wipe_method', required: false);
  await _str(c, 'reimage_os', required: false);
  await _str(c, 'cert_url', required: false, size: 512);
  await _str(c, 'tracking_number', required: false);
  await _str(c, 'carrier', required: false);
  await _enum(c, 'status', [
    'available', 'claimed', 'wipe_in_progress', 'wipe_complete',
    'reimage_in_progress', 'reimage_complete', 'awaiting_cert',
    'cert_uploaded', 'shipped', 'complete', 'cancelled',
  ], xdefault: 'available');
  await _datetime(c, 'claimed_at', required: false);
  await _datetime(c, 'completed_at', required: false);
  _index(c, 'partner_id_idx', TablesDBIndexType.key, ['partner_id']);
  _index(c, 'order_id_idx', TablesDBIndexType.key, ['order_id']);
  _index(c, 'status_idx', TablesDBIndexType.key, ['status']);
}

Future<void> _setupPartnerPayouts() async {
  const c = Aw.partnerPayouts;
  await _ensureTable(c, 'Partner Payouts');
  await _str(c, 'partner_id', required: true);
  await _str(c, 'payout_ref', required: true);
  await _int(c, 'amount_cents', required: true, min: 1);
  await _str(c, 'method', required: false, xdefault: 'bank_transfer');
  await _enum(c, 'status', ['pending', 'paid', 'failed'], xdefault: 'pending');
  await _datetime(c, 'paid_at', required: false);
  _index(c, 'payout_ref_unique', TablesDBIndexType.unique, ['payout_ref']);
  _index(c, 'partner_id_idx', TablesDBIndexType.key, ['partner_id']);
}

// ═══════════════════════════════════════════════════════════════════════════
// Seed rows
// ═══════════════════════════════════════════════════════════════════════════

/// Mirrors migration 0009's singleton seed: one config row with defaults.
/// Values are explicit — Appwrite rejects createRow with empty data
/// (column defaults only fill fields omitted from a non-empty write).
Future<void> _seedPlatformConfig() => _ignoreConflict(
  () => _db.createRow(
    databaseId: Aw.databaseId,
    tableId: Aw.platformConfig,
    rowId: Aw.platformConfigRowId,
    data: const <String, dynamic>{
      'seller_fee_free': 0.08,
      'seller_fee_starter': 0.06,
      'seller_fee_growth': 0.05,
      'seller_fee_pro': 0.03,
      'buyer_fee': 0.03,
      'deferral_fee': 0.013,
      'data_wipe_price_cents': 800,
      // WS2 feature flag — Net 30/60 stays OFF until financing partners exist.
      'payment_terms_enabled': false,
    },
  ),
  '[setup] seed platform_config/${Aw.platformConfigRowId}',
);

// ═══════════════════════════════════════════════════════════════════════════
// Helpers (idempotent: swallow 409 "already exists")
// ═══════════════════════════════════════════════════════════════════════════

Future<void> _ensureDatabase(String id, String name) => _ignoreConflict(
  () => _db.create(databaseId: id, name: name),
  '[setup] database $id',
);

Future<void> _ensureTable(String id, String name) => _ignoreConflict(
  () => _db.createTable(
    databaseId: Aw.databaseId,
    tableId: id,
    name: name,
    // Server-side access via API key; tighten per-collection later.
    permissions: [Permission.read(Role.any())],
    rowSecurity: true,
  ),
  '[setup] table $id',
);

/// Bounded string column (varchar). Default 255 keeps every index —
/// including composites — under Appwrite's 1024 index-length ceiling.
/// Unbounded text columns are NOT indexable; use [_text] for long fields.
Future<void> _str(
  String table,
  String key, {
  required bool required,
  int size = 255,
  String? xdefault,
}) => _ignoreConflict(
  () => _db.createVarcharColumn(
    databaseId: Aw.databaseId,
    tableId: table,
    key: key,
    size: size,
    xrequired: required,
    xdefault: xdefault,
  ),
  '[setup]   col $table.$key (varchar $size)',
);

/// Unbounded text column — for long free-form fields only (notes, messages,
/// encrypted blobs). Never index these: max index length is 1024.
Future<void> _text(
  String table,
  String key, {
  required bool required,
  String? xdefault,
}) => _ignoreConflict(
  () => _db.createTextColumn(
    databaseId: Aw.databaseId,
    tableId: table,
    key: key,
    xrequired: required,
    xdefault: xdefault,
  ),
  '[setup]   col $table.$key (text)',
);

Future<void> _email(String table, String key, {required bool required}) =>
    _ignoreConflict(
      () => _db.createEmailColumn(
        databaseId: Aw.databaseId,
        tableId: table,
        key: key,
        xrequired: required,
      ),
      '[setup]   col $table.$key (email)',
    );

Future<void> _datetime(
  String table,
  String key, {
  required bool required,
}) => _ignoreConflict(
  () => _db.createDatetimeColumn(
    databaseId: Aw.databaseId,
    tableId: table,
    key: key,
    xrequired: required,
  ),
  '[setup]   col $table.$key (datetime)',
);

Future<void> _int(
  String table,
  String key, {
  required bool required,
  int? xdefault,
  int? min,
}) => _ignoreConflict(
  () => _db.createIntegerColumn(
    databaseId: Aw.databaseId,
    tableId: table,
    key: key,
    xrequired: required,
    min: min,
    xdefault: xdefault,
  ),
  '[setup]   col $table.$key (int)',
);

Future<void> _float(
  String table,
  String key, {
  required bool required,
  double? xdefault,
}) => _ignoreConflict(
  () => _db.createFloatColumn(
    databaseId: Aw.databaseId,
    tableId: table,
    key: key,
    xrequired: required,
    xdefault: xdefault,
  ),
  '[setup]   col $table.$key (float)',
);

Future<void> _bool(
  String table,
  String key, {
  required bool required,
  bool? xdefault,
}) => _ignoreConflict(
  () => _db.createBooleanColumn(
    databaseId: Aw.databaseId,
    tableId: table,
    key: key,
    xrequired: required,
    xdefault: xdefault,
  ),
  '[setup]   col $table.$key (bool)',
);

/// Enum column. PG `NOT NULL DEFAULT x` → not-required + default (Appwrite
/// forbids defaults on required columns); pass `required: true` only for
/// enums with no default.
Future<void> _enum(
  String table,
  String key,
  List<String> elements, {
  bool required = false,
  String? xdefault,
}) => _ignoreConflict(
  () => _db.createEnumColumn(
    databaseId: Aw.databaseId,
    tableId: table,
    key: key,
    elements: elements,
    xrequired: required,
    xdefault: xdefault,
  ),
  '[setup]   col $table.$key (enum)',
);

/// Register an index for the second pass (see [_pendingIndexes]).
void _index(
  String table,
  String key,
  TablesDBIndexType type,
  List<String> columns, {
  List<OrderBy>? orders,
}) {
  _pendingIndexes.add(_IndexSpec(table, key, type, columns, orders));
}

Future<void> _applyIndex(_IndexSpec ix) => _ignoreConflict(
  () => _db.createIndex(
    databaseId: Aw.databaseId,
    tableId: ix.table,
    key: ix.key,
    type: ix.type,
    columns: ix.columns,
    orders: ix.orders,
  ),
  '[setup]   index ${ix.table}.${ix.key}',
);

class _IndexSpec {
  _IndexSpec(this.table, this.key, this.type, this.columns, this.orders);
  final String table;
  final String key;
  final TablesDBIndexType type;
  final List<String> columns;
  final List<OrderBy>? orders;
}

Future<void> _ignoreConflict(Future<void> Function() op, String label) async {
  const maxAttempts = 7;
  for (var attempt = 1; ; attempt++) {
    try {
      await op();
      stdout.writeln('$label ✓');
      return;
    } on AppwriteException catch (e) {
      if (e.code == 409) {
        stdout.writeln('$label (exists)');
        return;
      }
      // Transient gateway/overload errors (Cloudflare 502/504, Appwrite 503,
      // rate limits) — retry with backoff. 'column_not_available' means the
      // async column worker hasn't finished yet — same treatment, longer
      // waits. Everything else is a real failure.
      final notReady = e.type == 'column_not_available';
      final transient = notReady ||
          e.code == 429 ||
          e.code == 502 ||
          e.code == 503 ||
          e.code == 504;
      if (transient && attempt < maxAttempts) {
        final delay = Duration(seconds: (notReady ? 5 : 2) * attempt);
        stdout.writeln(
          '$label ${notReady ? 'column not ready' : 'transient ${e.code}'}'
          ' — retry $attempt/${maxAttempts - 1} in ${delay.inSeconds}s…',
        );
        await Future<void>.delayed(delay);
        continue;
      }
      stderr.writeln('$label FAILED: ${e.code} ${e.message}');
      rethrow;
    } on NoSuchMethodError catch (e) {
      // dart_appwrite 25.x mis-parses some self-hosted 1.9 success responses
      // (e.g. Database.fromMap assumes Cloud-only fields like backupPolicies).
      // By the time fromMap runs, the server-side create has ALREADY
      // succeeded — treat as success. A re-run sees 409 anyway.
      stdout.writeln('$label ✓ (SDK response-parse bug ignored: $e)');
      return;
    }
  }
}

String _env(String key, {required String fallback}) =>
    Platform.environment[key] ?? fallback;

String _require(String key) {
  final v = Platform.environment[key];
  if (v == null || v.isEmpty) {
    stderr.writeln('Missing required env var: $key');
    exit(1);
  }
  return v;
}
