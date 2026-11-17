/// Optional local personas for the full stack at port offset 10000.
/// Both Firebase clients are pinned to demo-guildmark loopback emulators.
/// Never reads cloud credentials, contacts providers, or resets accounts.
library;
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/auth/firebase_auth.dart';

Future<void> main() async {
  final db = FirebaseService(
    projectId: 'demo-guildmark',
    emulatorHost: '127.0.0.1:18085',
  );
  final auth = FirebaseAuth(
    projectId: 'demo-guildmark',
    host: '127.0.0.1:19099',
  );
  Future<String> identity(String email) async {
    final r = await auth.call('accounts:lookup', {
      'email': [email],
    }, admin: true);
    final users = r['users'] as List? ?? [];
    final uid = users.isEmpty
        ? (await auth.signUp(email, 'GuildMark-local-2026!'))['localId']
              as String
        : (users.first as Map)['localId'] as String;
    await auth.call('accounts:update', {
      'localId': uid,
      'emailVerified': true,
    }, admin: true);
    return uid;
  }

  Future<void> put(String table, String id, Map<String, dynamic> data) async {
    try {
      final row = await db.tablesDB.getRow(
        databaseId: '',
        tableId: table,
        rowId: id,
      );
      if (row.data['local_fixture'] != true) throw StateError('Not a fixture');
      return;
    } on DatastoreException catch (e) {
      if (e.code != 404) rethrow;
    }
    await db.tablesDB.createRow(
      databaseId: '',
      tableId: table,
      rowId: id,
      data: {...data, 'local_fixture': true},
    );
  }

  final now = DateTime.now().toUtc();
  final start = DateTime.utc(now.year, now.month).toIso8601String(),
      end = DateTime.utc(now.year, now.month + 1).toIso8601String();
  try {
    for (final p in [
      ('seller-free', 'free', 'ClearDesk Resale', 2),
      ('seller-starter', 'starter', 'Northstar IT Services', 8),
      ('seller-growth', 'growth', 'RenewFleet ITAD', 30),
      ('buyer-pro', 'pro', 'Summit Enterprise IT', 75),
      ('buyer-free', 'free', 'Bright Start Studio', 0),
    ]) {
      final email = p.$1.replaceAll('-', '.') + '@guildmark.test',
          uid = await identity(email),
          company = 'persona-${p.$1}-company';
      final seller = p.$1.startsWith('seller');
      await put('companies', company, {
        'name': p.$3,
        'size_band': '11-50',
        'industry': 'Technology',
      });
      await put('users', 'persona-${p.$1}', {
        'email': email,
        'firebase_uid': uid,
        'company_id': company,
        'full_name': p.$3 + ' ' + (seller ? 'Seller' : 'Buyer'),
        'role': 'admin',
        'email_verified': true,
      });
      await put('subscriptions', 'persona-${p.$1}-subscription', {
        'company_id': company,
        'plan': p.$2,
        'status': 'active',
        'current_period_start': start,
        'current_period_end': end,
      });
      if (seller)
        await put('business_verifications', company, {
          'company_id': company,
          'status': 'approved',
          'reviewed_by': 'persona-superadmin',
          'reviewed_at': now.toIso8601String(),
          'business_name': p.$3,
        });
      for (var i = 0; i < (p.$4 > 0 ? 4 : 0); i++) {
        final asset = 'persona-${p.$1}-asset-$i';
        await put('assets', asset, {
          'company_id': company,
          'asset_type': i == 1
              ? 'desktop'
              : i == 2
              ? 'monitor'
              : 'laptop',
          'model_name': [
            'Lenovo ThinkPad T14 Gen 3',
            'Dell OptiPlex 7090',
            'Dell UltraSharp U2722D',
            'HP EliteBook 840 G8',
          ][i],
          'manufacturer': i == 0
              ? 'Lenovo'
              : i == 3
              ? 'HP'
              : 'Dell',
          'condition_grade': ['A', 'B', 'C', 'A'][i],
          'quantity': p.$4,
          'reserved_quantity': 0,
          'sold_quantity': 0,
          'ram_gb': i == 2 ? null : 16,
          'storage_gb': i == 2 ? null : 512,
          'cpu_model': i == 2 ? null : 'Intel Core i5',
          'year_of_manufacture': 2022,
          'purchase_price_cents': 120000,
          'original_purchase_price_cents': 120000,
          'functional_status': 'fully_functional',
          'data_wipe_status': 'certified',
          'warranty_status': 'none',
          'ships_from_location': 'New York, NY',
          'department': ['Engineering', 'Operations', 'Finance', 'Sales'][i],
          'serial_number': 'LOCAL-${p.$1}-$i',
        });
        if (seller)
          await put('listings', 'persona-${p.$1}-listing-$i', {
            'asset_id': asset,
            'company_id': company,
            'status': 'active',
            'listed_price_cents': 20000 + i * 7500,
            'fair_market_value_cents': 45000,
            'valuation_flag': 'standard',
            'product_images': <String>[],
          });
      }
      print('$email · ${p.$2}');
    }
    final staff = await identity('superadmin@guildmark.test');
    await auth.call('accounts:update', {
      'localId': staff,
      'customAttributes': '{"role":"staff","staff_permissions":["superadmin"]}',
    }, admin: true);
    await put('guildmark_employees', 'persona-superadmin', {
      'email': 'superadmin@guildmark.test',
      'firebase_uid': staff,
      'full_name': 'Local Superadmin',
      'role': 'superadmin',
      'is_active': true,
    });
    final partner = await identity('partner@guildmark.test');
    await put('partners', 'persona-partner', {
      'email': 'partner@guildmark.test',
      'firebase_uid': partner,
      'company_name': 'Local SecureCycle Services',
      'partner_code': 'LOCAL-CYCLE',
      'status': 'active',
      'rating': 4.9,
      'total_jobs_completed': 18,
      'available_balance_cents': 0,
      'city': 'New York',
      'state': 'NY',
      'service_radius_miles': 75,
    });
    for (var i = 0; i < 3; i++)
      await put('partner_service_assignments', 'persona-job-$i', {
        'partner_id': i == 0 ? null : 'persona-partner',
        'buyer_name': 'Local example business',
        'buyer_city': 'New York',
        'item_count': 5 + i * 5,
        'wipe_payout_cents': 4000 + i * 2000,
        'reimage_payout_cents': 1000,
        'status': i == 0 ? 'available' : 'claimed',
        'claimed_at': i == 0 ? null : now.toIso8601String(),
      });
    print('partner@guildmark.test · approved partner');
    print('superadmin@guildmark.test · passkey required');
  } finally {
    db.close();
    auth.close();
  }
}
