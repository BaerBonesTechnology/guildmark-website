/// Firestore-backed repository retaining the existing API contract.
/// Multi-step business workflows still require their own concurrency controls.
library;

import 'dart:convert';
import 'dart:io';

import 'package:guildmark_api/firebase/firestore.dart';
import 'package:http/http.dart' as http;

class UploadedImage {
  const UploadedImage({
    required this.fileId,
    required this.bucketId,
    required this.url,
  });
  final String fileId;
  final String bucketId;
  final String url;
  Map<String, dynamic> toJson() => {
    'file_id': fileId,
    'bucket_id': bucketId,
    'url': url,
  };
}

class ProductImageRepo {
  ProductImageRepo(this.service, {this.prefix = 'product-images'});
  final String prefix;
  final FirebaseService service;

  Future<UploadedImage> upload({
    required List<int> bytes,
    required String filename,
    required String contentType,
  }) async {
    final bucket = service.storageBucket;
    if (bucket == null || bucket.isEmpty)
      throw const DatastoreException(
        'FIREBASE_STORAGE_BUCKET is not configured',
        code: 503,
      );
    final fileId = ID.unique();
    final token = ID.unique();
    final object = '$prefix/$fileId';
    final boundary = 'guildmark-$fileId';
    final metadata = jsonEncode({
      'name': object,
      'metadata': {'firebaseStorageDownloadTokens': token},
    });
    final body = <int>[
      ...utf8.encode(
        '--$boundary\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n$metadata\r\n--$boundary\r\nContent-Type: $contentType\r\n\r\n',
      ),
      ...bytes,
      ...utf8.encode('\r\n--$boundary--\r\n'),
    ];
    final emulator = Platform.environment['FIREBASE_STORAGE_EMULATOR_HOST'];
    final base = emulator == null
        ? 'https://storage.googleapis.com'
        : 'http://$emulator';
    final request =
        http.Request(
            'POST',
            Uri.parse(
              '$base/upload/storage/v1/b/${Uri.encodeComponent(bucket)}/o?uploadType=multipart',
            ),
          )
          ..headers['Content-Type'] = 'multipart/related; boundary=$boundary'
          ..bodyBytes = body;
    if (emulator != null) request.headers['Authorization'] = 'Bearer owner';
    final client = emulator == null ? await service.client : http.Client();
    try {
      final response = await client.send(request);
      await response.stream.drain<void>();
      if (response.statusCode >= 400)
        throw DatastoreException(
          'Image upload failed',
          code: response.statusCode,
        );
    } finally {
      if (emulator != null) client.close();
    }
    final publicBase = emulator == null
        ? 'https://firebasestorage.googleapis.com'
        : 'http://$emulator';
    return UploadedImage(
      fileId: fileId,
      bucketId: bucket,
      url:
          '$publicBase/v0/b/${Uri.encodeComponent(bucket)}/o/${Uri.encodeComponent(object)}?alt=media&token=$token',
    );
  }
}
