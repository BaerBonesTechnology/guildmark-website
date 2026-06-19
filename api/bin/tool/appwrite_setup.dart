/// Idempotent Appwrite schema setup.
///
/// Creates the `guildmark` database and its collections/attributes/indexes.
/// Run once against a fresh Appwrite project (re-runs are safe — existing
/// resources return 409 and are skipped).
///
///   dart run tool/appwrite_setup.dart
///
/// Required env: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY.
///
/// `mailing_list` is implemented end-to-end as the reference. The other
/// collections from POSTGRES_TO_APPWRITE.md follow the identical shape — fill
/// them in the marked section using the same helpers.
library;

import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart';

import 'package:guildmark_api/appwrite/collections.dart';

late final Databases _db;

Future<void> main() async {
  final endpoint = _env('APPWRITE_ENDPOINT', fallback: 'http://localhost:8444/v1');
  final projectId = _require('APPWRITE_PROJECT_ID');
  final apiKey = _require('APPWRITE_API_KEY');

  final client = Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
  _db = Databases(client);

  await _ensureDatabase(Aw.databaseId, 'GuildMark');

  await _setupMailingList();
  // TODO(big-bang): add _setupCompanies(), _setupUsers(), _setupAssets(), …
  //   following the same pattern + the table in POSTGRES_TO_APPWRITE.md §3.

  stdout.writeln('[setup] done.');
}

// ── mailing_list (reference) ────────────────────────────────────────────────

Future<void> _setupMailingList() async {
  const c = Aw.mailingList;
  await _ensureCollection(c, 'Mailing List');

  await _str(c, 'source', size: 64, required: false, xdefault: 'waitlist');
  await _str(c, 'notes', size: 4000, required: false);
  await _email(c, 'email', required: true);
  await _datetime(c, 'contacted_at', required: false);

  // Attributes must be "available" before they can be indexed; Appwrite
  // processes them asynchronously, so give them a moment on a cold project.
  await Future<void>.delayed(const Duration(seconds: 2));

  await _index(c, 'email_unique', IndexType.unique, ['email']);
  await _index(c, 'created_idx', IndexType.key, [r'$createdAt'], orders: ['DESC']);
}

// ── Helpers (idempotent: swallow 409 "already exists") ──────────────────────

Future<void> _ensureDatabase(String id, String name) => _ignoreConflict(
      () => _db.create(databaseId: id, name: name),
      '[setup] database $id',
    );

Future<void> _ensureCollection(String id, String name) => _ignoreConflict(
      () => _db.createCollection(
        databaseId: Aw.databaseId,
        collectionId: id,
        name: name,
        // Server-side access via API key; tighten per-collection later.
        permissions: [Permission.read(Role.any())],
        documentSecurity: true,
      ),
      '[setup] collection $id',
    );

Future<void> _str(
  String collection,
  String key, {
  required int size,
  required bool required,
  String? xdefault,
}) =>
    _ignoreConflict(
      () => _db.createStringAttribute(
        databaseId: Aw.databaseId,
        collectionId: collection,
        key: key,
        size: size,
        xrequired: required,
        xdefault: xdefault,
      ),
      '[setup]   attr $collection.$key (string)',
    );

Future<void> _email(String collection, String key, {required bool required}) =>
    _ignoreConflict(
      () => _db.createEmailAttribute(
        databaseId: Aw.databaseId,
        collectionId: collection,
        key: key,
        xrequired: required,
      ),
      '[setup]   attr $collection.$key (email)',
    );

Future<void> _datetime(String collection, String key, {required bool required}) =>
    _ignoreConflict(
      () => _db.createDatetimeAttribute(
        databaseId: Aw.databaseId,
        collectionId: collection,
        key: key,
        xrequired: required,
      ),
      '[setup]   attr $collection.$key (datetime)',
    );

Future<void> _index(
  String collection,
  String key,
  IndexType type,
  List<String> attributes, {
  List<String>? orders,
}) =>
    _ignoreConflict(
      () => _db.createIndex(
        databaseId: Aw.databaseId,
        collectionId: collection,
        key: key,
        type: type,
        attributes: attributes,
        orders: orders,
      ),
      '[setup]   index $collection.$key',
    );

Future<void> _ignoreConflict(Future<void> Function() op, String label) async {
  try {
    await op();
    stdout.writeln('$label — created');
  } on AppwriteException catch (e) {
    if (e.code == 409) {
      stdout.writeln('$label — exists, skipped');
    } else {
      rethrow;
    }
  }
}

String _require(String key) {
  final v = Platform.environment[key];
  if (v == null || v.isEmpty) {
    stderr.writeln('Missing required env var: $key');
    exit(1);
  }
  return v;
}

String _env(String key, {required String fallback}) {
  final v = Platform.environment[key];
  return (v == null || v.isEmpty) ? fallback : v;
}
