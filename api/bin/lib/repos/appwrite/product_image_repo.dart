/// Appwrite Storage access for buyer-facing product images.
///
/// Uploads stream straight into the `gm-product-images` bucket using the
/// server API key (which bypasses bucket permissions), so the bucket never
/// needs a client-writable permission. Returns a public `view` URL built from
/// the browser-reachable gateway — the bucket grants `read(any)` so the URL
/// loads in an `<img>` tag without a session.
library;

import 'package:dart_appwrite/dart_appwrite.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/appwrite/collections.dart';

/// The stored file plus the URL the frontend persists in `product_images`.
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
  ProductImageRepo(this._aw, {required this.publicEndpoint});

  final AppwriteService _aw;

  /// Browser-reachable Appwrite gateway (see AppConfig.appwritePublicEndpoint).
  final String publicEndpoint;

  /// Uploads [bytes] as a new file and returns its public view URL.
  ///
  /// The file id is generated client-side so we know it up front: on success
  /// the server stores the file under exactly this id. That also lets us work
  /// around a dart_appwrite 25.x bug where `File.fromMap` throws parsing some
  /// self-hosted Appwrite 1.9 responses (`sizeActual` is absent → `Null` is not
  /// `int`). That parse runs only AFTER a 2xx upload, so a [TypeError] here
  /// means the file was created — real failures surface as [AppwriteException]
  /// before parsing and still propagate.
  Future<UploadedImage> upload({
    required List<int> bytes,
    required String filename,
    required String contentType,
  }) async {
    final fileId = ID.unique();
    final input = InputFile.fromBytes(
      bytes: bytes,
      filename: filename,
      contentType: contentType,
    );
    try {
      await _aw.storage.createFile(
        bucketId: Aw.productImagesBucket,
        fileId: fileId,
        file: input,
      );
    } on TypeError {
      // SDK response-parse bug — upload already succeeded; fall through.
    }
    return UploadedImage(
      fileId: fileId,
      bucketId: Aw.productImagesBucket,
      url: _viewUrl(fileId),
    );
  }

  /// Public, session-less download URL for a stored file.
  String _viewUrl(String fileId) {
    final base = publicEndpoint.endsWith('/')
        ? publicEndpoint.substring(0, publicEndpoint.length - 1)
        : publicEndpoint;
    return '$base/storage/buckets/${Aw.productImagesBucket}'
        '/files/$fileId/view?project=${_aw.projectId}';
  }
}
