/// POST /auth/signup
///
/// Body:    { email, password, full_name, company_name, company_size, industry }
/// Returns: { access_token, user }
/// Side:    Sets `astech_refresh` httpOnly cookie.
library;

import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import '../../lib/auth/jwt.dart';
import '../../lib/auth/password.dart';
import '../../lib/config.dart';
import '../../lib/db/pool.dart';
import '../../lib/http_helpers.dart';
import '../../lib/repos/subscription_repo.dart';
import '../../lib/repos/user_repo.dart';
import '../../lib/services/square_service.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'POST only');
  }

  final body = await context.request.json() as Map<String, dynamic>?;
  if (body == null) return badRequest('Missing body');

  final email = body['email'] as String?;
  final password = body['password'] as String?;
  final fullName = body['full_name'] as String?;
  final companyName = body['company_name'] as String?;
  // company_size and industry are optional on the form — default gracefully.
  final companySize = (body['company_size'] as String?)?.isNotEmpty == true
      ? body['company_size'] as String
      : 'unknown';
  final industry = (body['industry'] as String?)?.isNotEmpty == true
      ? body['industry'] as String
      : 'unknown';

  if ([email, password, fullName, companyName]
      .any((v) => v == null || v!.isEmpty)) {
    return badRequest('Email, password, full name and company name are required');
  }
  if (password!.length < 8) {
    return badRequest('Password must be at least 8 characters',
        code: 'WEAK_PASSWORD');
  }

  try {
    final db   = context.read<Db>();
    final repo = UserRepo(db);
    if (await repo.findByEmail(email!) != null) {
      return jsonError(
          409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }

    final user = await repo.create(
      email: email,
      passwordHash: hashPassword(password),
      fullName: fullName!,
      companyName: companyName!,
      companySize: companySize,
      industry: industry,
    );

    // Every new company starts on the free tier.
    await SubscriptionRepo(db).createFree(user.companyId);

    // Create a Square Customer record so that payment history, saved cards,
    // and invoices are owned by Square rather than stored in our DB.
    // Fire-and-forget — a Square outage must never block signup.
    final square = context.read<SquareService?>();
    if (square != null) {
      Future(() async {
        try {
          final customerId = await square.createCustomer(
            email:       email,
            companyName: companyName!,
            referenceId: user.companyId,
          );
          await db.query(
            'UPDATE companies SET square_customer_id = @cid WHERE id = @id::uuid',
            parameters: {'cid': customerId, 'id': user.companyId},
          );
        } catch (e) {
          stderr.writeln('[signup] Square customer creation failed: $e');
        }
      }).ignore();
    }

    final cfg = context.read<AppConfig>();
    final jwt = context.read<JwtService>();
    final accessToken = jwt.issueAccessToken(AccessClaims(
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    ));

    final refreshPlain = generateRefreshTokenPlaintext();
    await repo.insertRefreshToken(
      userId: user.id,
      plaintextToken: refreshPlain,
      expiresAt: DateTime.now().toUtc().add(cfg.refreshTokenTtl),
    );

    return Response.json(
      statusCode: 201,
      body: {
        'access_token': accessToken,
        'user': user.toAuthUser(),
      },
      headers: {
        'Set-Cookie':
            'astech_refresh=$refreshPlain; Path=/auth; Max-Age=${cfg.refreshTokenTtl.inSeconds}; HttpOnly; SameSite=Strict; Secure',
      },
    );
  } catch (e, st) {
    stderr.writeln('[signup] ERROR: $e\n$st');
    return serverError('Signup failed — please try again');
  }
}
