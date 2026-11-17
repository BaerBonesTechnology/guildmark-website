import 'dart:io';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/repos/firestore/product_image_repo.dart';
import 'package:http/http.dart' as http;
import 'package:test/test.dart';

void main() {
  final firestoreHost = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  final storageHost = Platform.environment['FIREBASE_STORAGE_EMULATOR_HOST'];
  test(
    'server upload yields a public image; direct browser writes and datastore reads are denied',
    () async {
      final service = FirebaseService(
        projectId: 'demo-guildmark',
        emulatorHost: firestoreHost,
        storageBucket: 'demo-guildmark.firebasestorage.app',
      );
      final client = http.Client();
      try {
        final image = await ProductImageRepo(service).upload(
          bytes: [137, 80, 78, 71],
          filename: 'pilot.png',
          contentType: 'image/png',
        );
        final response = await client.get(Uri.parse(image.url));
        expect(response.statusCode, 200);
        expect(response.bodyBytes, [137, 80, 78, 71]);
        final denied = await client.post(
          Uri.parse(
            'http://$storageHost/v0/b/${image.bucketId}/o?name=product-images/forbidden',
          ),
          headers: {'Content-Type': 'image/png'},
          body: [137, 80, 78, 71],
        );
        expect(denied.statusCode, anyOf(401, 403));
        final read = await client.get(
          Uri.parse(
            'http://$firestoreHost/v1/projects/demo-guildmark/databases/(default)/documents/users',
          ),
        );
        expect(read.statusCode, 403);
      } finally {
        client.close();
        service.close();
      }
    },
    skip: firestoreHost == null || storageHost == null
        ? 'Requires Firestore and Storage emulators'
        : false,
  );
}
