/// GET / — health check. Used by docker-compose, k8s probes, and uptime
/// monitors. Cheap, never hits the DB so it stays green during outages.
import 'package:dart_frog/dart_frog.dart';

Response onRequest(RequestContext context) {
  return Response.json(body: {'status': 'ok', 'service': 'astech-api'});
}
