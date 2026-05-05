/// Lightweight migration runner — applies every `*.sql` file in the
/// `migrations/` directory in lexicographic order, tracking applied
/// versions in a `schema_migrations` table.
///
/// Deliberately minimal: no down-migrations, no transactions across files,
/// no checksums. Good enough for boot-time application; for anything more
/// complex use sqitch or a dedicated tool.
library;

import 'dart:io';

import 'package:postgres/postgres.dart';

import 'pool.dart';

class MigrationRunner {
  MigrationRunner(this._db, {String migrationsDir = '../migrations'})
      : _migrationsDir = migrationsDir;

  final Db _db;
  final String _migrationsDir;

  /// Apply any unapplied migrations. Idempotent — safe to call on every boot.
  Future<int> run() async {
    await _db.query('''
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    ''');

    final applied = await _appliedVersions();
    final pending =
        _pendingFiles().where((f) => !applied.contains(_versionOf(f))).toList();

    for (final file in pending) {
      final version = _versionOf(file);
      final sql = await file.readAsString();

      await _db.tx((tx) async {
        // Run the migration in a transaction so partial failures roll back.
        await tx.execute(sql);
        await tx.execute(
          Sql.named('INSERT INTO schema_migrations (version) VALUES (@v)'),
          parameters: {'v': version},
        );
      });
      stdout.writeln('[migrate] applied $version');
    }
    return pending.length;
  }

  Future<Set<String>> _appliedVersions() async {
    final result = await _db.query('SELECT version FROM schema_migrations');
    return result.map((r) => r.toColumnMap()['version'] as String).toSet();
  }

  List<File> _pendingFiles() {
    final dir = Directory(_migrationsDir);
    if (!dir.existsSync()) return const [];
    final files = dir
        .listSync()
        .whereType<File>()
        .where((f) => f.path.endsWith('.sql'))
        .toList()
      ..sort((a, b) => a.path.compareTo(b.path));
    return files;
  }

  /// Extract the version prefix — for `0001_init.sql` -> `0001_init`.
  String _versionOf(File f) {
    final name = f.uri.pathSegments.last;
    return name.replaceAll('.sql', '');
  }
}
