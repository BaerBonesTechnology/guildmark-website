import 'dart:convert';
import 'dart:io';
import 'package:test/test.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/service_files.dart';
import '../routes/partner/catalog.dart';

void main() {
  test('file type, extension, size and signature validation', () {
    expect(
      ServiceFiles.validate('certificate', {
        'name': 'certificate.pdf',
        'size': 30,
      })['size'],
      30,
    );
    for (final bad in [
      {'name': '../secret.pdf', 'size': 10},
      {'name': 'bad.exe', 'size': 10},
      {'name': 'bad.pdf', 'size': ServiceFiles.pdfLimit + 1},
    ]) {
      expect(
        () => ServiceFiles.validate('certificate', bad),
        throwsA(isA<FileFailure>()),
      );
    }
    expect(
      ServiceFiles.signature('certificate', utf8.encode('%PDF-1.7')),
      true,
    );
    expect(ServiceFiles.signature('certificate', utf8.encode('<html>')), false);
    final iso = List<int>.filled(32775, 0)
      ..setRange(32769, 32774, ascii.encode('CD001'));
    expect(ServiceFiles.signature('iso', iso), true);
    expect(ServiceFiles.signature('iso', List.filled(32775, 0)), false);
  });
  test('catalog has unique names, integer cents, bounded amounts', () {
    expect(
      validateCatalog({
        'version': 0,
        'services': [
          {
            'name': 'Data wipe',
            'description': 'Per device',
            'price_cents': 800,
          },
        ],
      })['currency'],
      'USD',
    );
    for (final rows in [
      [
        {'name': '', 'description': '', 'price_cents': 800},
      ],
      [
        {'name': 'Wipe', 'description': '', 'price_cents': -1},
      ],
      [
        {'name': 'Wipe', 'description': '', 'price_cents': 1.5},
      ],
      [
        {'name': 'Wipe', 'description': '', 'price_cents': 1},
        {'name': 'wipe', 'description': '', 'price_cents': 2},
      ],
    ]) {
      expect(
        () => validateCatalog({'version': 0, 'services': rows}),
        throwsFormatException,
      );
    }
  });
  group(
    'private files on local emulators',
    () {
      late FirebaseService db;
      late ServiceFiles files;
      setUp(() async {
        db = FirebaseService(
          projectId: 'demo-service-files-${ID.unique()}',
          emulatorHost: Platform.environment['FIRESTORE_EMULATOR_HOST'],
          storageBucket: 'demo-guildmark.firebasestorage.app',
        );
        files = ServiceFiles(db);
        for (final row in [
          (
            'orders',
            'order',
            {
              'buyer_company_id': 'buyer',
              'seller_company_id': 'seller',
              'status': 'funded',
            },
          ),
          ('partners', 'partner', {'status': 'active'}),
          (
            'partner_service_assignments',
            'assignment',
            {
              'order_id': 'order',
              'partner_id': 'partner',
              'service_type': 'wipe_and_reimage',
              'status': 'awaiting_cert',
            },
          ),
        ]) {
          await db.tablesDB.createRow(
            databaseId: '',
            tableId: row.$1,
            rowId: row.$2,
            data: row.$3,
          );
        }
      });
      tearDown(() => db.close());
      test('buyer PDF denied and unassigned partner denied', () async {
        await expectLater(
          files.scope(
            orderId: 'order',
            company: 'buyer',
            kind: 'certificate',
            write: true,
          ),
          throwsA(isA<FileFailure>()),
        );
        await expectLater(
          files.scope(assignmentId: 'assignment', partner: 'other'),
          throwsA(isA<FileFailure>()),
        );
        await expectLater(
          files.scope(orderId: 'order', company: 'other'),
          throwsA(isA<FileFailure>()),
        );
      });
      test(
        'PDF upload is private, stored, downloadable with single-use ticket',
        () async {
          final scope = await files.scope(
            assignmentId: 'assignment',
            partner: 'partner',
            write: true,
            kind: 'certificate',
          );
          final bytes = utf8.encode('%PDF-1.7\nSynthetic certificate\n%%EOF');
          var file = await files.begin(scope, 'certificate', {
            'name': 'certificate.pdf',
            'size': bytes.length,
          });
          file = await files.chunk(file['id'] as String, scope, 0, bytes);
          expect(file['status'], 'complete');
          expect(
            (await files.row(
              'partner_service_assignments',
              'assignment',
            ))!.data['certificate_file_id'],
            file['id'],
          );
          expect(file.containsKey('session'), false);
          final buyer = await files.scope(orderId: 'order', company: 'buyer');
          final token = await files.ticket(file['id'] as String, buyer);
          final response = await files.download(token);
          expect(await response.body(), utf8.decode(bytes));
          await expectLater(files.download(token), throwsA(isA<FileFailure>()));
          final other = await files.scope(orderId: 'order', company: 'seller');
          await files.matches(
            (await files.row('service_files', file['id'] as String))!.data,
            other,
          );
        },
      );
      test(
        'ISO upload resumes across two chunks and stays buyer/assigned-partner only',
        () async {
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'partner_service_assignments',
            rowId: 'assignment',
            data: {'status': 'claimed', 'service_type': 'reimage_only'},
          );
          final scope = await files.scope(
            orderId: 'order',
            company: 'buyer',
            kind: 'iso',
            write: true,
          );
          final bytes = List<int>.filled(ServiceFiles.chunkSize + 512, 0)
            ..setRange(32769, 32774, ascii.encode('CD001'));
          var file = await files.begin(scope, 'iso', {
            'name': 'deployment.iso',
            'size': bytes.length,
          });
          final id = file['id'] as String;
          file = await files.chunk(
            id,
            scope,
            0,
            bytes.sublist(0, ServiceFiles.chunkSize),
          );
          expect(file['status'], 'uploading');
          expect(file['offset'], ServiceFiles.chunkSize);
          // The server reconciles an acknowledged storage chunk after a lost response.
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'service_files',
            rowId: id,
            data: {'offset': 0},
          );
          await expectLater(
            files.chunk(id, scope, 0, bytes.sublist(0, ServiceFiles.chunkSize)),
            throwsA(isA<FileFailure>()),
          );
          file = await files.chunk(
            id,
            scope,
            ServiceFiles.chunkSize,
            bytes.sublist(ServiceFiles.chunkSize),
          );
          expect(file['status'], 'complete');
          final partner = await files.scope(
            assignmentId: 'assignment',
            partner: 'partner',
          );
          expect((await files.list(partner)).single['id'], id);
          final seller = await files.scope(orderId: 'order', company: 'seller');
          await expectLater(
            files.ticket(id, seller),
            throwsA(isA<FileFailure>()),
          );
          final ticket = await files.ticket(id, partner);
          final response = await files.download(ticket);
          expect(
            (await response.bytes().fold<int>(0, (n, b) => n + b.length)),
            bytes.length,
          );
          final revoked = await files.ticket(id, partner);
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'partner_service_assignments',
            rowId: 'assignment',
            data: {'partner_id': 'other'},
          );
          await expectLater(
            files.download(revoked),
            throwsA(isA<FileFailure>()),
          );
        },
      );
      test('ISO image is locked once reimaging begins', () async {
        await db.tablesDB.updateRow(
          databaseId: '',
          tableId: 'orders',
          rowId: 'order',
          data: {
            'reimage_started_at': DateTime.now().toUtc().toIso8601String(),
          },
        );
        await expectLater(
          files.scope(
            orderId: 'order',
            company: 'buyer',
            kind: 'iso',
            write: true,
          ),
          throwsA(isA<FileFailure>()),
        );
      });
    },
    skip:
        Platform.environment['FIRESTORE_EMULATOR_HOST'] == null ||
        Platform.environment['FIREBASE_STORAGE_EMULATOR_HOST'] == null,
  );
}
