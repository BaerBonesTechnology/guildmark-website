/// POST /admin/auth
///
/// Authenticates a GuildMark employee for DevDash access.
///
/// Lookup order:
///   1. guildmark_employees table — email + bcrypt password.
///   2. ADMIN_AUTH_USER / ADMIN_AUTH_PASS env vars — emergency fallback when
///      no employee rows exist yet (bootstrap scenario).
///
/// Returns: { access_token, employee }
///   employee: { id, email, full_name, role }
library;

import 'package:dart_frog/dart_frog.dart';

import '../../lib/auth/jwt.dart';
import '../../lib/auth/password.dart';
import '../../lib/config.dart';
import '../../lib/crypto_utils.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  final email    = (body?['email'] as String?)?.trim().toLowerCase()
                ?? (body?['username'] as String?)?.trim().toLowerCase();
  final password = body?['password'] as String?;

  if (email == null || email.isEmpty || password == null || password.isEmpty) {
    return badRequest('email and password are required');
  }

  final cfg = context.read<AppConfig>();
  final jwt = context.read<JwtService>();
  final db  = context.read<Db>();

  // ── 1. Employee table lookup ─────────────────────────────────────────────
  final rows = await db.query(
    '''
    SELECT id::text, email::text, password_hash, full_name, role::text
    FROM guildmark_employees
    WHERE email = @email AND is_active = true
    LIMIT 1
    ''',
    parameters: {'email': email},
  );

  if (rows.isNotEmpty) {
    final row  = rows.first.toColumnMap();
    final hash = row['password_hash'].toString();

    if (!verifyPassword(password, hash)) return unauthorized('Invalid credentials');

    final id       = row['id'].toString();
    final role     = row['role'].toString();
    final fullName = row['full_name'].toString();

    // Update last_login_at
    await db.query(
      'UPDATE guildmark_employees SET last_login_at = now() WHERE id = @id',
      parameters: {'id': id},
    );

    final token = jwt.issueAccessToken(
      AccessClaims(userId: id, companyId: 'devdash', role: 'admin'),
    );

    return Response.json(body: {
      'access_token': token,
      'employee': {
        'id':        id,
        'email':     email,
        'full_name': fullName,
        'role':      role,
      },
    });
  }

  // ── 2. Env-var fallback (bootstrap / emergency access) ───────────────────
  if (cfg.adminAuthUser != null && cfg.adminAuthPass != null) {
    final userMatch = constantTimeEquals(email,    cfg.adminAuthUser!);
    final passMatch = constantTimeEquals(password, cfg.adminAuthPass!);
    if (userMatch && passMatch) {
      final token = jwt.issueAccessToken(
        AccessClaims(userId: 'admin', companyId: 'devdash', role: 'admin'),
      );
      return Response.json(body: {
        'access_token': token,
        'employee': {
          'id':        'admin',
          'email':     cfg.adminAuthUser!,
          'full_name': 'Admin',
          'role':      'superadmin',
        },
      });
    }
  }

  return unauthorized('Invalid credentials');
}
