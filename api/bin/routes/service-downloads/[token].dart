import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/service_files.dart';

Future<Response> onRequest(RequestContext c, String token) async {
  if (c.request.method != HttpMethod.get) return Response(statusCode: 405);
  final db = c.read<FirebaseService?>();
  if (db == null) return Response(statusCode: 503);
  try {
    return await ServiceFiles(db).download(token);
  } on FileFailure catch (e) {
    return Response.json(statusCode: e.status, body: {'message': e.message});
  }
}
