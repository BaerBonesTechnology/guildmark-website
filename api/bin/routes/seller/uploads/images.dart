import 'package:dart_appwrite/dart_appwrite.dart' show AppwriteException;
import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/appwrite/appwrite_client.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/appwrite/product_image_repo.dart';

/// Max accepted upload size — mirrors the bucket's `maximumFileSize`.
const int _maxImageBytes = 10 * 1024 * 1024;

/// POST /seller/uploads/images
///
/// Accepts a single `multipart/form-data` image under the `file` field, streams
/// it into the `gm-product-images` bucket server-side (API key never leaves the
/// server), and returns `{ file_id, bucket_id, url }`. The frontend collects
/// the URLs and submits them as the listing's `product_images`.
Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST');
  }

  final auth = context.read<AuthPrincipal?>();
  if (auth == null) return unauthorized();

  final aw = context.read<AppwriteService?>();
  if (aw == null) {
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
  }

  final contentType = context.request.headers['content-type'] ?? '';
  if (!contentType.toLowerCase().contains('multipart/form-data')) {
    return badRequest('Expected multipart/form-data');
  }

  final form = await context.request.formData();
  final file = form.files['file'];
  if (file == null) return badRequest('Missing "file" field');

  if (!file.contentType.mimeType.startsWith('image/')) {
    return badRequest('Only image uploads are allowed');
  }

  final bytes = await file.readAsBytes();
  if (bytes.isEmpty) return badRequest('Uploaded file is empty');
  if (bytes.length > _maxImageBytes) {
    return badRequest('Image exceeds the 10 MB limit');
  }

  final cfg = context.read<AppConfig>();
  try {
    final uploaded = await ProductImageRepo(
      aw,
      publicEndpoint: cfg.appwritePublicEndpoint,
    ).upload(
      bytes: bytes,
      filename: file.name,
      contentType: file.contentType.mimeType,
    );
    return Response.json(statusCode: 201, body: uploaded.toJson());
  } on AppwriteException catch (e) {
    return jsonError(502, 'UPLOAD_FAILED', e.message ?? 'Upload failed');
  }
}
