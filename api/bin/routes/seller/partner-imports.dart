import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/partner_inventory.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext c) async {
  final user = c.read<AuthPrincipal?>(), db = c.read<FirebaseService?>();
  if (user == null) return Response(statusCode: 401);
  if (db == null) return Response(statusCode: 503);
  try {
    final service = PartnerInventory(db);
    if (c.request.method == HttpMethod.post) {
      final body = await boundedJson(c.request, maxBytes: 2000);
      if (body is! Map || body['id'] is! String)
        throw InventoryFailure(400, 'Choose an import.');
      if (body['action'] == 'revoke') {
        await service.revoke(body['id'] as String, user);
        return Response.json(body: {'revoked': true});
      }
      if (!{'approve', 'reject'}.contains(body['action']))
        throw InventoryFailure(400, 'Choose approve or reject.');
      return Response.json(
        body: await service.apply(
          body['id'] as String,
          user.companyId,
          user.userId,
          allowFuture: body['allow_future_drafts'] == true,
          reject: body['action'] == 'reject',
        ),
      );
    }
    if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
    final imports = await db.tablesDB.listRows(
          databaseId: '',
          tableId: 'partner_bulk_imports',
          queries: [
            Query.equal('owner_company_id', user.companyId),
            Query.orderDesc(r'$createdAt'),
            Query.limit(100),
          ],
        ),
        grants = await db.tablesDB.listRows(
          databaseId: '',
          tableId: 'partner_inventory_delegations',
          queries: [
            Query.equal('company_id', user.companyId),
            Query.equal('active', true),
            Query.limit(100),
          ],
        );
    return Response.json(
      headers: {'Cache-Control': 'no-store'},
      body: {
        'imports': imports.rows.map((r) => {'id': r.$id, ...r.data}).toList(),
        'delegations': grants.rows
            .map((r) => {'id': r.$id, ...r.data})
            .toList(),
      },
    );
  } on PlanLimitException catch (e) {
    return Response.json(statusCode: e.status, body: {'message': e.message});
  } on FormatException {
    return Response.json(
      statusCode: 400,
      body: {'message': 'Invalid inventory request.'},
    );
  } on InventoryFailure catch (e) {
    return Response.json(statusCode: e.status, body: {'message': e.message});
  }
}
