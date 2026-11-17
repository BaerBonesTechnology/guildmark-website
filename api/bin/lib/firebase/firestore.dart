/// Server-side Firestore access. Browser SDK access is denied by security rules.
library;

import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:googleapis_auth/auth_io.dart' as auth;
import 'package:http/http.dart' as http;

import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/firebase/query.dart';
import 'package:guildmark_api/firebase/schema.dart';

export 'query.dart';

class FirebaseService {
  FirebaseService({
    required this.projectId,
    this.databaseId = '(default)',
    this.storageBucket,
    String? emulatorHost,
    this._client,
  }) : _emulatorHost = emulatorHost;

  final String projectId;
  final String databaseId;
  final String? storageBucket;
  final String? _emulatorHost;
  http.Client? _client;
  late final TablesDB tablesDB = TablesDB(this);

  static FirebaseService? fromConfig(AppConfig config) {
    final project = config.firebaseProjectId;
    if (project == null) return null;
    return FirebaseService(
      projectId: project,
      databaseId: config.firestoreDatabaseId,
      storageBucket: config.firebaseStorageBucket,
      emulatorHost: Platform.environment['FIRESTORE_EMULATOR_HOST'],
    );
  }

  String get parent => 'projects/$projectId/databases/$databaseId/documents';
  String get endpoint => _emulatorHost == null
      ? 'https://firestore.googleapis.com'
      : 'http://$_emulatorHost';

  Future<http.Client> get client async {
    if (_client != null) return _client!;
    if (_emulatorHost != null) return _client = http.Client();
    return _client = await auth.clientViaApplicationDefaultCredentials(
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    );
  }

  Future<dynamic> request(
    String method,
    String path, [
    Map<String, dynamic>? body,
  ]) async {
    final request = http.Request(method, Uri.parse('$endpoint/v1/$path'))
      ..headers['Content-Type'] = 'application/json'
      ..body = body == null ? '' : jsonEncode(body);
    if (_emulatorHost != null) {
      request.headers['Authorization'] = 'Bearer owner';
    }
    final response = await (await client).send(request);
    final text = await response.stream.bytesToString();
    final dynamic decoded = text.isEmpty ? null : jsonDecode(text);
    if (response.statusCode >= 400) {
      final error = decoded is Map ? decoded['error'] as Map? : null;
      throw DatastoreException(
        error?['message'] as String? ?? 'Firestore request failed',
        code: response.statusCode == 412 ? 409 : response.statusCode,
      );
    }
    return decoded;
  }

  void close() => _client?.close();
}

Object encodeValue(Object? value) {
  if (value == null) return {'nullValue': null};
  if (value is bool) return {'booleanValue': value};
  if (value is int) return {'integerValue': value.toString()};
  if (value is num) return {'doubleValue': value};
  if (value is String) return {'stringValue': value};
  if (value is List) {
    return {
      'arrayValue': {'values': value.map(encodeValue).toList()},
    };
  }
  if (value is Map) {
    return {
      'mapValue': {
        'fields': value.map(
          (key, value) => MapEntry(key.toString(), encodeValue(value)),
        ),
      },
    };
  }
  throw ArgumentError('Unsupported Firestore value: ${value.runtimeType}');
}

dynamic decodeValue(Map<String, dynamic> value) {
  if (value.containsKey('nullValue')) return null;
  if (value.containsKey('integerValue')) {
    return int.parse(value['integerValue'].toString());
  }
  if (value.containsKey('doubleValue')) return value['doubleValue'];
  if (value.containsKey('booleanValue')) return value['booleanValue'];
  if (value.containsKey('stringValue')) return value['stringValue'];
  if (value.containsKey('timestampValue')) return value['timestampValue'];
  if (value.containsKey('arrayValue')) {
    return ((value['arrayValue'] as Map)['values'] as List? ?? [])
        .map((item) => decodeValue(Map<String, dynamic>.from(item as Map)))
        .toList();
  }
  if (value.containsKey('mapValue')) {
    return ((value['mapValue'] as Map)['fields'] as Map? ?? {}).map(
      (key, item) => MapEntry(
        key.toString(),
        decodeValue(Map<String, dynamic>.from(item as Map)),
      ),
    );
  }
  return value['referenceValue'];
}

/// Buffered writes with serializable reads, defaults, and unique constraints.
class FirestoreTransaction {
  FirestoreTransaction._(this._db, this._token);
  final TablesDB _db;
  final String _token;
  final _documents = <String, Map<String, dynamic>?>{};
  final _writes = <Map<String, dynamic>>[];
  final _written = <String>{};

  /// Company-scoped snapshot query for quota checks. The company quota lock
  /// document serializes competing inserts, including initially empty sets.
  Future<List<Row>> companyRows(String table, String companyId) async {
    if (_writes.isNotEmpty) throw StateError('Read before writing');
    final result =
        await _db.service.request(
              'POST',
              '${_db.service.parent}:runQuery',
              {
                'transaction': _token,
                'structuredQuery': {
                  'from': [
                    {'collectionId': table},
                  ],
                  'where': {
                    'fieldFilter': {
                      'field': {'fieldPath': 'company_id'},
                      'op': 'EQUAL',
                      'value': encodeValue(companyId),
                    },
                  },
                },
              },
            )
            as List;
    return result
        .where((r) => (r as Map).containsKey('document'))
        .map(
          (r) => _db._row(
            Map<String, dynamic>.from((r as Map)['document'] as Map),
          ),
        )
        .toList();
  }

  Future<Row?> get(String table, String id) async {
    if (_writes.isNotEmpty) {
      throw StateError('Read all documents before writing');
    }
    final name = _db._name(table, id);
    if (!_documents.containsKey(name)) {
      try {
        _documents[name] = await _db._readInTransaction(name, _token);
      } on DatastoreException catch (error) {
        if (error.code != 404) rethrow;
        _documents[name] = null;
      }
    }
    final doc = _documents[name];
    return doc == null ? null : _db._row(doc);
  }

  Row create(String table, String id, Map<String, dynamic> data) =>
      _write(table, id, data, create: true);

  Row update(String table, String id, Map<String, dynamic> data) =>
      _write(table, id, data, create: false);

  Row _write(
    String table,
    String id,
    Map<String, dynamic> patch, {
    required bool create,
  }) {
    final name = _db._name(table, id);
    if (!_written.add(name)) {
      throw StateError('Write each document once per transaction');
    }
    final existing = _documents[name];
    if (!create && existing == null) {
      throw StateError('Read the existing document before update');
    }
    final old = existing == null
        ? <String, dynamic>{}
        : _db._row(existing).data;
    final now = DateTime.now().toUtc().toIso8601String();
    final data = <String, dynamic>{
      ...?(create ? collectionDefaults[table] : null),
      ...old,
      ...patch,
      '_createdAt': existing == null ? now : _db._row(existing).$createdAt,
      '_updatedAt': now,
    };
    final model = data['model_name'];
    if (model is String) {
      final lower = model.toLowerCase();
      data['_searchTokens'] = {
        for (var size = 1; size <= 3; size++)
          for (var i = 0; i + size <= lower.length; i++)
            lower.substring(i, i + size),
      }.toList();
    }
    final previous = _db._locks(table, create ? {} : old).toSet();
    final next = _db._locks(table, data).toSet();
    _writes.addAll([
      {
        'update': {'name': name, 'fields': _db._fields(data)},
        'currentDocument': create
            ? {'exists': false}
            : {'updateTime': existing!['updateTime']},
      },
      for (final lock in previous.difference(next)) {'delete': lock},
      for (final lock in next.difference(previous))
        {
          'update': {
            'name': lock,
            'fields': _db._fields({'owner': id}),
          },
          'currentDocument': {'exists': false},
        },
    ]);
    return _db._row({'name': name, 'fields': _db._fields(data)});
  }
}

class TablesDB {
  TablesDB(this.service);
  final FirebaseService service;

  /// Callbacks may run again on contention. Keep external side effects outside.
  Future<T> transaction<T>(
    Future<T> Function(FirestoreTransaction) action,
  ) async {
    for (var attempt = 0; attempt < 5; attempt++) {
      final token =
          (await service.request('POST', '${service.parent}:beginTransaction', {
                    'options': {'readWrite': <String, dynamic>{}},
                  })
                  as Map)['transaction']
              as String;
      try {
        final tx = FirestoreTransaction._(this, token);
        final result = await action(tx);
        await service.request('POST', '${service.parent}:commit', {
          'transaction': token,
          'writes': tx._writes,
        });
        return result;
      } on DatastoreException catch (error) {
        await _rollback(token);
        if (error.code != 409 || attempt == 4) rethrow;
        // Jitter prevents competing requests from retrying in lockstep after
        // both lose a shared-read/exclusive-write transaction lock race.
        await Future<void>.delayed(
          Duration(
            milliseconds: 50 * (1 << attempt) + Random().nextInt(150),
          ),
        );
      } catch (_) {
        await _rollback(token);
        rethrow;
      }
    }
    throw const DatastoreException('Transaction contention', code: 409);
  }

  String _name(String collection, String id) {
    for (final segment in [collection, id]) {
      if (segment.isEmpty ||
          segment.contains('/') ||
          segment == '.' ||
          segment == '..') {
        throw ArgumentError('Invalid document path');
      }
    }
    return '${service.parent}/$collection/$id';
  }

  Map<String, dynamic> _fields(Map<String, dynamic> data) =>
      data.map((key, value) => MapEntry(key, encodeValue(value)));
  Row _row(Map<String, dynamic> document) {
    final data = (document['fields'] as Map? ?? {}).map(
      (key, value) => MapEntry(
        key.toString(),
        decodeValue(Map<String, dynamic>.from(value as Map)),
      ),
    );
    final created =
        data.remove('_createdAt') as String? ??
        document['createTime'] as String;
    final updated =
        data.remove('_updatedAt') as String? ??
        document['updateTime'] as String;
    data.remove('_searchTokens');
    return Row(
      $id: (document['name'] as String).split('/').last,
      $createdAt: created,
      $updatedAt: updated,
      data: data,
    );
  }

  Future<Row> getRow({
    required String databaseId,
    required String tableId,
    required String rowId,
  }) async => _row(
    Map<String, dynamic>.from(
      await service.request('GET', _name(tableId, rowId)) as Map,
    ),
  );

  Future<Row> createRow({
    required String databaseId,
    required String tableId,
    required String rowId,
    required Map<String, dynamic> data,
  }) async => _write(tableId, rowId, data, create: true);
  Future<Row> updateRow({
    required String databaseId,
    required String tableId,
    required String rowId,
    required Map<String, dynamic> data,
  }) async => _write(tableId, rowId, data, create: false);

  List<String> _locks(String table, Map<String, dynamic> data) => [
    for (final fields in collectionUniqueKeys[table] ?? <List<String>>[])
      if (fields.every((field) => data[field] != null))
        '${service.parent}/_unique_keys/${sha256.convert(utf8.encode(jsonEncode([table, fields, fields.map((field) => data[field]).toList()])))}',
  ];

  Future<Row> _write(
    String table,
    String id,
    Map<String, dynamic> patch, {
    required bool create,
  }) async {
    for (var attempt = 0; attempt < 5; attempt++) {
      final transaction =
          (await service.request('POST', '${service.parent}:beginTransaction', {
                    'options': {'readWrite': <String, dynamic>{}},
                  })
                  as Map)['transaction']
              as String;
      try {
        Map<String, dynamic>? existing;
        if (!create) {
          existing = await _readInTransaction(_name(table, id), transaction);
        }
        final old = existing == null
            ? <String, dynamic>{}
            : Map<String, dynamic>.from(_row(existing).data);
        final now = DateTime.now().toUtc().toIso8601String();
        final merged = <String, dynamic>{
          ...?(create ? collectionDefaults[table] : null),
          ...old,
          ...patch,
          '_createdAt': existing == null ? now : _row(existing).$createdAt,
          '_updatedAt': now,
        };
        final model = merged['model_name'];
        if (model is String) {
          final lower = model.toLowerCase();
          merged['_searchTokens'] = {
            for (var size = 1; size <= 3; size++)
              for (var index = 0; index + size <= lower.length; index++)
                lower.substring(index, index + size),
          }.toList();
        }
        final previousLocks = _locks(table, old).toSet();
        final newLocks = _locks(table, merged).toSet();
        final writes = <Map<String, dynamic>>[
          {
            'update': {'name': _name(table, id), 'fields': _fields(merged)},
            'currentDocument': create
                ? {'exists': false}
                : {'updateTime': existing!['updateTime']},
          },
          for (final lock in previousLocks.difference(newLocks))
            {'delete': lock},
          for (final lock in newLocks.difference(previousLocks))
            {
              'update': {
                'name': lock,
                'fields': _fields({'owner': id}),
              },
              'currentDocument': {'exists': false},
            },
        ];
        await service.request('POST', '${service.parent}:commit', {
          'transaction': transaction,
          'writes': writes,
        });
        return getRow(
          databaseId: service.databaseId,
          tableId: table,
          rowId: id,
        );
      } on DatastoreException catch (error) {
        await _rollback(transaction);
        if (error.code == 409 && attempt < 4) continue;
        rethrow;
      } catch (_) {
        await _rollback(transaction);
        rethrow;
      }
    }
    throw const DatastoreException('Write conflict', code: 409);
  }

  Future<Map<String, dynamic>> _readInTransaction(
    String name,
    String transaction,
  ) async {
    final result =
        await service.request('POST', '${service.parent}:batchGet', {
              'documents': [name],
              'transaction': transaction,
            })
            as List;
    final found = result.where((item) => (item as Map).containsKey('found'));
    if (found.isEmpty) {
      throw const DatastoreException('Document not found', code: 404);
    }
    return Map<String, dynamic>.from((found.first as Map)['found'] as Map);
  }

  Future<void> _rollback(String transaction) async {
    try {
      await service.request('POST', '${service.parent}:rollback', {
        'transaction': transaction,
      });
    } catch (_) {
      /* Already committed or expired. */
    }
  }

  Future<void> deleteRow({
    required String databaseId,
    required String tableId,
    required String rowId,
  }) async {
    final transaction =
        (await service.request('POST', '${service.parent}:beginTransaction', {
                  'options': {'readWrite': <String, dynamic>{}},
                })
                as Map)['transaction']
            as String;
    try {
      final existing = await _readInTransaction(
        _name(tableId, rowId),
        transaction,
      );
      await service.request('POST', '${service.parent}:commit', {
        'transaction': transaction,
        'writes': [
          {
            'delete': _name(tableId, rowId),
            'currentDocument': {'updateTime': existing['updateTime']},
          },
          for (final lock in _locks(tableId, _row(existing).data))
            {'delete': lock},
        ],
      });
    } catch (_) {
      await _rollback(transaction);
      rethrow;
    }
  }

  String _field(String field) => switch (field) {
    r'$id' => '__name__',
    r'$createdAt' => '_createdAt',
    r'$updatedAt' => '_updatedAt',
    _ => field,
  };

  Map<String, dynamic> _filter(Map<String, dynamic> query, String table) {
    final method = query['method'] as String;
    if (method == 'and' || method == 'or') {
      return {
        'compositeFilter': {
          'op': method.toUpperCase(),
          'filters': (query['value'] as List)
              .map(
                (item) => _filter(
                  Map<String, dynamic>.from(jsonDecode(item as String) as Map),
                  table,
                ),
              )
              .toList(),
        },
      };
    }
    final field = _field(query['value'] as String);
    if (method == 'isNull' || method == 'isNotNull') {
      return {
        'unaryFilter': {
          'field': {'fieldPath': field},
          'op': method == 'isNull' ? 'IS_NULL' : 'IS_NOT_NULL',
        },
      };
    }
    final operand = query['operand'];
    final values = operand is List ? operand : [operand];
    if (values.length == 1 && values.first == null) {
      return {
        'unaryFilter': {
          'field': {'fieldPath': field},
          'op': method == 'equal' ? 'IS_NULL' : 'IS_NOT_NULL',
        },
      };
    }
    if (values.isEmpty) throw ArgumentError('Empty query values');
    if (values.length > 30) {
      throw ArgumentError('Firestore IN queries support at most 30 values');
    }
    Object encoded(Object? value) => field == '__name__'
        ? {'referenceValue': _name(table, value! as String)}
        : encodeValue(value);
    final operator = switch (method) {
      'equal' => values.length == 1 ? 'EQUAL' : 'IN',
      'notEqual' => 'NOT_EQUAL',
      'lessThan' => 'LESS_THAN',
      'lessThanEqual' => 'LESS_THAN_OR_EQUAL',
      'greaterThan' => 'GREATER_THAN',
      'greaterThanEqual' => 'GREATER_THAN_OR_EQUAL',
      'contains' => 'ARRAY_CONTAINS',
      _ => throw ArgumentError('Unsupported filter $method'),
    };
    final value = method == 'contains'
        ? encodeValue(
            (operand as String).toLowerCase().substring(
              0,
              operand.length < 3 ? operand.length : 3,
            ),
          )
        : values.length == 1
        ? encoded(values.first)
        : {
            'arrayValue': {'values': values.map(encoded).toList()},
          };
    return {
      'fieldFilter': {
        'field': {'fieldPath': method == 'contains' ? '_searchTokens' : field},
        'op': operator,
        'value': value,
      },
    };
  }

  Future<RowList> listRows({
    required String databaseId,
    required String tableId,
    List<String> queries = const [],
  }) async {
    final descriptions = queries
        .map((value) => Map<String, dynamic>.from(jsonDecode(value) as Map))
        .toList();
    final largeIndex = descriptions.indexWhere(
      (query) =>
          query['method'] == 'equal' &&
          query['operand'] is List &&
          (query['operand'] as List).length > 30,
    );
    if (largeIndex >= 0) {
      var requestedLimit = 25;
      var requestedOffset = 0;
      for (final query in descriptions) {
        if (query['method'] == 'limit') requestedLimit = query['value'] as int;
        if (query['method'] == 'offset') {
          requestedOffset = query['value'] as int;
        }
      }
      final values = (descriptions[largeIndex]['operand'] as List)
          .toSet()
          .toList();
      final field = descriptions[largeIndex]['value'] as String;
      final other = List<String>.from(queries)..removeAt(largeIndex);
      final rows = <Row>[];
      var total = 0;
      for (var start = 0; start < values.length; start += 30) {
        final page = await listRows(
          databaseId: databaseId,
          tableId: tableId,
          queries: [
            ...other,
            Query.equal(field, values.skip(start).take(30).toList()),
            Query.offset(0),
            Query.limit(requestedOffset + requestedLimit),
          ],
        );
        rows.addAll(page.rows);
        total += page.total;
      }
      final orderQueries = descriptions
          .where(
            (query) =>
                query['method'] == 'orderAsc' || query['method'] == 'orderDesc',
          )
          .toList();
      Object? value(Row row, String field) => switch (field) {
        r'$id' => row.$id,
        r'$createdAt' => row.$createdAt,
        r'$updatedAt' => row.$updatedAt,
        _ => row.data[field],
      };
      rows.sort((left, right) {
        for (final order in orderQueries) {
          final a = value(left, order['value'] as String);
          final b = value(right, order['value'] as String);
          final comparison = a == b
              ? 0
              : a == null
              ? -1
              : b == null
              ? 1
              : a is num && b is num
              ? a.compareTo(b)
              : a.toString().compareTo(b.toString());
          if (comparison != 0) {
            return order['method'] == 'orderDesc' ? -comparison : comparison;
          }
        }
        return left.$id.compareTo(right.$id);
      });
      return RowList(
        rows: rows.skip(requestedOffset).take(requestedLimit).toList(),
        total: total,
      );
    }
    final filters = descriptions
        .where(
          (query) => !{
            'limit',
            'offset',
            'orderAsc',
            'orderDesc',
            'cursorAfter',
          }.contains(query['method']),
        )
        .toList();
    final orders = descriptions
        .where(
          (query) =>
              query['method'] == 'orderAsc' || query['method'] == 'orderDesc',
        )
        .map(
          (query) => <String, dynamic>{
            'field': {'fieldPath': _field(query['value'] as String)},
            'direction': query['method'] == 'orderDesc'
                ? 'DESCENDING'
                : 'ASCENDING',
          },
        )
        .toList();
    final requestedOrders = List<Map<String, dynamic>>.from(orders);
    final inequalityFields = <String>{};
    void collectRanges(Map<String, dynamic> query) {
      if (query['method'] == 'and' || query['method'] == 'or') {
        for (final child in query['value'] as List) {
          collectRanges(
            Map<String, dynamic>.from(jsonDecode(child as String) as Map),
          );
        }
      } else if ({
        'lessThan',
        'lessThanEqual',
        'greaterThan',
        'greaterThanEqual',
        'notEqual',
        'isNotNull',
      }.contains(query['method'])) {
        inequalityFields.add(_field(query['value'] as String));
      }
    }

    for (final filter in filters) {
      collectRanges(filter);
    }
    final orderedFields = orders
        .map((order) => (order['field'] as Map)['fieldPath'])
        .toList();
    final remainingRanges =
        inequalityFields
            .where((field) => !orderedFields.contains(field))
            .toList()
          ..sort();
    final rangeFields = <String>[
      ...orderedFields.whereType<String>().where(inequalityFields.contains),
      ...remainingRanges,
    ];
    final needsSort =
        requestedOrders.isNotEmpty &&
        rangeFields.any(
          (field) => !orderedFields.take(rangeFields.length).contains(field),
        );
    final substringFilters = filters
        .where((query) => query['method'] == 'contains')
        .toList();
    final materialize = needsSort || substringFilters.isNotEmpty;
    if (rangeFields.isNotEmpty) {
      final remaining = orders
          .where(
            (order) =>
                !rangeFields.contains((order['field'] as Map)['fieldPath']),
          )
          .toList();
      orders
        ..clear()
        ..addAll([
          for (final field in rangeFields)
            {
              'field': {'fieldPath': field},
              'direction':
                  requestedOrders
                      .where(
                        (order) =>
                            (order['field'] as Map)['fieldPath'] == field,
                      )
                      .map((order) => order['direction'])
                      .firstOrNull ??
                  'ASCENDING',
            },
          ...remaining,
        ]);
    }
    if (!orders.any(
      (order) => (order['field'] as Map)['fieldPath'] == '__name__',
    )) {
      orders.add({
        'field': {'fieldPath': '__name__'},
        'direction': orders.isEmpty ? 'ASCENDING' : orders.last['direction'],
      });
    }
    final base = <String, dynamic>{
      'from': [
        {'collectionId': tableId},
      ],
      if (filters.isNotEmpty)
        'where': filters.length == 1
            ? _filter(filters.first, tableId)
            : {
                'compositeFilter': {
                  'op': 'AND',
                  'filters': filters
                      .map((query) => _filter(query, tableId))
                      .toList(),
                },
              },
      'orderBy': orders,
    };
    var limit = 25;
    var offset = 0;
    String? cursor;
    for (final query in descriptions) {
      if (query['method'] == 'limit') limit = query['value'] as int;
      if (query['method'] == 'offset') offset = query['value'] as int;
      if (query['method'] == 'cursorAfter') cursor = query['value'] as String;
    }
    if (limit < 0 || offset < 0) throw ArgumentError('Negative pagination');
    final aggregation =
        await service.request('POST', '${service.parent}:runAggregationQuery', {
              'structuredAggregationQuery': {
                'structuredQuery': {
                  'from': base['from'],
                  if (base.containsKey('where')) 'where': base['where'],
                },
                'aggregations': [
                  {'alias': 'total', 'count': <String, dynamic>{}},
                ],
              },
            })
            as List;
    final candidateCount = aggregation.isEmpty
        ? 0
        : int.parse(
            (((aggregation.first as Map)['result'] as Map)['aggregateFields']
                    as Map)['total']['integerValue']
                .toString(),
          );
    // Incompatible legacy sort/substring queries are bounded, never silent scans.
    const scanLimit = 500;
    if (materialize && candidateCount > scanLimit) {
      throw const DatastoreException(
        'Query is too broad; narrow the filters (maximum 500 candidates)',
        code: 422,
      );
    }
    final structured = <String, dynamic>{
      ...base,
      'limit': materialize ? scanLimit : limit,
      if (!materialize && offset > 0) 'offset': offset,
    };
    if (cursor != null && !materialize) {
      final row = await getRow(
        databaseId: databaseId,
        tableId: tableId,
        rowId: cursor,
      );
      structured['startAt'] = {
        'before': false,
        'values': orders.map((order) {
          final field = (order['field'] as Map)['fieldPath'];
          if (field == '__name__') {
            return {'referenceValue': _name(tableId, row.$id)};
          }
          return encodeValue(
            field == '_createdAt'
                ? row.$createdAt
                : field == '_updatedAt'
                ? row.$updatedAt
                : row.data[field],
          );
        }).toList(),
      };
    }
    final result =
        await service.request('POST', '${service.parent}:runQuery', {
              'structuredQuery': structured,
            })
            as List;
    final rows = result
        .where((item) => (item as Map).containsKey('document'))
        .map(
          (item) =>
              _row(Map<String, dynamic>.from((item as Map)['document'] as Map)),
        )
        .toList();
    if (!materialize) return RowList(rows: rows, total: candidateCount);
    final matched = rows
        .where(
          (row) => substringFilters.every(
            (query) => (row.data[query['value']] as String? ?? '')
                .toLowerCase()
                .contains((query['operand'] as String).toLowerCase()),
          ),
        )
        .toList();
    Object? fieldValue(Row row, String field) => switch (field) {
      '__name__' => row.$id,
      '_createdAt' => row.$createdAt,
      '_updatedAt' => row.$updatedAt,
      _ => row.data[field],
    };
    matched.sort((left, right) {
      for (final order in requestedOrders) {
        final field = (order['field'] as Map)['fieldPath'] as String;
        final a = fieldValue(left, field);
        final b = fieldValue(right, field);
        final comparison = a == b
            ? 0
            : a == null
            ? -1
            : b == null
            ? 1
            : a is num && b is num
            ? a.compareTo(b)
            : a.toString().compareTo(b.toString());
        if (comparison != 0) {
          return order['direction'] == 'DESCENDING' ? -comparison : comparison;
        }
      }
      return left.$id.compareTo(right.$id);
    });
    if (cursor != null) {
      final cursorIndex = matched.indexWhere((row) => row.$id == cursor);
      if (cursorIndex < 0) {
        throw const DatastoreException(
          'Cursor not found in query results',
          code: 404,
        );
      }
      offset += cursorIndex + 1;
    }
    return RowList(
      rows: matched.skip(offset).take(limit).toList(),
      total: matched.length,
    );
  }
}
