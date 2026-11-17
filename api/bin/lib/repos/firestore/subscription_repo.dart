/// Firestore-backed repository retaining the existing API contract.
/// Multi-step business workflows still require their own concurrency controls.
library;

import 'package:guildmark_api/firebase/firestore.dart';

import 'package:guildmark_api/firebase/collections.dart';

// NOTE: fee rates (seller/buyer/deferral) live in the platform_config table
// and are read via ConfigRepo at order creation — do not hardcode them here.

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

class Subscription {

  /// Build from an Appwrite row. `$id`/`$createdAt`/`$updatedAt` are system
  /// fields; the rest come from `data`.
  factory Subscription.fromRow(Row row) {
    final d = row.data;
    DateTime? dt(String key) {
      final v = d[key] as String?;
      return v == null ? null : DateTime.parse(v);
    }

    return Subscription(
      id: row.$id,
      companyId: d['company_id'] as String,
      plan: (d['plan'] as String?) ?? 'free',
      status: (d['status'] as String?) ?? 'active',
      squareSubscriptionId: d['square_subscription_id'] as String?,
      currentPeriodStart: dt('current_period_start'),
      currentPeriodEnd: dt('current_period_end'),
      cancelledAt: dt('cancelled_at'),
      createdAt: DateTime.parse(row.$createdAt),
      updatedAt: DateTime.parse(row.$updatedAt),
    );
  }
  Subscription({
    required this.id,
    required this.companyId,
    required this.plan,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.squareSubscriptionId,
    this.currentPeriodStart,
    this.currentPeriodEnd,
    this.cancelledAt,
  });

  final String id;
  final String companyId;
  final String plan; // subscription_plan enum: free | starter | growth | pro
  final String status; // subscription_status: active | cancelled | past_due
  final String? squareSubscriptionId;
  final DateTime? currentPeriodStart;
  final DateTime? currentPeriodEnd;
  final DateTime? cancelledAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  bool get isActive => status == 'active';

  Map<String, dynamic> toJson() => {
        'plan': plan,
        'status': status,
        'currentPeriodStart': currentPeriodStart?.toIso8601String(),
        'currentPeriodEnd': currentPeriodEnd?.toIso8601String(),
      };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

class SubscriptionRepo {
  SubscriptionRepo(this._aw);
  final FirebaseService _aw;

  TablesDB get _db => _aw.tablesDB;

  /// Create a free subscription for a newly registered company.
  /// Called from the signup route immediately after the company row is created.
  ///
  /// Idempotent (§1a — the signup saga may retry): if a subscription already
  /// exists for the company, the unique index on company_id rejects the
  /// duplicate (409) and the existing row is returned instead.
  Future<Subscription> createFree(String companyId) async {
    try {
      final row = await _db.createRow(
        databaseId: Collections.databaseId,
        tableId: Collections.subscriptions,
        rowId: ID.unique(),
        data: {
          'company_id': companyId,
          'plan': 'free',
          'status': 'active',
        },
      );
      return Subscription.fromRow(row);
    } on DatastoreException catch (e) {
      if (e.code == 409) {
        final existing = await findByCompany(companyId);
        if (existing != null) return existing;
      }
      rethrow;
    }
  }

  /// Returns the active subscription for a company, or null if none exists.
  /// A null result should be treated as free-tier for fee calculation purposes.
  Future<Subscription?> findByCompany(String companyId) async {
    final res = await _db.listRows(
      databaseId: Collections.databaseId,
      tableId: Collections.subscriptions,
      queries: [Query.equal('company_id', companyId), Query.limit(1)],
    );
    if (res.rows.isEmpty) return null;
    return Subscription.fromRow(res.rows.first);
  }

  /// Upgrade or downgrade a company's plan.
  /// [squareSubscriptionId] should be set for any paid plan, null for free.
  Future<Subscription?> updatePlan({
    required String companyId,
    required String plan,
    String? squareSubscriptionId,
    DateTime? currentPeriodStart,
    DateTime? currentPeriodEnd,
  }) async {
    final existing = await findByCompany(companyId);
    if (existing == null) return null; // PG UPDATE matched no rows → null
    try {
      final row = await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.subscriptions,
        rowId: existing.id,
        data: {
          'plan': plan,
          'status': 'active',
          'square_subscription_id': squareSubscriptionId,
          'current_period_start':
              currentPeriodStart?.toUtc().toIso8601String(),
          'current_period_end': currentPeriodEnd?.toUtc().toIso8601String(),
          'cancelled_at': null,
        },
      );
      return Subscription.fromRow(row);
    } on DatastoreException catch (e) {
      if (e.code == 404) return null; // deleted between query and update
      rethrow;
    }
  }

  /// Mark a subscription as cancelled.
  Future<void> cancel(String companyId) async {
    final existing = await findByCompany(companyId);
    if (existing == null) return; // PG UPDATE matched no rows → no-op
    try {
      await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.subscriptions,
        rowId: existing.id,
        data: {
          'status': 'cancelled',
          'cancelled_at': DateTime.now().toUtc().toIso8601String(),
        },
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return;
      rethrow;
    }
  }

  /// Mark a subscription as past_due (called from the Square webhook on
  /// payment failure).
  Future<void> markPastDue(String companyId) async {
    final existing = await findByCompany(companyId);
    if (existing == null) return; // PG UPDATE matched no rows → no-op
    try {
      await _db.updateRow(
        databaseId: Collections.databaseId,
        tableId: Collections.subscriptions,
        rowId: existing.id,
        data: {'status': 'past_due'},
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return;
      rethrow;
    }
  }
}
