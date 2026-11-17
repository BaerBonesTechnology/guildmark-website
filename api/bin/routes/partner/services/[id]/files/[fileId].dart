import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/services/service_files.dart';

Future<Response> onRequest(RequestContext c, String id, String fileId) =>
    serviceFileRoute(c, assignmentId: id, fileId: fileId);
