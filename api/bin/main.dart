/// Server entrypoint. Dart Frog calls `run` with a Handler built from the
/// `routes/` directory; we wrap it with our injection middleware.
library;

import 'dart:io';

import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/auth/firebase_auth.dart';
import 'package:guildmark_api/auth/firebase_sessions.dart';
import 'package:guildmark_api/auth/jwt.dart';
import 'package:guildmark_api/config.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_routing.dart';
import 'package:guildmark_api/ml/ml_client.dart';
import 'package:guildmark_api/services/email_service.dart';
import 'package:guildmark_api/services/escrow_service.dart';
import 'package:guildmark_api/services/fedex_service.dart';
import 'package:guildmark_api/services/square_service.dart';

Future<HttpServer> run(Handler handler, InternetAddress ip, int port) async {
  final cfg = AppConfig.fromEnv();

  // ML service is optional — the API degrades gracefully when unavailable.
  // Routes that require ML must check for a null MlClient and return a 503.
  final ml = cfg.mlServiceUrl != null
      ? MlClient(
          baseUrl: cfg.mlServiceUrl!,
          serviceToken: cfg.mlServiceToken,
          cacheVersion:
              Platform.environment['ML_CACHE_VERSION'] ?? 'valuation-0.1.0',
        )
      : null;

  if (ml == null) {
    stdout.writeln(
      '[boot] ML_SERVICE_URL not set — valuation endpoints will return 503.',
    );
  }

  // Credentials come from Cloud Run workload identity or local ADC/emulators.
  final firestore = FirebaseService.fromConfig(cfg);
  if (firestore == null) {
    stderr.writeln(
      '[boot] FIREBASE_PROJECT_ID is missing; data routes return 503.',
    );
  } else {
    stdout.writeln('[boot] Firestore project: ${firestore.projectId}');
  }

  if (cfg.authMode != null &&
      !{'legacy', 'firebase-emulator'}.contains(cfg.authMode)) {
    throw StateError('Unsupported AUTH_MODE');
  }
  final firebaseAuth = cfg.authMode == 'firebase-emulator'
      ? FirebaseSessions(
          FirebaseAuth(
            projectId: cfg.firebaseProjectId ?? '',
            host: cfg.firebaseAuthEmulatorHost ?? '',
          ),
          firestore!,
        )
      : null;

  final jwt = JwtService(
    accessSecret: cfg.jwtAccessSecret,
    accessTtl: cfg.accessTokenTtl,
  );

  final partnerJwt = PartnerJwtService(
    accessSecret: cfg.jwtAccessSecret,
    accessTtl: cfg.accessTokenTtl,
  );

  final square =
      cfg.squareAccessToken.isNotEmpty && cfg.squareLocationId.isNotEmpty
      ? SquareService(
          accessToken: cfg.squareAccessToken,
          locationId: cfg.squareLocationId,
          environment: cfg.squareEnvironment,
          apiUrl: cfg.squareApiUrl,
        )
      : null;

  final email = EmailService(
    apiKey: cfg.resendApiKey ?? '',
    apiUrl: cfg.resendApiUrl,
  );
  if (cfg.resendApiKey == null) {
    stdout.writeln('[boot] RESEND_API_KEY not set — emails will be skipped.');
  }

  final escrow = EscrowService(
    apiKey: cfg.escrowApiKey ?? '',
    accountEmail: cfg.escrowEmail ?? '',
    sandbox: cfg.escrowSandbox,
    apiUrl: cfg.escrowApiUrl,
  );
  if (!escrow.isConfigured) {
    stdout.writeln(
      '[boot] ESCROW_API_KEY/ESCROW_EMAIL not set — escrow steps will be skipped.',
    );
  }

  final fedex = FedexService(
    clientId: cfg.fedexApiKey ?? '',
    clientSecret: cfg.fedexSecretKey ?? '',
    sandbox: cfg.fedexSandbox,
    apiUrl: cfg.fedexApiUrl,
  );
  if (!fedex.isConfigured) {
    stdout.writeln(
      '[boot] FEDEX_API_KEY/FEDEX_SECRET_KEY not set — tracking lookups disabled.',
    );
  }

  // Inject singletons. Routes read via `context.read<T>()`.
  var wrapped = apiRouter(handler)
      .use(provider<AppConfig>((_) => cfg))
      .use(provider<MlClient?>((_) => ml))
      .use(provider<FirebaseService?>((_) => firestore))
      .use(provider<JwtService>((_) => jwt))
      .use(provider<PartnerJwtService>((_) => partnerJwt))
      .use(provider<SquareService?>((_) => square))
      .use(provider<EmailService>((_) => email))
      .use(provider<EscrowService>((_) => escrow))
      .use(provider<FedexService>((_) => fedex));

  if (firebaseAuth != null) {
    wrapped = wrapped.use(provider<FirebaseSessions>((_) => firebaseAuth));
  }

  final bindAddress =
      (Platform.environment['GM_LOCAL_STACK'] == 'true' || firebaseAuth != null)
      ? InternetAddress.loopbackIPv4
      : ip;
  return serve(wrapped, bindAddress, cfg.port);
}
