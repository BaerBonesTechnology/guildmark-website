/// JSON conversion helpers for freezed/json_serializable models.
///
/// Two date converters because the API talks two flavors of date:
///   - timestamps (ISO 8601 with time + zone) for created_at, last_sync_at, etc.
///   - dates only (YYYY-MM-DD) for purchase_date, invoice_date.
///
/// Apply with `@IsoDateTimeConverter()` or `@DateOnlyConverter()` on a field.
library;

import 'package:freezed_annotation/freezed_annotation.dart';

class IsoDateTimeConverter implements JsonConverter<DateTime, String> {
  const IsoDateTimeConverter();

  @override
  DateTime fromJson(String json) => DateTime.parse(json);

  @override
  String toJson(DateTime value) => value.toUtc().toIso8601String();
}

class NullableIsoDateTimeConverter implements JsonConverter<DateTime?, String?> {
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

/// Postgres returns `num` for NUMERIC columns and `int` for INT/BIGINT.
/// These small adapters smooth that out for `fromRow` factories so we don't
/// repeat the cast everywhere.
double? numToDoubleOrNull(Object? v) => v is num ? v.toDouble() : null;
int?    numToIntOrNull(Object? v)    => v is num ? v.toInt() : null;
