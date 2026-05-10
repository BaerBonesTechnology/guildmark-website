/// Server entrypoint. Dart Frog calls `run` with a Handler built from the
/// `routes/` directory; we wrap it with our injection middleware.
library;

import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import 'lib/auth/jwt.dart';
import 'lib/config.dart';
import 'lib/db/migrations.dart';
import 'lib/db/pool.dart';
import 'lib/ml/ml_client.dart';
import 'lib/services/email_service.dart';
import 'lib/services/escrow_service.dart';
import 'lib/services/fedex_service.dart';
import 'lib/services/square_service.dart';

Future<HttpServer> run(Handler handler, InternetAddress ip, int port) async {
  final cfg = AppConfig.fromEnv();
  final db = await Db.connect(cfg.databaseUrl);

  // Apply any pending SQL migrations before serving traffic.
  final applied = await MigrationRunner(db).run();
  if (applied > 0) stdout.writeln('[boot] applied $applied migration(s)');

  // ML service is optional — the API degrades gracefully when unavailable.
  // Routes that require ML must check for a null MlClient and return a 503.
  final ml = cfg.mlServiceUrl != null
      ? MlClient(baseUrl: cfg.mlServiceUrl!)
      : null;

  if (ml == null) {
    stdout.writeln(
      '[boot] ML_SERVICE_URL not set — valuation endpoints will return 503.',
    );
  }

  final jwt = JwtService(
    accessSecret: cfg.jwtAccessSecret,
    accessTtl: cfg.accessTokenTtl,
  );

  final square = SquareService(
    accessToken: cfg.squareAccessToken,
    locationId:  cfg.squareLocationId,
    environment: cfg.squareEnvironment,
    apiUrl:      cfg.squareApiUrl,
  );

  final email = EmailService(
    apiKey: cfg.resendApiKey ?? '',
    apiUrl: cfg.resendApiUrl,
  );
  if (cfg.resendApiKey == null) {
    stdout.writeln('[boot] RESEND_API_KEY not set — emails will be skipped.');
  }

  final escrow = EscrowService(
    apiKey:       cfg.escrowApiKey ?? '',
    accountEmail: cfg.escrowEmail  ?? '',
    sandbox:      cfg.escrowSandbox,
    apiUrl:       cfg.escrowApiUrl,
  );
  if (!escrow.isConfigured) {
    stdout.writeln('[boot] ESCROW_API_KEY/ESCROW_EMAIL not set — escrow steps will be skipped.');
  }

  final fedex = FedexService(
    clientId:     cfg.fedexApiKey    ?? '',
    clientSecret: cfg.fedexSecretKey ?? '',
    sandbox:      cfg.fedexSandbox,
    apiUrl:       cfg.fedexApiUrl,
  );
  if (!fedex.isConfigured) {
    stdout.writeln('[boot] FEDEX_API_KEY/FEDEX_SECRET_KEY not set — tracking lookups disabled.');
  }

  // Inject singletons. Routes read via `context.read<T>()`.
  final wrapped = handler
      .use(provider<AppConfig>((_) => cfg))
      .use(provider<Db>((_) => db))
      .use(provider<MlClient?>((_) => ml))
      .use(provider<JwtService>((_) => jwt))
      .use(provider<SquareService?>((_) => square))
      .use(provider<EmailService>((_) => email))
      .use(provider<EscrowService>((_) => escrow))
      .use(provider<FedexService>((_) => fedex));

  return serve(wrapped, ip, cfg.port);
}
