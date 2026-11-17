import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/services/cms_entries.dart';

Future<Response> onRequest(RequestContext c, String kind, String id) =>
    contentDetail(c, kind, id);
