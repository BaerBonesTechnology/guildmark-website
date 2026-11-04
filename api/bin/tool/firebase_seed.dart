import 'dart:io';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/password.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/firebase/local_fixtures.dart';

/// Local-only bootstrap. Production bootstrap is a separate launch operation.
Future<void> main(List<String> args) async {
  final project =
      Platform.environment['FIREBASE_PROJECT_ID'] ?? 'demo-guildmark';
  final emulator = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  final endpoint = Uri.tryParse('http://${emulator ?? ''}');
  if (!project.startsWith('demo-') ||
      emulator == null ||
      endpoint == null ||
      !{'localhost', '127.0.0.1', '::1'}.contains(endpoint.host) ||
      !endpoint.hasPort ||
      endpoint.path.isNotEmpty ||
      endpoint.userInfo.isNotEmpty ||
      endpoint.hasQuery ||
      endpoint.hasFragment) {
    stderr.writeln(
      'Refusing to seed outside a demo Firebase emulator project.',
    );
    exitCode = 1;
    return;
  }
  final service = FirebaseService(projectId: project, emulatorHost: emulator);
  Future<void> insert(
    String collection,
    String id,
    Map<String, dynamic> data,
  ) async {
    try {
      await service.tablesDB.createRow(
        databaseId: '',
        tableId: collection,
        rowId: id,
        data: data,
      );
    } on DatastoreException catch (error) {
      if (error.code != 409) rethrow;
    }
  }

  try {
    await insert('platform_config', 'config', {
      'seller_fee_free': 0.14,
      'seller_fee_starter': 0.14,
      'seller_fee_growth': 0.12,
      'seller_fee_pro': 0.10,
      'buyer_fee': 0.028,
      'deferral_fee': 0.013,
      'data_wipe_price_cents': 800,
      'payment_terms_enabled': false,
    });
    final email = Platform.environment['FIREBASE_ADMIN_EMAIL'];
    final password = Platform.environment['FIREBASE_ADMIN_PASSWORD'];
    if (email != null && password != null) {
      if (password.length < 12) {
        throw ArgumentError(
          'Local staff password must contain at least 12 characters',
        );
      }
      final authHost = Platform.environment['FIREBASE_AUTH_EMULATOR_HOST'];
      final auth = authHost == null
          ? null
          : FirebaseAuth(projectId: project, host: authHost);
      String? uid;
      if (auth != null) {
        try {
          Map<String, dynamic> account;
          try {
            account = await auth.signUp(email, password);
          } on FirebaseAuthFailure catch (e) {
            if (e.code != 'EMAIL_EXISTS') rethrow;
            // Reruns must not require or reset the original password.
            final lookup = await auth.call('accounts:lookup', {
              'email': [email.trim().toLowerCase()],
            }, admin: true);
            account = Map<String, dynamic>.from(
              (lookup['users'] as List).single as Map,
            );
          }
          uid = account['localId'] as String;
        } finally {
          auth.close();
        }
      }
      await insert('guildmark_employees', ID.unique(), {
        'email': email.trim().toLowerCase(),
        if (uid == null) 'password_hash': hashPassword(password),
        'firebase_uid': ?uid,
        'full_name': 'Local administrator',
        'role': 'admin',
        'is_active': true,
      });
    }
    if (args.contains('--fixtures')) {
      final auth = FirebaseAuth(
        projectId: project,
        host: Platform.environment['FIREBASE_AUTH_EMULATOR_HOST'] ?? '',
      );
      try {
        await LocalFixtures(auth, service).seed();
      } finally {
        auth.close();
      }
      stdout.writeln(
        'Local buyer, seller, staff and marketplace fixtures are ready.',
      );
    }
    stdout.writeln('Local emulator configuration is ready.');
  } finally {
    service.close();
  }
}
