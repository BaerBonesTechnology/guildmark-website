import 'dart:convert';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/models/plan_catalog.dart';

Future<dynamic> boundedJson(Request request, {int maxBytes = 16384}) async {
  final body = await request.body();
  if (utf8.encode(body).length > maxBytes) {
    throw const PlanLimitException(
      'REQUEST_TOO_LARGE',
      'Request exceeds the supported size.',
      status: 413,
    );
  }
  return jsonDecode(body);
}
