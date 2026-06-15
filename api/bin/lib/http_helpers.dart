/// Shared response helpers — keeps error JSON consistent across routes.
import 'package:dart_frog/dart_frog.dart';

Response jsonError(int status, String code, String message) {
  return Response.json(
    statusCode: status,
    body: {'code': code, 'error': message},
  );
}

Response unauthorized([String message = 'Unauthorized']) =>
    jsonError(401, 'UNAUTHORIZED', message);

Response forbidden([String message = 'Forbidden']) =>
    jsonError(403, 'FORBIDDEN', message);

Response badRequest(String message, {String code = 'BAD_REQUEST'}) =>
    jsonError(400, code, message);

Response notFound([String message = 'Not found']) =>
    jsonError(404, 'NOT_FOUND', message);

Response serverError([String message = 'Internal server error']) =>
    jsonError(500, 'INTERNAL', message);

/// 501 Not Implemented — used by routes whose repo/integration isn't wired
/// up yet. Returning this (instead of a fake 200) means the frontend
/// surfaces the gap immediately during development.
Response notImplemented(String hint) => jsonError(501, 'NOT_IMPLEMENTED', hint);
