/// Postgres connection pool. Single global instance per server.
///
/// Uses package:postgres v3, which is connection-per-query async by default.
/// We wrap a `Pool` so handlers can run several queries concurrently without
/// re-establishing TLS each time.

import 'package:postgres/postgres.dart';

class Db {
  Db._(this._pool);

  static Db? _instance;
  final Pool _pool;

  static Future<Db> connect(String connectionString) async {
    if (_instance != null) return _instance!;

    final uri = Uri.parse(connectionString);
    // userInfo format: "username:password" — use indexOf so passwords that
    // contain ':' are captured in full, then URI-decode both halves so
    // percent-encoded characters (e.g. %40 for @) are restored correctly.
    final colonIdx = uri.userInfo.indexOf(':');
    final rawUser = colonIdx >= 0
        ? uri.userInfo.substring(0, colonIdx)
        : uri.userInfo;
    final rawPass = colonIdx >= 0
        ? uri.userInfo.substring(colonIdx + 1)
        : null;
    final endpoint = Endpoint(
      host: uri.host,
      port: uri.port == 0 ? 5432 : uri.port,
      database: uri.pathSegments.first,
      username: Uri.decodeComponent(rawUser),
      password: rawPass != null ? Uri.decodeComponent(rawPass) : null,
    );

    final pool = Pool.withEndpoints(
      [endpoint],
      settings: const PoolSettings(
        maxConnectionCount: 10,
        sslMode: SslMode.disable, // Local dev; flip to require in prod.
      ),
    );

    _instance = Db._(pool);
    return _instance!;
  }

  /// Run a parameterized query. Always prefer named substitution over string
  /// concatenation.
  Future<Result> query(
    String sql, {
    Map<String, Object?>? parameters,
  }) {
    return _pool.execute(
      Sql.named(sql),
      parameters: parameters ?? const {},
    );
  }

  /// Execute a raw SQL statement using the simple query protocol.
  ///
  /// Use this for DDL (CREATE TABLE, CREATE INDEX, etc.).  Unlike the default
  /// extended-query (prepared-statement) path, simple-query mode skips the
  /// prepare step and sends SQL directly to postgres, which means it works
  /// with multi-command DDL and `$$`-quoted function bodies without truncation.
  Future<Result> rawExecute(String sql) {
    return _pool.execute(sql, queryMode: QueryMode.simple);
  }

  /// Run a block inside a transaction.
  Future<T> tx<T>(Future<T> Function(TxSession session) action) {
    return _pool.runTx(action);
  }

  Future<void> close() => _pool.close();