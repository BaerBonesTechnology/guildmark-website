/// Lightweight migration runner — applies every `*.sql` file in the
/// `migrations/` directory in lexicographic order, tracking applied
/// versions in a `schema_migrations` table.
///
/// Deliberately minimal: no down-migrations, no transactions across files,
/// no checksums. Good enough for boot-time application; for anything more
/// complex use sqitch or a dedicated tool.

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
    await _db.rawExecute('''
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
        for (final stmt in _splitStatements(sql)) {
          // QueryMode.simple bypasses the prepare step (extended query
          // protocol).  Prepared statements only accept a single SQL command
          // and choke on `$$`-quoted function bodies and long DDL; simple
          // query mode sends the SQL string directly to postgres.
          await tx.execute(stmt, queryMode: QueryMode.simple);
        }
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

  /// Splits a SQL script into individual executable statements.
  ///
  /// A naive `.split(';')` breaks on semicolons inside plpgsql function bodies
  /// (dollar-quoted with `$$...$$`) and string literals.  This parser tracks
  /// those contexts so only top-level semicolons are treated as separators.
  ///
  /// Handles:
  ///   - Dollar-quoted blocks  $$...$$   (semicolons inside are not separators)
  ///   - Single-quoted strings '...'     ('' escape supported)
  ///   - Line comments         --        (stripped when testing for emptiness)
  static List<String> _splitStatements(String sql) {
    final statements = <String>[];
    final buf = StringBuffer();
    var i = 0;
    final n = sql.length;

    while (i < n) {
      final ch = sql[i];

      // ── Line comment: -- ... \n  ──────────────────────────────────────────
      // Stripped entirely — semicolons inside comments must not split statements.
      if (ch == '-' && i + 1 < n && sql[i + 1] == '-') {
        while (i < n && sql[i] != '\n') {
          i++;
        }
        continue;
      }

      // ── Block comment: /* ... */  ──────────────────────────────────────────
      if (ch == '/' && i + 1 < n && sql[i + 1] == '*') {
        final close = sql.indexOf('*/', i + 2);
        if (close >= 0) {
          buf.write(sql.substring(i, close + 2));
          i = close + 2;
        } else {
          // Unterminated block comment — consume to end.
          buf.write(sql.substring(i));
          i = n;
        }
        continue;
      }

      // ── Dollar-quoted block: $$...$$  ─────────────────────────────────────
      if (ch == '\$' && i + 1 < n && sql[i + 1] == '\$') {
        final close = sql.indexOf('\$\$', i + 2);
        if (close >= 0) {
          buf.write(sql.substring(i, close + 2));
          i = close + 2;
          continue;
        }
      }

      // ── Single-quoted string with '' escape ───────────────────────────────
      if (ch == "'") {
        buf.write(ch);
        i++;
        while (i < n) {
          final c = sql[i];
          buf.write(c);
          i++;
          if (c == "'") {
            if (i < n && sql[i] == "'") {
              // Escaped single quote — stay inside the string.
              buf.write("'");
              i++;
            } else {
              break; // End of string literal.
            }
          }
        }
        continue;
      }

      // ── Statement terminator ──────────────────────────────────────────────
      if (ch == ';') {
        final stmt = buf.toString().trim();
        if (_isMeaningful(stmt)) statements.add(stmt);
        buf.clear();
        i++;
        continue;
      }

      buf.write(ch);
      i++;
    }

    // Trailing content with no final semicolon (e.g. a COMMENT statement).
    final last = buf.toString().trim();
    if (_isMeaningful(last)) statements.add(last);

    return statements;
  }

  /// Returns true if [stmt] contains SQL beyond line comments.
  static bool _isMeaningful(String stmt) {
    if (stmt.isEmpty) return false;
    return stmt
        .replaceAll(RegExp(r'--[^\n]*', multiLine: true), '')
        .trim()
        .isNotEmpty;
  }

  /// Extract the version prefix — for `0001_