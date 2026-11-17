import 'package:guildmark_api/models/plan_catalog.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/request_json.dart';

Map<String, dynamic> validateCatalog(dynamic body) {
  if (body is! Map ||
      body['version'] is! int ||
      body['services'] is! List ||
      (body['services'] as List).length > 20)
    throw const FormatException(
      'Provide up to 20 services and the saved version.',
    );
  final services = <Map<String, dynamic>>[];
  final names = <String>{};
  for (final raw in body['services'] as List) {
    if (raw is! Map ||
        raw['name'] is! String ||
        raw['price_cents'] is! int ||
        raw['description'] is! String)
      throw const FormatException(
        'Each service needs a name, description and per-device price.',
      );
    final name = (raw['name'] as String).trim(),
        description = (raw['description'] as String).trim(),
        price = raw['price_cents'] as int;
    if (name.isEmpty ||
        name.length > 80 ||
        description.length > 500 ||
        price < 0 ||
        price > 10000000 ||
        !names.add(name.toLowerCase()))
      throw const FormatException(
        'Use unique service names and valid prices from \$0 to \$100,000.',
      );
    services.add({
      'name': name,
      'description': description,
      'price_cents': price,
    });
  }
  return {
    'services': services,
    'currency': 'USD',
    'unit': 'device',
    'version': body['version'],
  };
}

Future<Response> onRequest(RequestContext c) async {
  final partner = c.read<PartnerPrincipal?>();
  if (partner == null) return Response(statusCode: 401);
  final store = c.read<FirebaseService?>();
  if (store == null) return Response(statusCode: 503);
  final db = store.tablesDB;
  try {
    Row? saved;
    try {
      saved = await db.getRow(
        databaseId: '',
        tableId: 'partner_catalogs',
        rowId: partner.partnerId,
      );
    } on DatastoreException catch (e) {
      if (e.code != 404) rethrow;
    }
    if (c.request.method == HttpMethod.get)
      return Response.json(
        headers: {'Cache-Control': 'no-store'},
        body:
            saved?.data ??
            {
              'version': 0,
              'services': <Map<String, dynamic>>[],
              'currency': 'USD',
              'unit': 'device',
            },
      );
    if (c.request.method != HttpMethod.put) return Response(statusCode: 405);
    final input = validateCatalog(
      await boundedJson(c.request, maxBytes: 20000),
    );
    final result = await db.transaction((tx) async {
      final currentPartner = await tx.get('partners', partner.partnerId),
          old = await tx.get('partner_catalogs', partner.partnerId);
      if (currentPartner == null ||
          !{'active', 'pending'}.contains(currentPartner.data['status']))
        throw StateError('Partner access changed.');
      if ((old?.data['version'] ?? 0) != input['version'])
        throw StateError('Rates changed elsewhere. Refresh before saving.');
      final data = {
        ...input,
        'version': (input['version'] as int) + 1,
        'updated_at': DateTime.now().toUtc().toIso8601String(),
      };
      old == null
          ? tx.create('partner_catalogs', partner.partnerId, data)
          : tx.update('partner_catalogs', partner.partnerId, data);
      return data;
    });
    return Response.json(body: result);
  } on PlanLimitException catch (e) {
    return Response.json(statusCode: e.status, body: {'message': e.message});
  } on FormatException catch (e) {
    return Response.json(statusCode: 400, body: {'message': e.message});
  } on StateError catch (e) {
    return Response.json(statusCode: 409, body: {'message': e.message});
  }
}
