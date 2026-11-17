import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';

class InventoryFailure implements Exception {
  InventoryFailure(this.status, this.message);
  final int status;
  final String message;
}

class PartnerInventory {
  PartnerInventory(this.store);
  final FirebaseService store;
  static String delegationId(String partner, String company, String mode) =>
      sha256.convert(utf8.encode('$partner:$company:$mode')).toString();
  static List<Map<String, dynamic>> validate(dynamic input) {
    if (input is! List || input.isEmpty || input.length > 100)
      throw InventoryFailure(400, 'Import 1–100 product rows at a time.');
    final rows = <Map<String, dynamic>>[];
    for (var i = 0; i < input.length; i++) {
      final raw = input[i];
      if (raw is! Map)
        throw InventoryFailure(400, 'Invalid product row ${i + 1}.');
      String field(String key, int max) {
        final v = raw[key];
        if (v != null && v is! String)
          throw InventoryFailure(400, 'Row ${i + 1}: $key must be text.');
        final value = (v as String? ?? '').trim();
        if (value.length > max)
          throw InventoryFailure(400, 'Row ${i + 1}: $key is too long.');
        return value;
      }

      final model = field('model_name', 160),
          type = field('asset_type', 20),
          grade = field('condition_grade', 1),
          price = field('listed_price', 20),
          quantity = int.tryParse(field('quantity', 8)),
          wipe = field('data_wipe_status', 20),
          reference = field('wipe_reference', 300),
          image = field('reimage_required', 5).toLowerCase();
      if (model.isEmpty ||
          !{
            'laptop',
            'desktop',
            'monitor',
            'server',
            'phone',
            'tablet',
            'networking',
          }.contains(type) ||
          !{'A', 'B', 'C'}.contains(grade) ||
          quantity == null ||
          quantity < 1 ||
          quantity > 100000 ||
          !RegExp(r'^[0-9]+(?:\.[0-9]{1,2})?$').hasMatch(price) ||
          !{'wiped', 'not_wiped'}.contains(wipe) ||
          !{'true', 'false', ''}.contains(image))
        throw InventoryFailure(
          400,
          'Row ${i + 1}: check model, category, grade, quantity, price and wipe/imaging flags.',
        );
      final cents = (double.parse(price) * 100).round();
      if (cents <= 0 || cents > 100000000)
        throw InventoryFailure(
          400,
          'Row ${i + 1}: enter a positive price up to USD 1,000,000.',
        );
      if (wipe == 'wiped' && reference.isEmpty)
        throw InventoryFailure(
          400,
          'Row ${i + 1}: already-wiped stock needs a wipe reference or evidence note.',
        );
      final functional = field('functional_status', 40);
      if (!{
        '',
        'fully_functional',
        'functional_with_issues',
        'for_parts',
      }.contains(functional))
        throw InventoryFailure(400, 'Row ${i + 1}: invalid functional status.');
      int? optionalNumber(String key, int max) {
        final value = field(key, 10);
        if (value.isEmpty) return null;
        final n = int.tryParse(value);
        if (n == null || n < 1 || n > max)
          throw InventoryFailure(400, 'Row ${i + 1}: invalid $key.');
        return n;
      }

      rows.add({
        'model_name': model,
        'manufacturer': field('manufacturer', 80),
        'cpu_model': field('cpu_model', 120),
        'ram_gb': optionalNumber('ram_gb', 8192),
        'storage_gb': optionalNumber('storage_gb', 1000000),
        'functional_status': functional.isEmpty ? null : functional,
        'known_defects': field('known_defects', 500),
        'asset_type': type,
        'condition_grade': grade,
        'quantity': quantity,
        'listed_price_cents': cents,
        'data_wipe_status': wipe,
        'wipe_reference': reference,
        'reimage_required': image == 'true',
        'service_requirement': image == 'true'
            ? (wipe == 'wiped' ? 'reimage_only' : 'wipe_and_reimage')
            : 'none',
      });
    }
    return rows;
  }

  Future<Row> partner(String id) async {
    final p = await store.tablesDB.getRow(
      databaseId: '',
      tableId: 'partners',
      rowId: id,
    );
    if (p.data['status'] != 'active')
      throw InventoryFailure(403, 'Approved ITAD partner access required.');
    return p;
  }

  Future<Map<String, dynamic>> submit(String partnerId, dynamic body) async {
    await partner(partnerId);
    if (body is! Map ||
        body['id'] is! String ||
        !RegExp(r'^[a-zA-Z0-9_-]{1,100}$').hasMatch(body['id'] as String) ||
        !{'own', 'consigned'}.contains(body['ownership']) ||
        body['owner_email'] is! String)
      throw InventoryFailure(
        400,
        'Choose ownership, seller email and a valid import ID.',
      );
    final rows = validate(body['rows']),
        email = (body['owner_email'] as String).trim().toLowerCase();
    if (email.length > 254 || !email.contains('@'))
      throw InventoryFailure(400, 'Enter the seller account email.');
    final owners = await store.tablesDB.listRows(
      databaseId: '',
      tableId: 'users',
      queries: [Query.equal('email', email), Query.limit(2)],
    );
    if (owners.rows.length != 1)
      throw InventoryFailure(
        400,
        'Ask the seller to confirm their registered account email.',
      );
    final owner = owners.rows.single,
        company = owner.data['company_id'] as String,
        id = body['id'] as String,
        mode = body['ownership'] as String;
    final requestHash = sha256
        .convert(
          utf8.encode(
            jsonEncode({'company': company, 'ownership': mode, 'rows': rows}),
          ),
        )
        .toString();
    final data = await store.tablesDB.transaction((tx) async {
      final currentPartner = await tx.get('partners', partnerId),
          old = await tx.get('partner_bulk_imports', id);
      if (currentPartner?.data['status'] != 'active')
        throw InventoryFailure(403, 'Partner access changed.');
      if (old != null) {
        if (old.data['request_hash'] != requestHash)
          throw InventoryFailure(
            409,
            'This import ID was already used for different inventory. Review recent imports before creating a new batch.',
          );
        if (old.data['partner_id'] != partnerId)
          throw InventoryFailure(409, 'Import ID already exists.');
        return {'id': id, ...old.data};
      }
      final record = {
        'request_hash': requestHash,
        'partner_id': partnerId,
        'partner_name': currentPartner!.data['company_name'],
        'owner_email': email,
        'owner_company_id': company,
        'ownership': mode,
        'rows': rows,
        'status': 'pending',
        'created_at': DateTime.now().toUtc().toIso8601String(),
      };
      tx.create('partner_bulk_imports', id, record);
      return {'id': id, ...record};
    });
    final grant = await store.tablesDB.listRows(
      databaseId: '',
      tableId: 'partner_inventory_delegations',
      queries: [
        Query.equal('partner_id', partnerId),
        Query.equal('company_id', company),
        Query.equal('ownership', mode),
        Query.equal('active', true),
        Query.limit(1),
      ],
    );
    if (grant.rows.isNotEmpty && data['status'] == 'pending') {
      try {
        return await apply(
          id,
          company,
          grant.rows.single.data['approved_by'] as String,
          automatic: true,
        );
      } on InventoryFailure {
        /* Pending approval remains visible if authority was revoked. */
      }
    }
    return data;
  }

  Future<Map<String, dynamic>> apply(
    String id,
    String company,
    String userId, {
    bool automatic = false,
    bool allowFuture = false,
    bool reject = false,
  }) async {
    return store.tablesDB.transaction((tx) async {
      final batch = await tx.get('partner_bulk_imports', id),
          owner = await tx.get('users', userId);
      if (batch == null ||
          batch.data['owner_company_id'] != company ||
          owner?.data['company_id'] != company ||
          owner?.data['role'] != 'admin')
        throw InventoryFailure(403, 'Seller administrator approval required.');
      if (batch.data['status'] != 'pending') return {'id': id, ...batch.data};
      final partnerId = batch.data['partner_id'] as String,
          mode = batch.data['ownership'] as String,
          grantId = delegationId(partnerId, company, mode);
      final p = await tx.get('partners', partnerId),
          grant = await tx.get('partner_inventory_delegations', grantId);
      if (p?.data['status'] != 'active')
        throw InventoryFailure(403, 'Partner access changed.');
      if (automatic &&
          grant != null &&
          DateTime.parse(
            batch.data['created_at'] as String,
          ).isBefore(DateTime.parse(grant.data['approved_at'] as String)))
        throw InventoryFailure(
          403,
          'This older batch still needs explicit seller approval.',
        );
      if (automatic &&
          (grant?.data['active'] != true ||
              grant?.data['approved_by'] != userId))
        throw InventoryFailure(403, 'Owner delegation is no longer active.');
      if (mode == 'own' &&
          p?.data['seller_company_id'] != null &&
          p?.data['seller_company_id'] != company)
        throw InventoryFailure(
          409,
          'This partner is already linked to another seller business.',
        );
      final rows = List<Map<String, dynamic>>.from(
        (batch.data['rows'] as List).map(
          (r) => Map<String, dynamic>.from(r as Map),
        ),
      );
      if (!reject) {
        for (var i = 0; i < rows.length; i++) {
          final assetId = '$id-asset-$i', listingId = '$id-listing-$i';
          await tx.get('assets', assetId);
          await tx.get('listings', listingId);
        }
      }
      final now = DateTime.now().toUtc().toIso8601String();
      if (!reject) {
        for (var i = 0; i < rows.length; i++) {
          final r = rows[i], assetId = '$id-asset-$i';
          tx.create('assets', assetId, {
            'company_id': company,
            'model_name': r['model_name'],
            for (final key in [
              'manufacturer',
              'cpu_model',
              'ram_gb',
              'storage_gb',
              'functional_status',
              'known_defects',
            ])
              key: r[key],
            'asset_type': r['asset_type'],
            'condition_grade': r['condition_grade'],
            'quantity': r['quantity'],
            'reserved_quantity': 0,
            'sold_quantity': 0,
            'data_wipe_status': r['data_wipe_status'],
            'wipe_reference': r['wipe_reference'],
            'wipe_reported_by_partner': partnerId,
            'reimage_required': r['reimage_required'],
            'service_requirement': r['service_requirement'],
            'ownership': mode,
            'supplier_partner_id': partnerId,
            'bulk_import_id': id,
          });
          tx.create('listings', '$id-listing-$i', {
            'asset_id': assetId,
            'company_id': company,
            'listed_price_cents': r['listed_price_cents'],
            'status': 'draft',
            'valuation_flag': 'insufficient_data',
            'supplier_partner_id': partnerId,
            'service_requirement': r['service_requirement'],
            'bulk_import_id': id,
            'product_images': <String>[],
          });
        }
        if (mode == 'own')
          tx.update('partners', partnerId, {'seller_company_id': company});
        if (allowFuture) {
          final data = {
            'partner_id': partnerId,
            'company_id': company,
            'ownership': mode,
            'active': true,
            'approved_by': userId,
            'approved_at': now,
          };
          if (grant == null)
            tx.create('partner_inventory_delegations', grantId, data);
          else
            tx.update('partner_inventory_delegations', grantId, data);
        }
      }
      final result = {
        ...batch.data,
        'status': reject ? 'rejected' : 'applied',
        'approved_by': userId,
        'resolved_at': now,
        'listing_count': reject ? 0 : rows.length,
      };
      tx.update('partner_bulk_imports', id, result);
      return {'id': id, ...result};
    });
  }

  Future<void> revoke(String id, AuthPrincipal user) async {
    await store.tablesDB.transaction((tx) async {
      final grant = await tx.get('partner_inventory_delegations', id),
          owner = await tx.get('users', user.userId);
      if (grant?.data['company_id'] != user.companyId ||
          owner?.data['company_id'] != user.companyId ||
          owner?.data['role'] != 'admin')
        throw InventoryFailure(403, 'Seller administrator access required.');
      tx.update('partner_inventory_delegations', id, {
        'active': false,
        'revoked_at': DateTime.now().toUtc().toIso8601String(),
      });
    });
  }
}
