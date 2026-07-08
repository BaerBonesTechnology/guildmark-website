/// Small stitched-read helpers shared by routes that used to JOIN for
/// notification metadata (contact email, product name). Appwrite has no
/// joins — these run the equivalent two-step lookups.
library;

import 'package:dart_appwrite/dart_appwrite.dart'
    show AppwriteException, Query;

import 'appwrite_client.dart';
import 'collections.dart';

/// Contact email for a company: the admin user if one exists, else the
/// oldest user (mirrors `ORDER BY u.role = 'admin' DESC, u.created_at`).
Future<String?> companyContactEmail(
  AppwriteService aw,
  String companyId,
) async {
  final db = aw.tablesDB;
  final admins = await db.listRows(
    databaseId: Aw.databaseId,
    tableId: Aw.users,
    queries: [
      Query.equal('company_id', companyId),
      Query.equal('role', 'admin'),
      Query.limit(1),
    ],
  );
  if (admins.rows.isNotEmpty) {
    return admins.rows.first.data['email'] as String?;
  }
  final oldest = await db.listRows(
    databaseId: Aw.databaseId,
    tableId: Aw.users,
    queries: [
      Query.equal('company_id', companyId),
      Query.orderAsc(r'$createdAt'),
      Query.limit(1),
    ],
  );
  return oldest.rows.isEmpty
      ? null
      : oldest.rows.first.data['email'] as String?;
}

/// Product name for a listing (listing → asset.model_name). Null when the
/// listing or asset row is missing.
Future<String?> listingProductName(
  AppwriteService aw,
  String listingId,
) async {
  final db = aw.tablesDB;
  try {
    final listing = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.listings,
      rowId: listingId,
    );
    final asset = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.assets,
      rowId: listing.data['asset_id'] as String,
    );
    return asset.data['model_name'] as String?;
  } on AppwriteException catch (e) {
    if (e.code == 404) return null;
    rethrow;
  }
}

/// Seller company id for a listing, or null if the listing is gone.
Future<String?> listingSellerCompanyId(
  AppwriteService aw,
  String listingId,
) async {
  try {
    final listing = await aw.tablesDB.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.listings,
      rowId: listingId,
    );
    return listing.data['company_id'] as String?;
  } on AppwriteException catch (e) {
    if (e.code == 404) return null;
    rethrow;
  }
}
