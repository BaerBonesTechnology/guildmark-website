import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/cms.dart';
import 'package:guildmark_api/models/plan_catalog.dart';

Handler middleware(Handler handler) => (context) async {
  try {
    final db = context.read<FirebaseService?>();
    if (db == null)
      return Response.json(
        statusCode: 503,
        body: {'error': 'Content storage unavailable.'},
      );
    await Cms(db).authorize(context.read<AuthPrincipal?>());
    final response = await handler(context);
    // Preserve the router not-found sentinel so more specific mounted routes run.
    if (response.statusCode == 404) return response;
    return response.copyWith(
      headers: {...response.headers, 'Cache-Control': 'no-store'},
    );
  } on CmsFailure catch (e) {
    return Response.json(
      statusCode: e.status,
      headers: {'Cache-Control': 'no-store'},
      body: {'error': e.message},
    );
  } on PlanLimitException catch (e) {
    return Response.json(statusCode: e.status, body: {'error': e.message});
  } on FormatException {
    return Response.json(statusCode: 400, body: {'error': 'Invalid request.'});
  } on DatastoreException catch (e) {
    if (e.code == 404)
      return Response.json(
        statusCode: 404,
        body: {'error': 'Content not found.'},
      );
    rethrow;
  }
};
