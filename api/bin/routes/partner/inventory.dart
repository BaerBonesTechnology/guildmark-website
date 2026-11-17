import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/partner_inventory.dart';
import 'package:guildmark_api/services/request_json.dart';

Future<Response> onRequest(RequestContext c) async {
  final p = c.read<PartnerPrincipal?>(), db = c.read<FirebaseService?>();
  if (p == null) return Response(statusCode: 401);
  if (db == null) return Response(statusCode: 503);
  try {
    final service = PartnerInventory(db);
    await service.partner(p.partnerId);
    if (c.request.method == HttpMethod.post)
      return Response.json(
        body: await service.submit(
          p.partnerId,
          await boundedJson(c.request, maxBytes: 200000),
        ),
      );
    if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
    final rows = await db.tablesDB.listRows(
      databaseId: '',
      tableId: 'partner_bulk_imports',
      queries: [
        Query.equal('partner_id', p.partnerId),
        Query.orderDesc(r'$createdAt'),
        Query.limit(50),
      ],
    );
    return Response.json(
      headers: {'Cache-Control': 'no-store'},
      body: {
        'imports': rows.rows.map((r) => {'id': r.$id, ...r.data}).toList(),
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
