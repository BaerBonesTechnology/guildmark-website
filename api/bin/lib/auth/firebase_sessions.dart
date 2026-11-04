import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';

/// The API owns application sessions and their audience; Firebase owns identity.
/// Clients receive random handles, never Firebase tokens or credentials.
class FirebaseSessions {
  FirebaseSessions(this.auth, this.store) {
    final endpoint = Uri.parse(store.endpoint);
    if (store.projectId != auth.projectId ||
        endpoint.scheme != 'http' ||
        !{'localhost', '127.0.0.1', '::1'}.contains(endpoint.host)) {
      throw ArgumentError(
        'Auth and Firestore must use the same local demo project',
      );
    }
  }
  final FirebaseAuth auth;
  final FirebaseService store;
  TablesDB get db => store.tablesDB;
  static const collection = 'firebase_api_sessions';
  static String digest(String value) =>
      sha256.convert(utf8.encode(value)).toString();

  Future<Row?> row(String collection, String id) async {
    try {
      return await db.getRow(databaseId: '', tableId: collection, rowId: id);
    } on DatastoreException catch (e) {
      if (e.code == 404) return null;
      rethrow;
    }
  }

  Future<Row?> identity(String uid, String kind) async {
    final table = switch (kind) {
      'customer' => 'users',
      'partner' => 'partners',
      'staff' || 'staff_setup' || 'staff_pending' => 'guildmark_employees',
      _ => throw ArgumentError('Unknown session audience'),
    };
    final rows = await db.listRows(
      databaseId: '',
      tableId: table,
      queries: [Query.equal('firebase_uid', uid), Query.limit(2)],
    );
    if (rows.rows.length != 1) return null;
    final result = rows.rows.single;
    if (table == 'guildmark_employees' && result.data['is_active'] != true) {
      return null;
    }
    if (table == 'partners' && result.data['status'] == 'suspended') {
      return null;
    }
    return result;
  }

  Future<String> issue(Map<String, dynamic> login, String kind) async {
    final uid = login['localId'] as String;
    if (await identity(uid, kind) == null) {
      throw FirebaseAuthFailure('INVALID_LOGIN_CREDENTIALS');
    }
    final cookie = await auth.sessionCookie(login['idToken'] as String);
    final token = generateRefreshTokenPlaintext();
    await db.createRow(
      databaseId: '',
      tableId: collection,
      rowId: digest(token),
      data: {
        'uid': uid,
        'kind': kind,
        'firebase_cookie': cookie,
        'expires_at': DateTime.now()
            .toUtc()
            .add(
              kind == 'staff_setup' || kind == 'staff_pending'
                  ? const Duration(minutes: 5)
                  : const Duration(hours: 8),
            )
            .toIso8601String(),
      },
    );
    return token;
  }

  Future<Row?> resolveHash(String hash) async {
    final record = await row(collection, hash);
    if (record == null ||
        !DateTime.parse(
          record.data['expires_at'] as String,
        ).isAfter(DateTime.now().toUtc())) {
      return null;
    }
    final revoked = await row(
      'firebase_session_revocations',
      record.data['uid'] as String,
    );
    if (revoked != null &&
        !DateTime.parse(
          record.$createdAt,
        ).isAfter(DateTime.parse(revoked.data['revoked_at'] as String))) {
      return null;
    }
    if (!await auth.validSession(
      record.data['firebase_cookie'] as String,
      record.data['uid'] as String,
    )) {
      return null;
    }
    if (await identity(
          record.data['uid'] as String,
          record.data['kind'] as String,
        ) ==
        null) {
      return null;
    }
    return record;
  }

  Future<Row?> resolve(String token) => resolveHash(digest(token));

  Future<AuthPrincipal?> principal(String token) async {
    final session = await resolve(token);
    if (session == null) return null;
    final kind = session.data['kind'] as String;
    if (!{'customer', 'staff', 'staff_setup'}.contains(kind)) return null;
    final record = await identity(session.data['uid'] as String, kind);
    if (record == null) return null;
    return AuthPrincipal(
      userId: record.$id,
      companyId: kind == 'customer'
          ? record.data['company_id'] as String
          : kind == 'staff_setup'
          ? 'devdash_setup'
          : 'devdash',
      role: record.data['role'] as String? ?? 'member',
      audience: kind,
    );
  }

  Future<PartnerPrincipal?> partner(String token) async {
    final session = await resolve(token);
    if (session == null || session.data['kind'] != 'partner') return null;
    final record = await identity(session.data['uid'] as String, 'partner');
    return record == null
        ? null
        : PartnerPrincipal(
            partnerId: record.$id,
            partnerCode: record.data['partner_code'] as String,
          );
  }

  /// Called only after a verified passkey. Atomically consumes the restricted
  /// session so concurrent completions cannot mint multiple full sessions.
  Future<String> completeStaff(
    String hash,
    String expectedKind,
    String employeeId,
  ) async {
    final old = await resolveHash(hash);
    if (old == null || old.data['kind'] != expectedKind) {
      throw FirebaseAuthFailure('INVALID_LOGIN_CREDENTIALS');
    }
    final employee = await identity(old.data['uid'] as String, expectedKind);
    if (employee?.$id != employeeId) {
      throw FirebaseAuthFailure('INVALID_LOGIN_CREDENTIALS');
    }
    final token = generateRefreshTokenPlaintext();
    try {
      await db.transaction((tx) async {
        final current = await tx.get(collection, hash);
        if (current == null ||
            current.data['kind'] != expectedKind ||
            !DateTime.parse(
              current.data['expires_at'] as String,
            ).isAfter(DateTime.now().toUtc())) {
          throw FirebaseAuthFailure('INVALID_LOGIN_CREDENTIALS');
        }
        tx.update(collection, hash, {'expires_at': '1970-01-01T00:00:00Z'});
        tx.create(collection, digest(token), {
          ...current.data,
          'kind': 'staff',
          'expires_at': DateTime.now()
              .toUtc()
              .add(const Duration(hours: 8))
              .toIso8601String(),
        });
      });
    } on DatastoreException catch (e) {
      if (e.code == 409) throw FirebaseAuthFailure('INVALID_LOGIN_CREDENTIALS');
      rethrow;
    }
    return token;
  }

  Future<void> logout(String token, String kind) async {
    final record = await row(collection, digest(token));
    if (record == null || record.data['kind'] != kind) return;
    try {
      await db.deleteRow(
        databaseId: '',
        tableId: collection,
        rowId: record.$id,
      );
    } on DatastoreException catch (e) {
      if (e.code != 404) rethrow;
    }
  }

  Future<void> resetPassword(String code, String password) async {
    final details = await auth.call('accounts:resetPassword', {
      'oobCode': code,
    });
    final accounts = await auth.call('accounts:lookup', {
      'email': [details['email']],
    }, admin: true);
    final users = accounts['users'] as List? ?? [];
    if (users.length != 1) throw FirebaseAuthFailure('INVALID_OOB_CODE');
    final uid = (users.single as Map)['localId'] as String;
    await auth.resetPassword(code, password);
    // Firebase's revocation timestamps have second precision. This additional
    // API barrier also revokes sessions created in the same second as a reset.
    await db.transaction((tx) async {
      final existing = await tx.get('firebase_session_revocations', uid);
      final patch = {'revoked_at': DateTime.now().toUtc().toIso8601String()};
      if (existing == null) {
        tx.create('firebase_session_revocations', uid, patch);
      } else {
        tx.update('firebase_session_revocations', uid, patch);
      }
    });
  }
}

FirebaseSessions? firebaseSessions(RequestContext context) {
  // Providers are optional for legacy route tests and the staged legacy mode.
  final AppConfig cfg;
  try {
    cfg = context.read<AppConfig>();
  } on StateError {
    return null;
  }
  if (cfg.authMode != 'firebase-emulator') return null;
  return context.read<FirebaseSessions>();
}

String? bearer(RequestContext context) {
  final value = context.request.headers['authorization'];
  return value?.startsWith('Bearer ') == true ? value!.substring(7) : null;
}
