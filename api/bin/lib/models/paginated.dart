/// Paginated wrapper — mirrors `PaginatedResponse<T>` in types.ts.
///
/// Generic JSON serialization requires `genericArgumentFactories: true`, set
/// globally in `build.yaml`. Callers pass a `T Function(Object?)` to
/// `fromJson` and `Object? Function(T)` to `toJson` so the inner items can
/// be (de)serialized through the right factory.

import 'package:freezed_annotation/freezed_annotation.dart';

part 'paginated.freezed.dart';
part 'paginated.g.dart';

@Freezed(genericArgumentFactories: true)
class PaginatedResponse<T> with _$PaginatedResponse<T> {
  const PaginatedResponse._();

  const factory PaginatedResponse({
    required List<T> data,
    required int     total,
    required int     page,
    required int     pageSize,
    required int     totalPages,
  }) = _PaginatedResponse;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) =>
      _$PaginatedResponseFromJson(json, fromJsonT);

  /// Convenience constructor — calculates `totalPages` automatically.
  factory PaginatedResponse.paginate({
    required List<T> data,
    required int total,
    required int page,
    required int pageSize,
  }) =>
      PaginatedResponse(
        data:       data,
        total:      total,
        page:       page,
        pag