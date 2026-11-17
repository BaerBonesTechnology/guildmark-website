/// One-time transfer of an already MFA-verified staff session to the main site.
library;

import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/firebase/firestore.dart';

class AdminHandoff {
  AdminHandoff(this.store, this.resolve, {DateTime Function()? clock})
    : clock = clock ?? DateTime.now;
  final FirebaseService store;
  final Future<Row?> Function(String) resolve;
  final DateTime Function() clock;
  Future<String> issue(
    String sourceHash,
    String state,
    String targetOrigin,
  ) async {
    final source = await resolve(sourceHash);
    if (source == null || source.data['kind'] != 'staff')
      throw FirebaseAuthFailure('INVALID_LOGIN_CREDENTIALS');
    final code = generateRefreshTokenPlaintext();
    await store.tablesDB.createRow(
      databaseId: '',
      tableId: 'staff_auth_handoffs',
      rowId: FirebaseSessions.digest(code),
      data: {
        'source_hash': sourceHash,
        'state': state,
        'target_origin': targetOrigin,
        'used': false,
        'expires_at': clock()
            .toUtc()
            .add(const Duration(seconds: 90))
            .toIso8601String(),
      },
    );
    return code;
  }

  Future<String> redeem(String code, String state, String origin) async {
    final id = FirebaseSessions.digest(code);
    Row handoff;
    try {
      handoff = await store.tablesDB.getRow(
        databaseId: '',
        tableId: 'staff_auth_handoffs',
        rowId: id,
      );
    } on DatastoreException {
      throw FirebaseAuthFailure('INVALID_LOGIN_CREDENTIALS');
    }
    final sourceHash = handoff.data['source_hash'] as String;
    final source = await resolve(sourceHash);
    if (source == null || source.data['kind'] != 'staff')
      throw FirebaseAuthFailure('INVALID_LOGIN_CREDENTIALS');
    final token = generateRefreshTokenPlaintext();
    await store.tablesDB.transaction((tx) async {
      final current = await tx.get('staff_auth_handoffs', id);
      final session = await tx.get(FirebaseSessions.collection, sourceHash);
      if (current == null ||
          current.data['used'] == true ||
          current.data['state'] != state ||
          current.data['target_origin'] != origin ||
          !DateTime.parse(
            current.data['expires_at'] as String,
          ).isAfter(clock().toUtc()) ||
          session == null ||
          session.data['kind'] != 'staff' ||
          !DateTime.parse(
            session.data['expires_at'] as String,
          ).isAfter(clock().toUtc()))
        throw FirebaseAuthFailure('INVALID_LOGIN_CREDENTIALS');
      tx.update('staff_auth_handoffs', id, {'used': true});
      tx.update(FirebaseSessions.collection, sourceHash, {
        'expires_at': '1970-01-01T00:00:00Z',
      });
      // Preserve the original expiry: this is a transfer, not renewed authentication.
      tx.create(FirebaseSessions.collection, FirebaseSessions.digest(token), {
        ...session.data,
      });
    });
    return token;
  }
}
