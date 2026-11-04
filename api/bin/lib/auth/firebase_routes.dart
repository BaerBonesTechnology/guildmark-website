import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/firestore/user_repo.dart';
import 'package:guildmark_api/repos/firestore/partner_repo.dart';

/// Compatibility endpoints: the browser still speaks only GuildMark's API.
Future<Response> firebaseAuthRoute(
  RequestContext context,
  String action, {
  String kind = 'customer',
}) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }
  final sessions = firebaseSessions(context)!;
  final cfg = context.read<AppConfig>();
  final origin = context.request.headers['origin'];
  final allowed = [cfg.corsOrigin, cfg.adminCorsOrigin, cfg.partnerCorsOrigin]
      .whereType<String>()
      .expand((s) => s.split(','))
      .map((s) => s.trim())
      .toSet();
  // Cookies are host-only, scoped by audience, HttpOnly, SameSite=Strict.
  // Reject cross-origin session mutations even if a browser sends cookies.
  if (origin != null && !allowed.contains(origin)) {
    return forbidden('Origin not allowed');
  }
  final cookieName = 'gm_${kind}_session';
  final path =
      '${cfg.publicApiPrefix}${kind == 'customer'
          ? '/auth'
          : kind == 'partner'
          ? '/partner/auth'
          : '/admin'}';
  String cookie(String token) =>
      '$cookieName=$token; Path=$path; Max-Age=${token.isEmpty ? 0 : 28800}; HttpOnly; SameSite=Strict';
  // Secure is deliberately omitted only in this strictly loopback emulator mode.
  String? sessionToken() {
    final header = context.request.headers['cookie'] ?? '';
    for (final piece in header.split(';')) {
      final pair = piece.trim().split('=');
      if (pair.length == 2 && pair[0] == cookieName) return pair[1];
    }
    return bearer(context);
  }

  Future<Response> sessionResponse(String token, {int status = 200}) async {
    final session = await sessions.resolve(token);
    if (session == null || session.data['kind'] != kind) {
      return unauthorized('Session expired');
    }
    final record = await sessions.identity(session.data['uid'] as String, kind);
    if (record == null) return unauthorized();
    final Map<String, dynamic> profile;
    if (kind == 'customer') {
      final user = await UserRepo(
        sessions.store,
      ).findByEmail(record.data['email'] as String);
      if (user == null) return unauthorized();
      profile = user.toAuthUser();
    } else if (kind == 'partner') {
      profile = PartnerRecord.fromRow(record).toAuthPartner();
    } else {
      profile = {
        'id': record.$id,
        'email': record.data['email'],
        'full_name': record.data['full_name'],
        'role': record.data['role'],
      };
    }
    return Response.json(
      statusCode: status,
      headers: {'Set-Cookie': cookie(token), 'Cache-Control': 'no-store'},
      body: {
        'access_token': token,
        kind == 'customer'
                ? 'user'
                : kind == 'partner'
                ? 'partner'
                : 'employee':
            profile,
      },
    );
  }

  try {
    if (action == 'refresh') {
      final token = sessionToken();
      return token == null ? unauthorized() : await sessionResponse(token);
    }
    if (action == 'logout') {
      final token = sessionToken();
      if (token != null) await sessions.logout(token, kind);
      return Response.json(
        body: {'ok': true},
        headers: {'Set-Cookie': cookie(''), 'Cache-Control': 'no-store'},
      );
    }
    if (!(context.request.headers['content-type'] ?? '')
        .toLowerCase()
        .startsWith('application/json')) {
      return badRequest('JSON body required');
    }
    final raw = await context.request.json();
    if (raw is! Map<String, dynamic>) return badRequest('JSON object required');
    String? value(String key) => raw[key] is String ? raw[key] as String : null;
    final email = value('email')?.trim().toLowerCase();
    final password = value('password');
    if (action == 'forgot_password') {
      if (email == null || email.isEmpty) {
        return badRequest('email is required');
      }
      await sessions.auth.resetEmail(email);
      return Response.json(
        body: {
          'message': 'If that email is registered, a reset link has been sent.',
        },
      );
    }
    if (action == 'reset_password') {
      final code = value('token') ?? value('oobCode');
      final next = value('new_password');
      if (code == null || next == null || next.length < 8) {
        return badRequest('token and new_password (8+ characters) required');
      }
      await sessions.resetPassword(code, next);
      return Response.json(body: {'message': 'Password updated successfully'});
    }
    if (email == null || email.isEmpty || password == null || password.isEmpty) {
      return badRequest('email and password required');
    }
    if (action == 'signup') {
      final fullName = value('full_name');
      final company = value('company_name');
      if (kind != 'customer' ||
          fullName == null ||
          fullName.trim().isEmpty ||
          company == null ||
          company.trim().isEmpty ||
          password.length < 8) {
        return badRequest(
          'Name, company and password (8+ characters) required',
        );
      }
      final login = await sessions.auth.signUp(email, password);
      try {
        await UserRepo(sessions.store).create(
          email: email,
          passwordHash: '',
          firebaseUid: login['localId'] as String,
          fullName: fullName,
          companyName: company,
          companySize: value('company_size') ?? 'unknown',
          industry: value('industry') ?? 'unknown',
        );
      } catch (_) {
        await sessions.auth.deleteUser(login['localId'] as String);
        rethrow;
      }
      return sessionResponse(await sessions.issue(login, kind), status: 201);
    }
    final login = await sessions.auth.signIn(email, password);
    return sessionResponse(await sessions.issue(login, kind));
  } on FirebaseAuthFailure catch (e) {
    if (e.code == 'AUTH_UNAVAILABLE') {
      return jsonError(
        503,
        'AUTH_UNAVAILABLE',
        'Authentication temporarily unavailable',
      );
    }
    if (e.code == 'EMAIL_EXISTS') {
      return jsonError(409, 'EMAIL_TAKEN', 'Account already exists');
    }
    if (action == 'reset_password') {
      return jsonError(
        422,
        'TOKEN_INVALID',
        'Reset token is invalid or expired',
      );
    }
    return unauthorized('Invalid credentials');
  } on FormatException {
    return badRequest('Invalid JSON');
  }
}
