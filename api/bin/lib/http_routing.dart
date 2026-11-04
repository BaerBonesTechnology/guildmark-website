import 'package:dart_frog/dart_frog.dart';

/// Hosting forwards /api unchanged; direct API URLs remain supported locally.
Handler apiRouter(Handler handler) {
  final router = Router()
    ..mount('/api', handler)
    ..mount('/', handler);
  return router.call;
}
