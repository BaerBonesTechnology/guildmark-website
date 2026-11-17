/// Synthetic fixtures for loopback demo emulators only. Never reset existing
/// passwords, roles, stock counters, orders, or passkeys on startup.
library;

import 'dart:convert';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/firebase/firestore.dart';

class LocalFixtures {
  LocalFixtures(this.auth, this.store) {
    // Reuse the strict same-demo-project/loopback checks before any writes.
    FirebaseSessions(auth, store);
  }
  final FirebaseAuth auth;
  final FirebaseService store;
  static const password = 'GuildMark-local-2026!';
  static const buyerEmail = 'buyer@guildmark.test';
  static const sellerEmail = 'seller@guildmark.test';
  static const staffEmail = 'staff@guildmark.co';
  static const staffEmployeeId = 'local-staff-guildmark-co';
  static const Map<String, dynamic> staffClaims = {
    'role': 'staff',
    'staff_permissions': ['superadmin'],
  };
  static const buyerCompany = 'local-buyer-company';
  static const sellerCompany = 'local-seller-company';
  static const laptopListing = 'local-laptop-listing';
  static const monitorListing = 'local-monitor-listing';

  Future<Row> _ensure(
    String table,
    String id,
    Map<String, dynamic> data,
  ) async {
    try {
      final row = await store.tablesDB.getRow(
        databaseId: '',
        tableId: table,
        rowId: id,
      );
      if (row.data['local_fixture'] != true) {
        throw StateError('Refusing to replace non-fixture $table/$id');
      }
      return row;
    } on DatastoreException catch (e) {
      if (e.code != 404) rethrow;
    }
    return store.tablesDB.createRow(
      databaseId: '',
      tableId: table,
      rowId: id,
      data: {...data, 'local_fixture': true},
    );
  }

  Future<String> _identity(String email, {Map<String, dynamic>? claims}) async {
    final result = await auth.call('accounts:lookup', {
      'email': [email],
    }, admin: true);
    final users = result['users'] as List? ?? [];
    if (users.isNotEmpty) return (users.single as Map)['localId'] as String;
    final uid = (await auth.signUp(email, password))['localId'] as String;
    if (claims != null) {
      await auth.call('accounts:update', {
        'localId': uid,
        'customAttributes': jsonEncode(claims),
      }, admin: true);
    }
    return uid;
  }

  Future<void> _customer(String name, String email, String companyId) async {
    await _ensure('companies', companyId, {
      'name': 'Local $name Company',
      'size_band': '1-10',
      'industry': 'Technology',
    });
    final uid = await _identity(email);
    final user = await _ensure('users', 'local-${name.toLowerCase()}', {
      'email': email,
      'firebase_uid': uid,
      'company_id': companyId,
      'full_name': 'Local $name',
      'role': 'admin',
    });
    if (user.data['firebase_uid'] != uid) {
      throw StateError(
        'Fixture identity mismatch; restore Auth and Firestore together',
      );
    }
    await _ensure('subscriptions', '$companyId-subscription', {
      'company_id': companyId,
      'plan': 'free',
      'status': 'active',
    });
  }

  Future<void> seed() async {
    await _customer('Buyer', buyerEmail, buyerCompany);
    await _customer('Seller', sellerEmail, sellerCompany);
    final uid = await _identity(staffEmail, claims: staffClaims);
    final existing = await store.tablesDB.listRows(
      databaseId: '',
      tableId: 'guildmark_employees',
      queries: [Query.equal('email', staffEmail)],
    );
    // Preserve manually provisioned local employee IDs, roles and passkeys.
    // Only the fixture's initial superadmin provision maps to employee admin;
    // claims alone never confer access or bypass staff passkey verification.
    final employee = existing.rows.isNotEmpty
        ? existing.rows.single
        : await _ensure('guildmark_employees', staffEmployeeId, {
            'email': staffEmail,
            'firebase_uid': uid,
            'full_name': 'Local Staff',
            'role': 'admin',
            'is_active': true,
          });
    if (employee.data['firebase_uid'] != uid) {
      throw StateError(
        'Staff fixture identity mismatch; restore both emulators together',
      );
    }
    await _ensure('assets', 'local-laptop-asset', {
      'company_id': sellerCompany,
      'asset_type': 'laptop',
      'model_name': 'Dell Latitude 5420 (local demo)',
      'manufacturer': 'Dell',
      'model_number': 'Latitude 5420',
      'condition_grade': 'A',
      'quantity': 25,
      'reserved_quantity': 0,
      'sold_quantity': 0,
      'purchase_price_cents': 120000,
      'year_of_manufacture': 2021,
      'cpu_model': 'Intel Core i5',
      'cpu_cores': 4,
      'ram_gb': 16,
      'storage_gb': 256,
      'storage_type': 'SSD',
      'functional_status': 'Fully functional',
      'known_defects': 'Synthetic local fixture',
      'data_wipe_status': 'Wiped',
      'ships_from_location': 'New York, NY',
    });
    await _ensure('assets', 'local-monitor-asset', {
      'company_id': sellerCompany,
      'asset_type': 'monitor',
      'model_name': 'Dell P2419H (local demo)',
      'manufacturer': 'Dell',
      'condition_grade': 'B',
      'quantity': 10,
      'reserved_quantity': 0,
      'sold_quantity': 0,
      'screen_size_in': 24,
      'screen_resolution': '1920x1080',
      'functional_status': 'Fully functional',
      'known_defects': 'Synthetic local fixture',
      'ships_from_location': 'New York, NY',
    });
    for (final item in [
      (laptopListing, 'local-laptop-asset', 10000),
      (monitorListing, 'local-monitor-asset', 5000),
    ]) {
      await _ensure('listings', item.$1, {
        'asset_id': item.$2,
        'company_id': sellerCompany,
        'status': 'active',
        'listed_price_cents': item.$3,
        'valuation_flag': 'standard',
        'product_images': <String>[],
      });
    }
  }
}
