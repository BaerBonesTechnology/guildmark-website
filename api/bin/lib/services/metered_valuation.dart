import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/repos/firestore/amps_inventory_repo.dart';
import 'package:guildmark_api/repos/firestore/subscription_repo.dart';

class BillingWindow {
  BillingWindow(Subscription sub, DateTime now)
    : start = sub.currentPeriodStart ?? DateTime.utc(now.year, now.month),
      end = sub.currentPeriodEnd ?? DateTime.utc(now.year, now.month + 1),
      source = sub.currentPeriodStart == null
          ? 'legacy_calendar_month'
          : 'subscription';
  final DateTime start;
  final DateTime end;
  final String source;
  String key(String company) => sha256
      .convert(utf8.encode('$company:${start.toIso8601String()}'))
      .toString();
}

Map<String, dynamic> liveReservations(Row? row, DateTime now) {
  final raw = Map<String, dynamic>.from(
    row?.data['reservations'] as Map? ?? {},
  );
  raw.removeWhere(
    (_, v) =>
        DateTime.tryParse(
          (v as Map)['expires_at'] as String? ?? '',
        )?.isAfter(now) !=
        true,
  );
  return raw;
}

class MeteredValuation {
  MeteredValuation(this.service, this.ml, {DateTime Function()? now})
    : now = now ?? DateTime.now;
  final FirebaseService service;
  final MlClient ml;
  final DateTime Function() now;

  Future<ValuationResponse> estimate(
    String companyId,
    ValuationRequest request, {
    String? assetId,
  }) async {
    if (assetId != null) {
      Row asset;
      try {
        asset = await service.tablesDB.getRow(
          databaseId: '',
          tableId: 'assets',
          rowId: assetId,
        );
      } on DatastoreException catch (e) {
        if (e.code != 404) rethrow;
        throw const PlanLimitException(
          'NOT_FOUND',
          'Asset not found.',
          status: 404,
        );
      }
      if (asset.data['company_id'] != companyId ||
          asset.data['archived'] == true) {
        throw const PlanLimitException(
          'NOT_FOUND',
          'Asset not found.',
          status: 404,
        );
      }
    }
    final sub = await SubscriptionRepo(service).findByCompany(companyId);
    if (sub == null || !ampsPlans.containsKey(sub.plan)) {
      // Existing Free marketplace calculator is retained, separate from AMPS.
      return _predict(request);
    }
    if (!activePaid(sub, now())) {
      throw const PlanLimitException(
        'SUBSCRIPTION_REQUIRED',
        'An active AMPS plan is required for fresh valuations.',
      );
    }
    if (request.assetType != 'laptop') {
      throw const PlanLimitException(
        'UNSUPPORTED_ASSET_TYPE',
        'AMPS credits currently support laptop estimates only.',
        status: 400,
      );
    }
    final window = BillingWindow(sub, now().toUtc());
    final usageId = window.key(companyId);
    final input = sha256
        .convert(utf8.encode(jsonEncode(request.toJson())))
        .toString();
    final cacheId = sha256
        .convert(
          utf8.encode(
            '$usageId:${assetId ?? "calculator"}:${ml.cacheVersion}:$input',
          ),
        )
        .toString();
    final token = ID.unique();
    final cached = await service.tablesDB.transaction<Map<String, dynamic>?>((
      tx,
    ) async {
      final current = await tx.get('subscriptions', sub.id);
      final cache = await tx.get('amps_valuation_cache', cacheId);
      final usage = await tx.get('amps_valuation_usage', usageId);
      if (current == null ||
          !activePaid(Subscription.fromRow(current), now()) ||
          current.data['plan'] != sub.plan ||
          BillingWindow(
                Subscription.fromRow(current),
                now().toUtc(),
              ).key(companyId) !=
              usageId) {
        throw const PlanLimitException(
          'SUBSCRIPTION_CHANGED',
          'Subscription changed; refresh before valuing.',
        );
      }
      if (cache?.data['state'] == 'complete') {
        return Map<String, dynamic>.from(cache!.data['result'] as Map);
      }
      final pending = liveReservations(usage, now().toUtc());
      if (pending.containsKey(cacheId)) {
        throw const PlanLimitException(
          'VALUATION_IN_PROGRESS',
          'This estimate is already in progress. Retry shortly.',
          status: 409,
        );
      }
      final used = (usage?.data['used'] as num?)?.toInt() ?? 0;
      if (used + pending.length >= ampsPlans[sub.plan]!.valuationLimit) {
        throw const PlanLimitException(
          'VALUATION_LIMIT_EXCEEDED',
          'Your billing-period valuation credits are exhausted.',
          status: 429,
        );
      }
      pending[cacheId] = {
        'token': token,
        'expires_at': now()
            .toUtc()
            .add(const Duration(seconds: 60))
            .toIso8601String(),
      };
      final data = {
        'company_id': companyId,
        'period_start': window.start.toIso8601String(),
        'period_end': window.end.toIso8601String(),
        'used': used,
        'reservations': pending,
      };
      if (usage == null) {
        tx.create('amps_valuation_usage', usageId, data);
      } else {
        tx.update('amps_valuation_usage', usageId, data);
      }
      return null;
    });
    if (cached != null) {
      return ValuationResponse.fromJson({...cached, 'cached': true});
    }
    try {
      final result = await _predict(request);
      final data = {
        'fair_market_value': result.fairMarketValue,
        'confidence': result.confidence,
        'model_version': result.modelVersion,
      };
      await service.tablesDB.transaction((tx) async {
        final usage = await tx.get('amps_valuation_usage', usageId);
        final cache = await tx.get('amps_valuation_cache', cacheId);
        final pending = liveReservations(usage, now().toUtc());
        if ((pending[cacheId] as Map?)?['token'] != token) {
          throw const PlanLimitException(
            'VALUATION_RETRY',
            'Valuation reservation expired; retry.',
            status: 409,
          );
        }
        pending.remove(cacheId);
        tx.update('amps_valuation_usage', usageId, {
          'used': ((usage!.data['used'] as num?)?.toInt() ?? 0) + 1,
          'reservations': pending,
        });
        final record = {
          'company_id': companyId,
          'state': 'complete',
          'result': data,
          'period_end': window.end.toIso8601String(),
        };
        if (cache == null) {
          tx.create('amps_valuation_cache', cacheId, record);
        } else {
          tx.update('amps_valuation_cache', cacheId, record);
        }
      });
      return ValuationResponse(
        fairMarketValue: result.fairMarketValue,
        confidence: result.confidence,
        modelVersion: result.modelVersion,
        creditCharged: true,
      );
    } catch (_) {
      await service.tablesDB.transaction((tx) async {
        final usage = await tx.get('amps_valuation_usage', usageId);
        if (usage == null) return;
        final pending = liveReservations(usage, now().toUtc());
        if ((pending[cacheId] as Map?)?['token'] == token) {
          pending.remove(cacheId);
          tx.update('amps_valuation_usage', usageId, {'reservations': pending});
        }
      });
      rethrow;
    }
  }

  Future<ValuationResponse> _predict(ValuationRequest request) async {
    if (request.ageMonths < 0 ||
        request.ageMonths > 240 ||
        request.modelName.trim().isEmpty ||
        !{'A', 'B', 'C'}.contains(request.conditionGrade) ||
        !{...physicalTypes, 'software', 'license'}.contains(request.assetType)) {
      throw const PlanLimitException(
        'VALIDATION',
        'Invalid valuation inputs.',
        status: 400,
      );
    }
    for (final n in [
      request.cpuScore,
      request.ramGb,
      request.storageGb,
      request.originalPrice,
    ]) {
      if (n != null && (!n.isFinite || n < 0 || n > 1000000)) {
        throw const PlanLimitException(
          'VALIDATION',
          'Valuation specifications must be finite non-negative numbers.',
          status: 400,
        );
      }
    }
    final result = await ml
        .estimateFairMarketValue(request)
        .timeout(const Duration(seconds: 8));
    if (!result.fairMarketValue.isFinite ||
        result.fairMarketValue <= 0 ||
        result.fairMarketValue > 1000000 ||
        !result.confidence.isFinite ||
        result.confidence < 0 ||
        result.confidence > 1) {
      throw const PlanLimitException(
        'ML_UNAVAILABLE',
        'Invalid valuation result.',
        status: 502,
      );
    }
    return result;
  }
}

Future<Map<String, dynamic>> ampsEntitlements(
  FirebaseService service,
  Subscription sub,
) async {
  final all = await AmpsInventoryRepo(service).rows(sub.companyId);
  final plan = ampsPlans[sub.plan];
  final paid = activePaid(sub);
  final window = BillingWindow(sub, DateTime.now().toUtc());
  Row? usage;
  try {
    usage = await service.tablesDB.getRow(
      databaseId: '',
      tableId: 'amps_valuation_usage',
      rowId: window.key(sub.companyId),
    );
  } on DatastoreException catch (e) {
    if (e.code != 404) rethrow;
  }
  final members = await service.tablesDB.listRows(
    databaseId: '',
    tableId: 'users',
    queries: [Query.equal('company_id', sub.companyId), Query.limit(100)],
  );
  final seats = members.rows
      .where((r) => r.data['is_active'] != false && r.data['disabled'] != true)
      .length;
  final count = inventoryUnits(all);
  final used = (usage?.data['used'] as num?)?.toInt() ?? 0;
  final reserved = liveReservations(usage, DateTime.now().toUtc()).length;
  final remaining = ((plan?.valuationLimit ?? 0) - used - reserved).clamp(
    0,
    4000,
  );
  final sr = await service.tablesDB.getRow(
    databaseId: '',
    tableId: 'subscriptions',
    rowId: sub.id,
  );
  return {
    'catalog': ampsPlans.map((k, v) => MapEntry(k, v.toJson())),
    'limits':
        plan?.toJson() ??
        {
          'price_cents': 0,
          'asset_limit': 0,
          'seat_limit': 1,
          'valuation_limit': 0,
        },
    'usage': {
      'asset_units': count,
      'active_seats': seats,
      'valuation_used': used,
      'valuation_reserved': reserved,
      'valuation_remaining': paid ? remaining : 0,
      'period_start': window.start.toIso8601String(),
      'period_end': window.end.toIso8601String(),
      'period_source': window.source,
      'over_asset_limit': count > (plan?.assetLimit ?? 0),
      'over_seat_limit': seats > (plan?.seatLimit ?? 1),
    },
    'eligibility': {
      'paid': paid,
      'can_view_assets': plan != null || sr.data['amps_ever_paid'] == true,
      'can_add_assets': paid && count < (plan?.assetLimit ?? 0),
      'can_value_assets': paid && remaining > 0,
    },
    'enforcement': {
      'asset_units': true,
      'valuation_credits': true,
      'seats': 'existing_signup_owner_only_no_invite_workflow',
    },
    'launch_gates': [
      'customer_team_invites_not_implemented',
      'production_auth_cutover_required',
      'recurring_billing_reconciliation_required',
      'additional_seat_membership_and_verified_billing_required',
      'unknown_payment_response_manual_reconciliation_required',
      'ml_cache_version_must_rotate_on_model_release',
      'existing_runtime_fee_config_alignment_required',
      'durable_background_valuation_jobs_required',
    ],
  };
}
