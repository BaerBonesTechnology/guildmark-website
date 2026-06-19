/// Backfill `mailing_list` from Postgres into Appwrite — the reference for the
/// per-collection data migration (see ../../../POSTGRES_TO_APPWRITE.md §6).
///
///   dart run tool/backfill_mailing_list.dart
///
/// Required env: DATABASE_URL (source Postgres) and
///               APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID / APPWRITE_API_KEY.
///
/// Idempotent: documents are created with a deterministic `$id` derived from
/// the Postgres UUID, so re-running skips rows that already exist (409).
///
/// NOTE on timestamps: Appwrite manages `$createdAt`, which cannot be set on
/// create — imported rows get their import time, not the original signup time.
/// For collections where original-order fidelity matters, add an explicit
/// `created_at` datetime attribute and set it here. (Low stakes for waitlist.)
library;

import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart';

import 'package:guildmark_api/appwrite/collections.dart';
import 'package:guildmark_api/db/pool.dart';

Future<void> main() async {
  final databaseUrl = _require('DATABASE_URL');
  final endpoint = _env('APPWRITE_ENDPOINT', 'http://localhost:8444/v1');
  final projectId = _require('APPWRITE_PROJECT_ID');
  final apiKey = _require('APPWRITE_API_KEY');

  final db = await Db.connect(databaseUrl);
  final aw = Databases(
    Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey),
  );

  final rows = await db.query(
    'SELECT id::text AS id, email::text AS email, source, notes, '
    'contacted_at, created_at FROM mailing_list',
  );

  var imported = 0;
  var skipped = 0;
  var failed = 0;

  for (final r in rows) {
    final m = r.toColumnMap();
    final uuid = m['id'] as String;
    final contactedAt = m['contacted_at'] as DateTime?;

    try {
      await aw.createDocument(
        databaseId: Aw.databaseId,
        collectionId: Aw.mailingList,
        documentId: awId(uuid), // hyphen-stripped UUID → valid, stable $id
        data: {
          'email': (m['email'] as String).toLowerCase().trim(),
          'source': (m['source'] as String?) ?? 'waitlist',
          if (m['notes'] != null) 'notes': m['notes'] as String,
          if (contactedAt != null)
            'contacted_at': contactedAt.toUtc().toIso8601String(),
        },
      );
      imported++;
    } on AppwriteException catch (e) {
      if (e.code == 409) {
        skipped++; // already imported
      } else {
        failed++;
        stderr.writeln('[backfill] failed $uuid: ${e.message}');
      }
    }
  }

  stdout.writeln(
    '[backfill] mailing_list — imported=$imported skipped=$skipped failed=$failed',
  );
  await db.close();
  exit(failed == 0 ? 0 : 1);
}

String _require(String key) {
  final v = Platform.environment[key];
  if (v == null || v.isEmpty) {
    stderr.writeln('Missing required env var: $key');
    exit(1);
  }
  return v;
}

String _env(String key, String fallback) {
  final v = Platform.environment[key];
  return (v == null || v.isEmpty) ? fallback : v;
}
