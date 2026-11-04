/// Query descriptions used by the repositories and translated to Firestore.
library;

import 'dart:convert';
import 'package:uuid/uuid.dart';

class Query {
  static String _value(String method, Object? value, [Object? operand]) =>
      jsonEncode({
        'method': method,
        'value': value,
        'operand': ?operand,
      });
  static String equal(String field, Object? value) =>
      _value('equal', field, value ?? [null]);
  static String notEqual(String field, Object? value) =>
      _value('notEqual', field, value ?? [null]);
  static String lessThan(String field, Object? value) =>
      _value('lessThan', field, value);
  static String lessThanEqual(String field, Object? value) =>
      _value('lessThanEqual', field, value);
  static String greaterThan(String field, Object? value) =>
      _value('greaterThan', field, value);
  static String greaterThanEqual(String field, Object? value) =>
      _value('greaterThanEqual', field, value);
  static String isNull(String field) => _value('isNull', field);
  static String isNotNull(String field) => _value('isNotNull', field);
  static String contains(String field, Object? value) =>
      _value('contains', field, value);
  static String and(List<String> filters) => _value('and', filters);
  static String or(List<String> filters) => _value('or', filters);
  static String orderAsc(String field) => _value('orderAsc', field);
  static String orderDesc(String field) => _value('orderDesc', field);
  static String limit(int count) => _value('limit', count);
  static String offset(int count) => _value('offset', count);
  static String cursorAfter(String id) => _value('cursorAfter', id);
}

class ID {
  static String unique() => const Uuid().v4().replaceAll('-', '');
}

class Row {
  const Row({
    required this.$id,
    required this.$createdAt,
    required this.$updatedAt,
    required this.data,
  });
  final String $id;
  final String $createdAt;
  final String $updatedAt;
  final Map<String, dynamic> data;
}

class RowList {
  const RowList({required this.rows, required this.total});
  final List<Row> rows;
  final int total;
}

class DatastoreException implements Exception {
  const DatastoreException(this.message, {required this.code});
  final String? message;
  final int code;
  @override
  String toString() => 'DatastoreException($code): $message';
}
