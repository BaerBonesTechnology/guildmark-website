import 'package:dart_appwrite/dart_appwrite.dart'
    show AppwriteException, Query, TablesDB;
import 'package:dart_appwrite/models.dart' show Row;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';

Future<Response> onRequest(RequestContext context, String id) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.role != 'admin') return forbidden();

  if (context.request.method != HttpMethod.delete) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'DELETE only');
  }

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }
  final db = aw.tablesDB;

  // Resolve the user's company (the PG version deleted the company and let
  // ON DELETE CASCADE remove everything else).
  Row user;
  try {
    user = await db.getRow(
      databaseId: Aw.databaseId,
      tableId: Aw.users,
      rowId: id,
    );
  } on AppwriteException catch (e) {
    if (e.code == 404) return notFound('User not found');
    rethrow;
  }
  final companyId = user.data['company_id'] as String;

  // orders referenced companies with ON DELETE RESTRICT — the PG delete blew
  // up (500) when the company had orders. Mirror that invariant explicitly.
  final orderRefs = await db.listRows(
    databaseId: Aw.databaseId,
    tableId: Aw.orders,
    queries: [
      Query.or([
        Query.equal('seller_company_id', companyId),
        Query.equal('buyer_company_id', companyId),
      ]),
      Query.limit(1),
    ],
  );
  if (orderRefs.total > 0) {
    return serverError('Company has orders and cannot be deleted');
  }

  // App-side cascade (Appwrite has no FK cascades and no transactions).
  // Children are deleted first and the company row LAST — it is the commit
  // point, so a partial failure leaves the company present and the request
  // retryable. Race window: rows created concurrently mid-cascade (e.g. a
  // login inserting a refresh token) can be orphaned; accepted for an
  // admin-only destructive endpoint.

  // 1. Users of the company + their tokens.
  await _forEach(db, Aw.users, [Query.equal('company_id', companyId)], (
    u,
  ) async {
    await _deleteWhere(db, Aw.refreshTokens, [Query.equal('user_id', u.$id)]);
    await _deleteWhere(db, Aw.passwordResetTokens, [
      Query.equal('user_id', u.$id),
    ]);
    await db.deleteRow(
      databaseId: Aw.databaseId,
      tableId: Aw.users,
      rowId: u.$id,
    );
  });

  // 2. Listings (+ offers on them).
  await _forEach(db, Aw.listings, [Query.equal('company_id', companyId)], (
    l,
  ) async {
    await _deleteWhere(db, Aw.buyerOffers, [Query.equal('listing_id', l.$id)]);
    await db.deleteRow(
      databaseId: Aw.databaseId,
      tableId: Aw.listings,
      rowId: l.$id,
    );
  });

  // 3. Assets (+ their valuations).
  await _forEach(db, Aw.assets, [Query.equal('company_id', companyId)], (
    a,
  ) async {
    await _deleteWhere(db, Aw.assetValuations, [
      Query.equal('asset_id', a.$id),
    ]);
    await db.deleteRow(
      databaseId: Aw.databaseId,
      tableId: Aw.assets,
      rowId: a.$id,
    );
  });

  // 4. Offers this company made on other companies' listings.
  await _deleteWhere(db, Aw.buyerOffers, [
    Query.equal('buyer_company_id', companyId),
  ]);

  // 5. Remaining company-scoped children.
  for (final table in [
    Aw.mdmConnections,
    Aw.taxInvoices,
    Aw.valuationSnapshots,
    Aw.subscriptionInvoices,
    Aw.subscriptions,
  ]) {
    await _deleteWhere(db, table, [Query.equal('company_id', companyId)]);
  }

  // 6. The company itself — commit point.
  try {
    await db.deleteRow(
      databaseId: Aw.databaseId,
      tableId: Aw.companies,
      rowId: companyId,
    );
  } on AppwriteException catch (e) {
    // Company row already gone → mirror the empty PG RETURNING set.
    if (e.code == 404) return notFound('User not found');
    rethrow;
  }

  return Response(statusCode: 204);
}

/// Runs [action] for every row matching [queries] (paged; the action must
/// delete the row so the query drains).
Future<void> _forEach(
  TablesDB db,
  String tableId,
  List<String> queries,
  Future<void> Function(Row row) action,
) async {
  while (true) {
    final page = await db.listRows(
      databaseId: Aw.databaseId,
      tableId: tableId,
      queries: [...queries, Query.limit(100)],
    );
    if (page.rows.isEmpty) return;
    for (final row in page.rows) {
      await action(row);
    }
    if (page.rows.length < 100) return;
  }
}

/// Bulk DELETE … WHERE — list matching rows and delete each (no multi-row
/// delete in Appwrite).
Future<void> _deleteWhere(
  TablesDB db,
  String tableId,
  List<String> queries,
) => _forEach(
  db,
  tableId,
  queries,
  (row) => db.deleteRow(
    databaseId: Aw.databaseId,
    tableId: tableId,
    rowId: row.$id,
  ),
);
