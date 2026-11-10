import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/services/cms_entries.dart';

Future<Response> onRequest(RequestContext c, String kind) =>
    contentList(c, kind);
