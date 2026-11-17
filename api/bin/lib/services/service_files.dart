import 'package:guildmark_api/models/plan_catalog.dart';
import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:http/http.dart' as http;
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/request_json.dart';

class FileFailure implements Exception {
  FileFailure(this.status, this.message);
  final int status;
  final String message;
}

class ServiceFiles {
  ServiceFiles(this.store);
  final FirebaseService store;
  static const chunkSize = 8 * 1024 * 1024,
      pdfLimit = 20 * 1024 * 1024,
      isoLimit = 10 * 1024 * 1024 * 1024;
  Future<Row?> row(String table, String id) async {
    try {
      return await store.tablesDB.getRow(
        databaseId: '',
        tableId: table,
        rowId: id,
      );
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  Future<Map<String, dynamic>> scope({
    String? orderId,
    String? assignmentId,
    String? company,
    String? partner,
    bool write = false,
    String? kind,
  }) async {
    Row? assignment;
    if (assignmentId != null) {
      assignment = await row('partner_service_assignments', assignmentId);
      final p = partner == null ? null : await row('partners', partner);
      if (assignment == null ||
          assignment.data['partner_id'] != partner ||
          p?.data['status'] != 'active')
        throw FileFailure(404, 'Service assignment not found.');
      orderId = assignment.data['order_id'] as String?;
    }
    final order = orderId == null ? null : await row('orders', orderId);
    if (partner == null) {
      if (company == null ||
          order == null ||
          ![
            order.data['buyer_company_id'],
            order.data['seller_company_id'],
          ].contains(company))
        throw FileFailure(404, 'Order not found.');
      if ((kind == 'iso' || write) && order.data['buyer_company_id'] != company)
        throw FileFailure(403, 'Only the buyer can manage the reimage image.');
    }
    if (write) {
      if (partner == null && order?.data['reimage_started_at'] != null)
        throw FileFailure(409, 'Reimaging has started; its image is locked.');
      if (partner != null && assignment?.data['status'] != 'awaiting_cert')
        throw FileFailure(
          409,
          'Upload the certificate when this service is awaiting certification.',
        );
      if (partner != null && kind != 'certificate')
        throw FileFailure(403, 'Partners upload certificates only.');
      if (partner == null) {
        if (kind != 'iso')
          throw FileFailure(403, 'Buyers upload reimage images only.');
        if ({
          'complete',
          'cancelled',
          'refunded',
          'disputed',
        }.contains(order?.data['status']))
          throw FileFailure(
            409,
            'This order no longer accepts reimage images.',
          );
        final assignments = await store.tablesDB.listRows(
          databaseId: '',
          tableId: 'partner_service_assignments',
          queries: [Query.equal('order_id', orderId), Query.limit(100)],
        );
        if (assignments.rows.any(
          (r) =>
              r.data['service_type'] == 'wipe_only' ||
              {
                'reimage_in_progress',
                'reimage_complete',
                'awaiting_cert',
                'cert_uploaded',
                'shipped',
                'complete',
                'cancelled',
              }.contains(r.data['status']),
        ))
          throw FileFailure(
            409,
            'The image is locked after reimaging starts, or this is a wipe-only job.',
          );
      }
    }
    return {
      'order_id': orderId,
      'assignment_id': assignmentId,
      'buyer_company_id': order?.data['buyer_company_id'],
      'reimage_file_id':
          assignment?.data['reimage_file_id'] ?? order?.data['reimage_file_id'],
      'company': company,
      'partner': partner,
    };
  }

  static Map<String, dynamic> validate(String kind, dynamic body) {
    if (body is! Map || body['name'] is! String || body['size'] is! int)
      throw FileFailure(400, 'Choose a file and its size.');
    final name = (body['name'] as String).trim(), size = body['size'] as int;
    if (!{'iso', 'certificate'}.contains(kind) ||
        name.isEmpty ||
        name.length > 160 ||
        RegExp(r'[\x00-\x1f/\\]').hasMatch(name) ||
        !name.toLowerCase().endsWith(kind == 'iso' ? '.iso' : '.pdf') ||
        size < (kind == 'iso' ? 32775 : 5) ||
        size > (kind == 'iso' ? isoLimit : pdfLimit))
      throw FileFailure(
        400,
        kind == 'iso'
            ? 'Choose an ISO image up to 10 GiB.'
            : 'Choose a PDF certificate up to 20 MiB.',
      );
    return {
      'name': name,
      'size': size,
      'kind': kind,
      'content_type': kind == 'iso'
          ? 'application/octet-stream'
          : 'application/pdf',
    };
  }

  static bool signature(String kind, List<int> bytes) {
    if (kind == 'certificate')
      return bytes.length >= 5 &&
          ascii.decode(bytes.take(5).toList(), allowInvalid: true) == '%PDF-';
    if (bytes.length < 32775) return false;
    return {
      'CD001',
      'BEA01',
      'NSR02',
      'NSR03',
    }.contains(ascii.decode(bytes.sublist(32769, 32774), allowInvalid: true));
  }

  bool get emulated =>
      Platform.environment["FIREBASE_STORAGE_EMULATOR_HOST"] != null;
  String get base =>
      Platform.environment['FIREBASE_STORAGE_EMULATOR_HOST'] == null
      ? 'https://storage.googleapis.com'
      : 'http://${Platform.environment['FIREBASE_STORAGE_EMULATOR_HOST']}';
  String get bucket {
    final b = store.storageBucket;
    if (b == null || b.isEmpty)
      throw FileFailure(503, 'Private file storage is unavailable.');
    return b;
  }

  Future<http.StreamedResponse> send(
    String method,
    Uri uri, {
    Map<String, String>? headers,
    List<int>? bytes,
  }) async {
    final req = http.Request(method, uri)..followRedirects = false;
    req.headers.addAll(headers ?? {});
    if (Platform.environment['FIREBASE_STORAGE_EMULATOR_HOST'] != null)
      req.headers['Authorization'] = 'Bearer owner';
    if (bytes != null) req.bodyBytes = bytes;
    return (await store.client).send(req);
  }

  Map<String, dynamic> public(Map<String, dynamic> f) => {
    for (final k in [
      'id',
      'name',
      'size',
      'kind',
      'status',
      'offset',
      'created_at',
    ])
      k: f[k],
  };
  Future<Map<String, dynamic>> begin(
    Map<String, dynamic> s,
    String kind,
    dynamic input,
  ) async {
    final fields = validate(kind, input),
        id = ID.unique(),
        object = 'private-service-files/$id';
    final response = await send(
      'POST',
      Uri.parse(
        emulated
            ? '$base/v0/b/${Uri.encodeComponent(bucket)}/o?name=${Uri.encodeComponent(object)}'
            : '$base/upload/storage/v1/b/${Uri.encodeComponent(bucket)}/o?uploadType=resumable',
      ),
      headers: {
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': fields['content_type'] as String,
        'X-Upload-Content-Length': '${fields['size']}',
        if (emulated) ...{
          'X-Goog-Upload-Protocol': 'resumable',
          'X-Goog-Upload-Command': 'start',
          'X-Goog-Upload-Header-Content-Length': '${fields['size']}',
          'X-Goog-Upload-Header-Content-Type': fields['content_type'] as String,
        },
      },
      bytes: utf8.encode(
        jsonEncode({
          'name': object,
          'contentType': fields['content_type'],
          'cacheControl': 'private, no-store',
          'contentDisposition': 'attachment',
        }),
      ),
    );
    await response.stream.drain<void>();
    final location =
        response.headers[emulated ? 'x-goog-upload-url' : 'location'];
    if (response.statusCode >= 300 || location == null)
      throw FileFailure(503, 'File upload could not start.');
    final uri = Uri.parse(location);
    if (uri.origin != Uri.parse(base).origin)
      throw FileFailure(503, 'Unexpected storage destination.');
    final file = {
      'id': id,
      ...fields,
      ...s,
      'status': 'uploading',
      'offset': 0,
      'object': object,
      'session': location,
      'created_at': DateTime.now().toUtc().toIso8601String(),
    };
    await store.tablesDB.createRow(
      databaseId: '',
      tableId: 'service_files',
      rowId: id,
      data: file,
    );
    return public(file);
  }

  Future<void> matches(
    Map<String, dynamic> f,
    Map<String, dynamic> s, {
    bool write = false,
  }) async {
    if (s['partner'] != null) {
      if (f['kind'] == 'certificate' &&
          f['assignment_id'] != s['assignment_id'])
        throw FileFailure(404, 'File not found.');
      if (f['kind'] == 'iso' &&
          (s['order_id'] == null ||
              f['order_id'] != s['order_id'] ||
              s['reimage_file_id'] != f['id']))
        throw FileFailure(404, 'File not found.');
    } else if (f['order_id'] != s['order_id'] ||
        (f['kind'] == 'iso' && f['buyer_company_id'] != s['company']))
      throw FileFailure(404, 'File not found.');
    if (write &&
        ((f['kind'] == 'iso' && s['company'] != f['company']) ||
            (f['kind'] == 'certificate' && s['partner'] != f['partner'])))
      throw FileFailure(403, 'Upload owner required.');
  }

  Future<Map<String, dynamic>> chunk(
    String id,
    Map<String, dynamic> s,
    int offset,
    List<int> bytes,
  ) async {
    final lease = ID.unique();
    final file = await store.tablesDB.transaction((tx) async {
      final row = await tx.get('service_files', id);
      if (row == null) throw FileFailure(404, 'Upload not found.');
      final f = row.data;
      await matches(f, s, write: true);
      if (f['status'] == 'complete') return f;
      if (DateTime.tryParse(
            f['lease_until'] as String? ?? '',
          )?.isAfter(DateTime.now().toUtc()) ==
          true)
        throw FileFailure(409, 'An upload chunk is already in progress.');
      tx.update('service_files', id, {
        ...f,
        'lease': lease,
        'lease_until': DateTime.now()
            .toUtc()
            .add(const Duration(minutes: 2))
            .toIso8601String(),
      });
      return f;
    });
    if (file['status'] == 'complete') return public(file);
    try {
      final size = file['size'] as int;
      final probe = await send(
        emulated ? 'POST' : 'PUT',
        Uri.parse(file['session'] as String),
        headers: emulated
            ? {'X-Goog-Upload-Command': 'query'}
            : {'Content-Range': 'bytes */$size'},
        bytes: [],
      );
      final probeBody = await http.Response.fromStream(probe);
      int actual = 0;
      Map<String, dynamic>? completed;
      if (emulated && probe.statusCode == 200) {
        actual =
            int.tryParse(probe.headers['x-goog-upload-size-received'] ?? '0') ??
            0;
        if (probe.headers['x-goog-upload-status'] == 'final') {
          final metadata = await send(
            'GET',
            Uri.parse(
              '$base/storage/v1/b/${Uri.encodeComponent(bucket)}/o/${Uri.encodeComponent(file['object'] as String)}',
            ),
          );
          completed =
              jsonDecode((await http.Response.fromStream(metadata)).body)
                  as Map<String, dynamic>;
        }
      } else if (probe.statusCode == 200 || probe.statusCode == 201)
        completed = jsonDecode(probeBody.body) as Map<String, dynamic>;
      else if (probe.statusCode == 308) {
        final range = probe.headers['range'];
        actual = range == null ? 0 : int.parse(range.split('-').last) + 1;
      } else
        throw FileFailure(
          410,
          'Upload session expired. Choose the file again.',
        );
      if (completed == null) {
        if (actual != offset) {
          await store.tablesDB.updateRow(
            databaseId: '',
            tableId: 'service_files',
            rowId: id,
            data: {'offset': actual},
          );
          throw FileFailure(409, 'Upload offset is $actual. Retry to resume.');
        }
        if (bytes.isEmpty ||
            bytes.length > chunkSize ||
            actual + bytes.length > size ||
            (actual + bytes.length < size && bytes.length != chunkSize))
          throw FileFailure(400, 'Invalid upload chunk.');
        if (actual == 0 && !signature(file['kind'] as String, bytes))
          throw FileFailure(
            400,
            'The file contents do not match the selected PDF or ISO format.',
          );
        final response = await send(
          emulated ? 'POST' : 'PUT',
          Uri.parse(file['session'] as String),
          headers: {
            'Content-Type': file['content_type'] as String,
            if (!emulated)
              'Content-Range':
                  'bytes $actual-${actual + bytes.length - 1}/$size',
            if (emulated) ...{
              'X-Goog-Upload-Command': actual + bytes.length == size
                  ? 'upload, finalize'
                  : 'upload',
              'X-Goog-Upload-Offset': '$actual',
            },
          },
          bytes: bytes,
        );
        final body = await http.Response.fromStream(response);
        if (emulated &&
            response.statusCode == 200 &&
            response.headers['x-goog-upload-status'] != 'final') {
          /* Firebase emulator acknowledges intermediate chunks with 200. */
        } else if (response.statusCode == 200 || response.statusCode == 201)
          completed = jsonDecode(body.body) as Map<String, dynamic>;
        else if (response.statusCode != 308)
          throw FileFailure(
            503,
            'Storage did not accept the chunk. Retry the upload.',
          );
        actual += bytes.length;
      }
      if (completed != null &&
          (int.tryParse('${completed['size']}') != size ||
              completed['name'] != file['object']))
        throw FileFailure(409, 'Stored file metadata did not match.');
      final data = {
        ...file,
        'offset': completed != null ? size : actual,
        'status': completed != null ? 'complete' : 'uploading',
        'generation': completed?['generation'],
        'lease': null,
        'lease_until': null,
      };
      await store.tablesDB.transaction((tx) async {
        final current = await tx.get('service_files', id);
        if (current?.data['lease'] != lease)
          throw FileFailure(409, 'Upload lease changed. Retry.');
        if (completed != null) {
          final order = s['order_id'] == null
              ? null
              : await tx.get('orders', s['order_id'] as String);
          final assignment = s['assignment_id'] == null
              ? null
              : await tx.get(
                  'partner_service_assignments',
                  s['assignment_id'] as String,
                );
          final currentPartner = s['partner'] == null
              ? null
              : await tx.get('partners', s['partner'] as String);
          if (s['partner'] != null &&
              (currentPartner?.data['status'] != 'active' ||
                  assignment?.data['status'] != 'awaiting_cert'))
            throw FileFailure(403, 'Partner access or service status changed.');
          if (s['partner'] != null &&
              assignment?.data['partner_id'] != s['partner'])
            throw FileFailure(403, 'Service assignment changed.');
          if (s['company'] != null &&
              order?.data['buyer_company_id'] != s['company'])
            throw FileFailure(403, 'Order access changed.');
          if (file['kind'] == 'iso') {
            if (order?.data['reimage_started_at'] != null)
              throw FileFailure(
                409,
                'Reimaging has started; the image is locked.',
              );
            tx.update('orders', s['order_id'] as String, {
              ...order!.data,
              'reimage_file_id': id,
            });
          }
          if (file['kind'] == 'certificate') {
            tx.update(
              'partner_service_assignments',
              s['assignment_id'] as String,
              {...assignment!.data, 'certificate_file_id': id},
            );
          }
        }
        tx.update('service_files', id, data);
      });
      return public(data);
    } finally {
      await store.tablesDB.transaction((tx) async {
        final current = await tx.get('service_files', id);
        if (current?.data['lease'] == lease)
          tx.update('service_files', id, {
            ...current!.data,
            'lease': null,
            'lease_until': null,
          });
      });
    }
  }

  Future<List<Map<String, dynamic>>> list(Map<String, dynamic> s) async {
    final rows = await store.tablesDB.listRows(
      databaseId: '',
      tableId: 'service_files',
      queries: [
        if (s['order_id'] != null)
          Query.equal('order_id', s['order_id'])
        else
          Query.equal('assignment_id', s['assignment_id']),
        Query.equal('status', 'complete'),
        Query.orderDesc(r'$createdAt'),
        Query.limit(100),
      ],
    );
    final found = <Map<String, dynamic>>[];
    for (final row in rows.rows) {
      try {
        await matches(row.data, s);
        found.add(public(row.data));
      } on FileFailure {
        /* Exclude unrelated assignments and buyer-only images. */
      }
    }
    return found;
  }

  Future<String> ticket(String id, Map<String, dynamic> s) async {
    final f = (await row('service_files', id))?.data;
    if (f == null || f['status'] != 'complete')
      throw FileFailure(404, 'File not found.');
    await matches(f, s);
    final token = '${ID.unique()}${ID.unique()}';
    await store.tablesDB.createRow(
      databaseId: '',
      tableId: 'service_file_tickets',
      rowId: sha256.convert(utf8.encode(token)).toString(),
      data: {
        ...s,
        'file_id': id,
        'expires_at': DateTime.now()
            .toUtc()
            .add(const Duration(minutes: 2))
            .toIso8601String(),
      },
    );
    return token;
  }

  Future<Response> download(String token) async {
    if (!RegExp(r'^[a-zA-Z0-9_-]{20,128}$').hasMatch(token))
      throw FileFailure(404, 'Download not found.');
    final id = sha256.convert(utf8.encode(token)).toString();
    final t = await store.tablesDB.transaction((tx) async {
      final r = await tx.get('service_file_tickets', id);
      if (r == null ||
          r.data['used'] == true ||
          !DateTime.parse(
            r.data['expires_at'] as String,
          ).isAfter(DateTime.now().toUtc()))
        throw FileFailure(
          410,
          'Download link expired. Request a new download.',
        );
      tx.update('service_file_tickets', id, {...r.data, 'used': true});
      return r.data;
    });
    if (t['user_id'] is String) {
      final user = await row('users', t['user_id'] as String);
      if (user?.data['company_id'] != t['company'])
        throw FileFailure(403, 'Order access changed.');
    }
    final s = await scope(
      orderId: t['order_id'] as String?,
      assignmentId: t['assignment_id'] as String?,
      company: t['company'] as String?,
      partner: t['partner'] as String?,
    );
    final file = (await row('service_files', t['file_id'] as String))?.data;
    if (file == null || file['status'] != 'complete')
      throw FileFailure(404, 'File not found.');
    await matches(file, s);
    final res = await send(
      'GET',
      Uri.parse(
        '$base/storage/v1/b/${Uri.encodeComponent(bucket)}/o/${Uri.encodeComponent(file['object'] as String)}?alt=media&generation=${file['generation']}',
      ),
    );
    if (res.statusCode != 200) {
      await res.stream.drain<void>();
      throw FileFailure(503, 'File download is temporarily unavailable.');
    }
    return Response.stream(
      body: res.stream,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': '${file['size']}',
        'Content-Disposition':
            "attachment; filename*=UTF-8''${Uri.encodeComponent(file['name'] as String)}",
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
      },
    );
  }
}

Future<Response> serviceFileRoute(
  RequestContext c, {
  String? orderId,
  String? assignmentId,
  String? fileId,
}) async {
  try {
    final store = c.read<FirebaseService?>();
    if (store == null) return Response(statusCode: 503);
    final service = ServiceFiles(store);
    final partner = assignmentId == null ? null : c.read<PartnerPrincipal?>();
    final customer = orderId == null ? null : c.read<AuthPrincipal?>();
    if (partner == null && customer == null) return Response(statusCode: 401);
    final kind = assignmentId == null ? 'iso' : 'certificate',
        write =
            c.request.method == HttpMethod.put ||
            (c.request.method == HttpMethod.post && fileId == null);
    final s = await service.scope(
      orderId: orderId,
      assignmentId: assignmentId,
      company: customer?.companyId,
      partner: partner?.partnerId,
      write: write,
      kind: write ? kind : null,
    );
    s['user_id'] = customer?.userId;
    if (fileId == null) {
      if (c.request.method == HttpMethod.get) {
        bool allowed = true;
        try {
          await service.scope(
            orderId: orderId,
            assignmentId: assignmentId,
            company: customer?.companyId,
            partner: partner?.partnerId,
            write: true,
            kind: kind,
          );
        } on FileFailure {
          allowed = false;
        }
        return Response.json(
          headers: {'Cache-Control': 'no-store'},
          body: {'files': await service.list(s), 'upload_allowed': allowed},
        );
      }
      if (c.request.method == HttpMethod.post)
        return Response.json(
          body: await service.begin(
            s,
            kind,
            await boundedJson(c.request, maxBytes: 2000),
          ),
        );
    } else {
      final file = (await service.row('service_files', fileId))?.data;
      if (file == null) throw FileFailure(404, 'File not found.');
      await service.matches(file, s, write: write);
      if (c.request.method == HttpMethod.get)
        return Response.json(
          headers: {'Cache-Control': 'no-store'},
          body: service.public(file),
        );
      if (c.request.method == HttpMethod.post) {
        final token = await service.ticket(fileId, s);
        return Response.json(
          headers: {'Cache-Control': 'no-store'},
          body: {
            'url':
                '${c.read<AppConfig>().publicApiPrefix}/service-downloads/$token',
          },
        );
      }
      if (c.request.method == HttpMethod.put) {
        final offset = int.tryParse(c.request.headers['x-upload-offset'] ?? '');
        if (offset == null) throw FileFailure(400, 'Upload offset required.');
        final bytes = <int>[];
        await for (final chunk in c.request.bytes()) {
          bytes.addAll(chunk);
          if (bytes.length > ServiceFiles.chunkSize)
            throw FileFailure(413, 'Upload chunks must be 8 MiB or smaller.');
        }
        return Response.json(
          body: await service.chunk(fileId, s, offset, bytes),
        );
      }
    }
    return Response(statusCode: 405);
  } on PlanLimitException catch (e) {
    return Response.json(statusCode: e.status, body: {'message': e.message});
  } on FormatException {
    return Response.json(
      statusCode: 400,
      body: {'message': 'Invalid upload request.'},
    );
  } on FileFailure catch (e) {
    return Response.json(
      statusCode: e.status,
      headers: {'Cache-Control': 'no-store'},
      body: {'message': e.message},
    );
  }
}
