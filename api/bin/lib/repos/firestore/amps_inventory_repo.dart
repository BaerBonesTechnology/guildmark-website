import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:guildmark_api/repos/firestore/subscription_repo.dart';

const physicalTypes = {
  'laptop',
  'desktop',
  'server',
  'phone',
  'tablet',
  'networking',
  'monitor',
  'other',
};
bool physicalAsset(Map<String, dynamic> a) =>
    !{'software', 'license'}.contains(a['asset_type']);
int inventoryUnits(Iterable<Row> rows) => rows
    .where((r) => r.data['archived'] != true && physicalAsset(r.data))
    .fold(0, (sum, r) => sum + ((r.data['quantity'] as num?)?.toInt() ?? 1));
bool activePaid(Subscription? sub, [DateTime? now]) =>
    sub != null &&
    ampsPlans.containsKey(sub.plan) &&
    sub.status == 'active' &&
    sub.currentPeriodStart != null &&
    sub.currentPeriodEnd != null &&
    !sub.currentPeriodStart!.isAfter(now ?? DateTime.now().toUtc()) &&
    sub.currentPeriodEnd!.isAfter(now ?? DateTime.now().toUtc());

class AmpsInventoryRepo {
  AmpsInventoryRepo(this.service);
  final FirebaseService service;
  TablesDB get db => service.tablesDB;

  static const fields = {
    'model_name',
    'asset_type',
    'condition_grade',
    'quantity',
    'purchase_date',
    'original_purchase_price',
    'cpu_score',
    'ram_gb',
    'storage_gb',
    'serial_number',
    'department',
    'assigned_user',
    'cost_center',
    'reason_for_offload',
    'ships_from_location',
    'idempotency_key',
  };

  static Map<String, dynamic> validate(
    Map<String, dynamic> input, {
    bool partial = false,
  }) {
    if (input.keys.any((k) => !fields.contains(k))) {
      throw const PlanLimitException(
        'VALIDATION',
        'Unsupported asset fields.',
        status: 400,
      );
    }
    final out = Map<String, dynamic>.from(input)..remove('idempotency_key');
    for (final key in ['model_name', 'asset_type', 'condition_grade']) {
      if ((!partial || out.containsKey(key)) &&
          (out[key] is! String || (out[key] as String).trim().isEmpty)) {
        throw PlanLimitException(
          'VALIDATION',
          '$key is required.',
          status: 400,
        );
      }
    }
    if (out.containsKey('model_name') &&
        (out['model_name'] as String).length > 200) {
      throw const PlanLimitException(
        'VALIDATION',
        'Model name is too long.',
        status: 400,
      );
    }
    if (out.containsKey('asset_type') &&
        !{
          ...physicalTypes,
          'software',
          'license',
        }.contains(out['asset_type'])) {
      throw const PlanLimitException(
        'VALIDATION',
        'Unsupported asset type.',
        status: 400,
      );
    }
    if (out.containsKey('condition_grade') &&
        !{'A', 'B', 'C'}.contains(out['condition_grade'])) {
      throw const PlanLimitException(
        'VALIDATION',
        'Condition grade must be A, B or C.',
        status: 400,
      );
    }
    if (!partial || out.containsKey('quantity')) {
      final q = out['quantity'];
      if (q is! int || q < 1 || q > 100000) {
        throw const PlanLimitException(
          'VALIDATION',
          'Quantity must be an integer from 1 to 100000.',
          status: 400,
        );
      }
    }
    for (final key in [
      'original_purchase_price',
      'cpu_score',
      'ram_gb',
      'storage_gb',
    ]) {
      final v = out[key];
      if (v != null && (v is! num || !v.isFinite || v < 0 || v > 1000000)) {
        throw PlanLimitException(
          'VALIDATION',
          '$key must be a finite non-negative number.',
          status: 400,
        );
      }
    }
    for (final k in ['ram_gb', 'storage_gb']) {
      if (out[k] != null && out[k] is! int) {
        throw PlanLimitException(
          'VALIDATION',
          '$k must be a whole number.',
          status: 400,
        );
      }
    }
    if (out.containsKey('purchase_date') && out['purchase_date'] != null) {
      final v = out['purchase_date'];
      final date = v is String ? DateTime.tryParse(v) : null;
      if (date == null || date.isAfter(DateTime.now().toUtc())) {
        throw const PlanLimitException(
          'VALIDATION',
          'purchase_date must be a valid date not in the future.',
          status: 400,
        );
      }
      out['purchase_date'] = date.toUtc().toIso8601String();
    }
    for (final key in [
      'serial_number',
      'department',
      'assigned_user',
      'cost_center',
      'reason_for_offload',
      'ships_from_location',
    ]) {
      if (out[key] != null &&
          (out[key] is! String || (out[key] as String).length > 500)) {
        throw PlanLimitException(
          'VALIDATION',
          '$key must be text of at most 500 characters.',
          status: 400,
        );
      }
    }
    if (out.containsKey('original_purchase_price')) {
      final price = out.remove('original_purchase_price') as num?;
      out['original_purchase_price_cents'] = price == null
          ? null
          : (price * 100).round();
    }
    return out;
  }

  Future<List<Row>> rows(String companyId) async {
    final all = <Row>[];
    String? cursor;
    while (true) {
      final page = await db.listRows(
        databaseId: '',
        tableId: 'assets',
        queries: [
          Query.equal('company_id', companyId),
          Query.orderAsc(r'$id'),
          Query.limit(100),
          if (cursor != null) Query.cursorAfter(cursor),
        ],
      );
      all.addAll(page.rows);
      if (page.rows.length < 100) break;
      cursor = page.rows.last.$id;
    }
    return all;
  }

  Future<List<Row>> createRows(
    String companyId,
    List<Map<String, dynamic>> data, {
    String? idempotencyKey,
    bool requirePaid = true,
  }) async {
    if (data.isEmpty || data.length > 50) {
      throw const PlanLimitException(
        'VALIDATION',
        'Import between 1 and 50 records.',
        status: 400,
      );
    }
    if (idempotencyKey != null &&
        !RegExp(r'^[a-zA-Z0-9_-]{16,64}$').hasMatch(idempotencyKey)) {
      throw const PlanLimitException(
        'VALIDATION',
        'Invalid idempotency key.',
        status: 400,
      );
    }
    final normalized = data
        .map((d) => {...d, 'company_id': companyId, 'archived': false})
        .toList();
    for (final d in normalized) {
      if (d['quantity'] is! int ||
          (d['quantity'] as int) < 1 ||
          (d['quantity'] as int) > 100000) {
        throw const PlanLimitException(
          'VALIDATION',
          'Quantity must be a positive integer.',
          status: 400,
        );
      }
    }
    for (final d in normalized) {
      if (d['model_name'] is! String ||
          (d['model_name'] as String).trim().isEmpty ||
          !{'A', 'B', 'C'}.contains(d['condition_grade'])) {
        throw const PlanLimitException(
          'VALIDATION',
          'A model name and condition grade A, B or C are required.',
          status: 400,
        );
      }
      for (final k in [
        'cpu_score',
        'ram_gb',
        'storage_gb',
        'original_purchase_price_cents',
      ]) {
        final v = d[k];
        if (v != null && (v is! num || !v.isFinite || v < 0 || v > 100000000)) {
          throw PlanLimitException(
            'VALIDATION',
            '$k must be finite and non-negative.',
            status: 400,
          );
        }
      }
    }
    final sub = await SubscriptionRepo(service).findByCompany(companyId);
    final ids = data.map((_) => ID.unique()).toList();
    final key = idempotencyKey == null
        ? null
        : sha256.convert(utf8.encode('$companyId:$idempotencyKey')).toString();
    final signature = sha256
        .convert(
          utf8.encode(
            jsonEncode(
              normalized
                  .map(
                    (d) => Map.fromEntries(
                      d.entries.toList()
                        ..sort((a, b) => a.key.compareTo(b.key)),
                    ),
                  )
                  .toList(),
            ),
          ),
        )
        .toString();
    return db.transaction((tx) async {
      final lock = await tx.get('amps_company_locks', companyId);
      final subscription = sub == null
          ? null
          : await tx.get('subscriptions', sub.id);
      final current = subscription == null
          ? null
          : Subscription.fromRow(subscription);
      final existing = key == null
          ? null
          : await tx.get('amps_operations', key);
      if (existing != null) {
        if (existing.data['signature'] != signature) {
          throw const PlanLimitException(
            'IDEMPOTENCY_CONFLICT',
            'This import key belongs to different data.',
            status: 409,
          );
        }
        final found = <Row>[];
        for (final id in (existing.data['asset_ids'] as List).cast<String>()) {
          final r = await tx.get('assets', id);
          if (r != null && r.data['company_id'] == companyId) found.add(r);
        }
        return found;
      }
      if (requirePaid && !activePaid(current)) {
        throw const PlanLimitException(
          'SUBSCRIPTION_REQUIRED',
          'An active AMPS plan is required.',
        );
      }
      final all = await tx.companyRows('assets', companyId);
      final serials = <String>{};
      for (final d in normalized) {
        final serial = d['serial_number'];
        if (serial is String &&
            serial.isNotEmpty &&
            (!serials.add(serial) ||
                all.any(
                  (r) =>
                      r.data['mdm_source'] == 'manual' &&
                      r.data['serial_number'] == serial,
                ))) {
          throw const PlanLimitException(
            'ASSET_SERIAL_CONFLICT',
            'An asset with this serial number already exists.',
            status: 409,
          );
        }
      }
      final added = normalized
          .where(physicalAsset)
          .fold<int>(0, (sum, d) => sum + (d['quantity'] as int));
      final plan = ampsPlans[current?.plan];
      if (plan != null &&
          (!activePaid(current) ||
              inventoryUnits(all) + added > plan.assetLimit)) {
        throw const PlanLimitException(
          'ASSET_LIMIT_EXCEEDED',
          'This addition exceeds your active-device allowance. Reduce inventory or upgrade.',
        );
      }
      if (lock == null) {
        tx.create('amps_company_locks', companyId, {'revision': 1});
      } else {
        tx.update('amps_company_locks', companyId, {
          'revision': (lock.data['revision'] as num).toInt() + 1,
        });
      }
      final created = <Row>[];
      for (var i = 0; i < normalized.length; i++) {
        created.add(
          tx.create('assets', ids[i], {
            ...normalized[i],
            'serial_number':
                normalized[i]['serial_number'] ?? 'manual-${ids[i]}',
          }),
        );
      }
      if (key != null) {
        tx.create('amps_operations', key, {
          'company_id': companyId,
          'signature': signature,
          'asset_ids': ids,
        });
      }
      return created;
    });
  }

  Future<Row> update(
    String companyId,
    String id,
    Map<String, dynamic> patch, {
    bool archive = false,
  }) async {
    final sub = await SubscriptionRepo(service).findByCompany(companyId);
    return db.transaction((tx) async {
      final lock = await tx.get('amps_company_locks', companyId);
      final row = await tx.get('assets', id);
      final sr = sub == null ? null : await tx.get('subscriptions', sub.id);
      if (row == null || row.data['company_id'] != companyId) {
        throw const PlanLimitException(
          'NOT_FOUND',
          'Asset not found.',
          status: 404,
        );
      }
      final current = sr == null ? null : Subscription.fromRow(sr);
      final all = await tx.companyRows('assets', companyId);
      final listings = archive
          ? await tx.companyRows('listings', companyId)
          : <Row>[];
      if (archive &&
          ((row.data['reserved_quantity'] as num? ?? 0) > 0 ||
              listings.any(
                (l) =>
                    l.data['asset_id'] == id &&
                    {'active', 'draft'}.contains(l.data['status']),
              ))) {
        throw const PlanLimitException(
          'ASSET_IN_USE',
          'Withdraw live listings and resolve reservations before archiving.',
          status: 409,
        );
      }
      final merged = {...row.data, ...patch};
      final q = (merged['quantity'] as num?)?.toInt() ?? 1;
      final consumed =
          ((row.data['reserved_quantity'] as num?)?.toInt() ?? 0) +
          ((row.data['sold_quantity'] as num?)?.toInt() ?? 0);
      if (!archive && q < consumed) {
        throw const PlanLimitException(
          'ASSET_IN_USE',
          'Quantity cannot be below reserved and sold units.',
          status: 409,
        );
      }
      final before = row.data['archived'] == true || !physicalAsset(row.data)
          ? 0
          : (row.data['quantity'] as num).toInt();
      final after =
          archive || merged['archived'] == true || !physicalAsset(merged)
          ? 0
          : q;
      final plan = ampsPlans[current?.plan];
      if (after > before &&
          (!activePaid(current) ||
              plan == null ||
              inventoryUnits(all) + after - before > plan.assetLimit)) {
        throw const PlanLimitException(
          'ASSET_LIMIT_EXCEEDED',
          'This increase exceeds your active-device allowance.',
        );
      }
      if (lock == null) {
        tx.create('amps_company_locks', companyId, {'revision': 1});
      } else {
        tx.update('amps_company_locks', companyId, {
          'revision': (lock.data['revision'] as num).toInt() + 1,
        });
      }
      return tx.update('assets', id, {
        ...patch,
        if (archive) ...{
          'archived': true,
          'archived_at': DateTime.now().toUtc().toIso8601String(),
        },
      });
    });
  }

  static Map<String, dynamic> json(Row row) {
    final d = Map<String, dynamic>.from(row.data);
    final cents = d.remove('original_purchase_price_cents') as num?;
    if (d['serial_number'] == 'manual-${row.$id}') d['serial_number'] = null;
    d.remove('reserved_quantity');
    d.remove('sold_quantity');
    return {
      'id': row.$id,
      ...d,
      'original_purchase_price': cents == null ? null : cents / 100,
      'created_at': row.$createdAt,
      'updated_at': row.$updatedAt,
      'archived': d['archived'] == true,
      'archived_at': d['archived_at'],
    };
  }
}
