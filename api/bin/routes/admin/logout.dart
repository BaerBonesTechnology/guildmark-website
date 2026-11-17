import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/auth/firebase_routes.dart';

Future<Response> onRequest(RequestContext context) async {
  if (firebaseSessions(context) != null) {
    return firebaseAuthRoute(context, 'logout', kind: 'staff');
  }
  return Response.json(body: {'ok': true});
}
