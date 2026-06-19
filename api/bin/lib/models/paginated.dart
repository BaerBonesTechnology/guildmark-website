import 'package:freezed_annotation/freezed_annotation.dart';

part 'paginated.freezed.dart';
part 'paginated.g.dart';

@Freezed(genericArgumentFactories: true)
abstract class PaginatedResponse<T> with _$PaginatedResponse<T> {
  const PaginatedResponse._();

  const factory PaginatedResponse({
    required List<T> data,
    required int total,
    required int page,
    required int pageSize,
    required int totalPages,
  }) = _PaginatedResponse;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) parseData,
  ) => _$PaginatedResponseFromJson(json, (json) => parseData(json));

  factory PaginatedResponse.paginate({
    required List<T> data,
    required int total,
    required int page,
    required int pageSize,
  }) => PaginatedResponse(
    data: data,
    total: total,
    page: page,
    pageSize: pageSize,
    totalPages: (total / pageSize).ceil(),
  );
}
