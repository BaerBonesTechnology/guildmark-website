import 'dart:convert';

import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:postgres/postgres.dart';

class IsoDateTimeConverter implements JsonConverter<DateTime, String> {
  const IsoDateTimeConverter();

  @override
  DateTime fromJson(String json) => DateTime.parse(json);

  @override
  String toJson(DateTime value) => value.toUtc().toIso8601String();
}

class NullableIsoDateTimeConverter
    implements JsonConverter<DateTime?, String?> {
  const NullableIsoDateTimeConverter();

  @override
  DateTime? fromJson(String? json) =>
      json == null ? null : DateTime.parse(json);

  @override
  String? toJson(DateTime? value) => value?.toUtc().toIso8601String();
}

class DateOnlyConverter implements JsonConverter<DateTime, String> {
  const DateOnlyConverter();

  @override
  DateTime fromJson(String json) => DateTime.parse(json);

  @override
  String toJson(DateTime value) =>
      '${value.year.toString().padLeft(4, '0')}-'
      '${value.month.toString().padLeft(2, '0')}-'
      '${value.day.toString().padLeft(2, '0')}';
}

class NullableDateOnlyConverter implements JsonConverter<DateTime?, String?> {
  const NullableDateOnlyConverter();

  @override
  DateTime? fromJson(String? json) =>
      json == null ? null : DateTime.parse(json);

  @override
  String? toJson(DateTime? value) {
    if (value == null) return null;
    return '${value.year.toString().padLeft(4, '0')}-'
        '${value.month.toString().padLeft(2, '0')}-'
        '${value.day.toString().padLeft(2, '0')}';
  }
}

double? numToDoubleOrNull(Object? v) {
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v);
  return null;
}

int? numToIntOrNull(Object? v) {
  if (v is num) return v.toInt();
  if (v is String) return int.tryParse(v);
  return null;
}

String enumStr(Object? v) {
  if (v is String) return v;
  if (v is UndecodedBytes) return utf8.decode(v.bytes);
  throw ArgumentError('Cannot convert $v to enum string');
}

String? enumStrOrNull(Object? v) {
  if (v == null) return null;
  if (v is String) return v;
  if (v is UndecodedBytes) return utf8.decode(v.bytes);
  throw ArgumentError('Cannot convert $v to enum string');
}
