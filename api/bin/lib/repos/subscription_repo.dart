/// Subscription tier management.
///
/// Every company has exactly one subscription row (created at signup, free by
/// default). The plan determines AMPS feature access and the seller-side
/// marketplace fee applied at order creation.
library;

import '../db/pool.dart';

// ---------------------------------------------------------------------------
// Constants — fee rates by plan
// ---------------------------------------------------------------------------

/// Returns the seller-side fee percentage (0–1) for a given plan string.
/// Defaults to the free tier rate if the plan is unrecognised.
double sellerFeePct(String plan) => switch (plan) {
      'pro'     => 0.03,
      'growth'  => 0.05,
      'starter' => 0.06,
      _         => 0.08, // free
    };

/// Buyer-side fee — flat across all tiers.
const double kBuyerFeePct = 0.03;

/// Net 30/60 deferral fee — flat across all tiers.
const double kDeferralFeePct = 0.013;

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

class Subscription {
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
  final String plan;   // subscription_plan enum: free | starter | growth | pro
  final String status; // subscription_status enum: active | cancelled | past_due
  final String? squareSubscriptionId;
  final DateTime? currentPeriodStart;
  final DateTime? currentPeriodEnd;
  final DateTime? cancelledAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  bool get isActive => status == 'active';

  /// Seller-side fee percentage for this plan.
  double get sellerFeeRate => sellerFeePct(plan);

  factory Subscription.fromRow(Map<String, dynamic> row) => Subscription(
        id:                   row['id'].toString(),
        companyId:            row['company_id'].toString(),
        plan:                 row['plan'].toString(),
        status:               row['status'].toString(),
        squareSubscriptionId: row['square_subscription_id']?.toString(),
        currentPeriodStart:   row['current_period_start'] as DateTime?,
        currentPeriodEnd:     row['current_period_end']   as DateTime?,
        cancelledAt:          row['cancelled_at']         as DateTime?,
        createdAt:            row['created_at']           as DateTime,
        updatedAt:            row['updated_at']           as DateTime,
      );

  Map<String, dynamic> toJson() => {
        'plan':   plan,
        'status': status,
        'currentPeriodStart': currentPeriodStart?.toIso8601String(),
        'currentPeriodEnd':   currentPeriodEnd?.toIso8601String(),
      };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

// Columns selected in every query — avoids RETURNING * / SELECT * so that
// UUID and ENUM types are explicitly cast to text before Dart sees them.
const _cols = '''
  id::text, company_id::text, plan::text, status::text,
  square_subscription_id,
  current_period_start, current_period_end,
  cancelled_at, created_at, updated_at
''';

class SubscriptionRepo {
  SubscriptionRepo(this._db);
  final Db _db;

  /// Create a free subscription for a newly registered company.
  /// Called from the signup route immediately after the company row is created.
  Future<Subscription> createFree(String companyId) async {
    final rows = await _db.query(
      '''
      INSERT INTO subscriptions (company_id, plan, status)
      VALUES (@cid, 'free', 'active')
      RETURNING $_cols
      ''',
      parameters: {'cid': companyId},
    );
    return Subscription.fromRow(rows.first.toColumnMap());
  }

  /// Returns the active subscription for a company, or null if none exists.
  /// A null result should be treated as free-tier for fee calculation purposes.
  Future<Subscription?> findByCompany(String companyId) async {
    final rows = await _db.query(
      'SELECT $_cols FROM subscriptions WHERE company_id = @cid',
      parameters: {'cid': companyId},
    );
    if (rows.isEmpty) return null;
    return Subscription.fromRow(rows.first.toColumnMap());
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
    final rows = await _db.query(
      '''
      UPDATE subscriptions
      SET plan                   = @plan,
          status                 = 'active',
          square_subscription_id = @sqid,
          current_period_start   = @pstart,
          current_period_end     = @pend,
          cancelled_at           = NULL
      WHERE company_id = @cid
      RETURNING $_cols
      ''',
      parameters: {
        'cid':    companyId,
        'plan':   plan,
        'sqid':   squareSubscriptionId,
        'pstart': currentPeriodStart,
        'pend':   currentPeriodEnd,
      },
    );
    if (rows.isEmpty) return null;
    return Subscription.fromRow(rows.first.toColumnMap());
  }

  /// Mark a subscription as cancelled.
  Future<void> cancel(String companyId) async {
    await _db.query(
      '''
      UPDATE subscriptions
      SET status       = 'cancelled',
          cancelled_at = now()
      WHERE company_id = @cid
      ''',
      parameters: {'cid': companyId},
    );
  }

  /// Mark a subscription as past_due (called from Square webhook on payment failure).
  Future<void> markPastDue(String companyId) async {
    await _db.query(
      "UPDATE subscriptions SET status = 'past_due' WHERE company_id = @cid",
      parameters: {'cid': companyId},
    );
  }
}
