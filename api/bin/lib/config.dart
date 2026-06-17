import 'dart:io';

class AppConfig {
  AppConfig({
    required this.port,
    required this.databaseUrl,
    required this.jwtAccessSecret,
    required this.jwtRefreshSecret,
    required this.accessTokenTtl,
    required this.refreshTokenTtl,
    required this.corsOrigin,
    required this.isDebug,
    // ML service is optional — API degrades gracefully when unavailable.
    this.mlServiceUrl,
    // Square Web Payments
    required this.squareAccessToken,
    required this.squareApplicationId,
    required this.squareLocationId,
    required this.squareEnvironment,
    this.squarePlanStarterMonthly,
    this.squarePlanStarterAnnual,
    this.squarePlanGrowthMonthly,
    this.squarePlanGrowthAnnual,
    this.squarePlanProMonthly,
    this.squarePlanProAnnual,
    required this.squareApiUrl,
    // GuildMark Wallet — ACH payout details (optional until wallet is live)
    this.gmWalletAchRouting,
    this.gmWalletAchAccount,
    // MDM — only the shared Graph API base URL lives here; credentials are per-company in DB
    required this.intuneApiUrl,
    // Market data sources (optional)
    // eBay uses OAuth — all three IDs are needed to exchange for a token.
    this.ebayAppId,
    this.ebayCertId,
    this.ebayDevId,
    required this.ebayApiUrl,
    this.backmarketApiKey,
    required this.backmarketApiUrl,
    // Email — Resend (optional; emails are skipped when key is absent)
    this.resendApiKey,
    required this.resendApiUrl,
    // Escrow.com (optional; escrow steps are skipped when not configured)
    this.escrowApiKey,
    this.escrowEmail,
    this.escrowSandbox = true,
    required this.escrowApiUrl,
    // FedEx Track API (optional; tracking falls back to manual)
    this.fedexApiKey,
    this.fedexSecretKey,
    this.fedexWebhookSecret,
    this.fedexSandbox = true,
    required this.fedexApiUrl,
    this.adminAuthUser,
    this.adminAuthPass,
    this.adminCorsOrigin,
    this.partnerCorsOrigin,
    this.dopplerWebhookSecret,
    this.dopplerBearerToken,
    this.ebayVerificationToken,
    this.ebayDeletionEndpoint,
    // WebAuthn / Passkey 2FA for DevDash employees
    this.webauthnRpId,
    this.webauthnRpName,
  });

  factory AppConfig.fromEnv() {
    String require(String key) {
      final v = Platform.environment[key];
      if (v == null || v.isEmpty) {
        throw StateError('Missing required env var: $key');
      }
      return v;
    }

    String? optional(String key) {
      final v = Platform.environment[key];
      return (v == null || v.isEmpty) ? null : v;
    }

    String env(String key, String fallback) =>
        Platform.environment[key]?.isNotEmpty == true
        ? Platform.environment[key]!
        : fallback;

    int requireInt(String key) => int.parse(require(key));

    bool optionalBool(String key, {bool defaultValue = false}) =>
        (Platform.environment[key] ?? '').toLowerCase() == 'true'
        ? true
        : defaultValue;

    final squareEnvironment =
        Platform.environment['SQUARE_ENVIRONMENT'] ?? 'sandbox';
    final escrowEnvironment =
        Platform.environment['ESCROW_ENVIRONMENT'] ?? 'sandbox';
    final fedexEnvironment =
        Platform.environment['FEDEX_ENVIRONMENT'] ?? 'sandbox';

    return AppConfig(
      port: int.tryParse(Platform.environment['API_PORT'] ?? '') ?? 8080,
      databaseUrl: require('DATABASE_URL'),
      jwtAccessSecret: require('JWT_ACCESS_SECRET'),
      jwtRefreshSecret: require('JWT_REFRESH_SECRET'),
      accessTokenTtl: Duration(seconds: requireInt('JWT_ACCESS_TTL_SECONDS')),
      refreshTokenTtl: Duration(seconds: requireInt('JWT_REFRESH_TTL_SECONDS')),
      corsOrigin: () {
        final v = Platform.environment['CORS_ORIGIN'];
        if (v == null || v.isEmpty) {
          final isDebugMode =
              (Platform.environment['GM_DEBUG'] ?? '').toLowerCase() == 'true';
          if (!isDebugMode) {
            throw StateError('Missing required env var: CORS_ORIGIN');
          }
          return 'http://localhost:5173';
        }
        return v;
      }(),
      isDebug: optionalBool('GM_DEBUG'),
      mlServiceUrl: optional('ML_SERVICE_URL'),
      // Square
      squareAccessToken: require('SQUARE_ACCESS_TOKEN'),
      squareApplicationId: require('SQUARE_APPLICATION_ID'),
      squareLocationId: require('SQUARE_LOCATION_ID'),
      squareEnvironment: squareEnvironment,
      // Subscription plan variation IDs — monthly and annual per tier.
      squarePlanStarterMonthly: optional('SQUARE_PLAN_STARTER_MONTHLY'),
      squarePlanStarterAnnual: optional('SQUARE_PLAN_STARTER_ANNUAL'),
      squarePlanGrowthMonthly: optional('SQUARE_PLAN_GROWTH_MONTHLY'),
      squarePlanGrowthAnnual: optional('SQUARE_PLAN_GROWTH_ANNUAL'),
      squarePlanProMonthly: optional('SQUARE_PLAN_PRO_MONTHLY'),
      squarePlanProAnnual: optional('SQUARE_PLAN_PRO_ANNUAL'),
      squareApiUrl: env(
        'SQUARE_API_URL',
        squareEnvironment == 'production'
            ? 'https://connect.squareup.com/v2'
            : 'https://connect.squareupsandbox.com/v2',
      ),
      // Wallet
      gmWalletAchRouting: optional('GM_WALLET_ACH_ROUTING'),
      gmWalletAchAccount: optional('GM_WALLET_ACH_ACCOUNT'),
      intuneApiUrl: env('INTUNE_API_URL', 'https://graph.microsoft.com/v1.0'),
      // eBay
      ebayAppId: optional('EBAY_APP_ID'),
      ebayCertId: optional('EBAY_CERT_ID'),
      ebayDevId: optional('EBAY_DEV_ID'),
      ebayApiUrl: env('EBAY_API_URL', 'https://api.sandbox.ebay.com'),
      // Back Market
      backmarketApiKey: optional('BACKMARKET_API_KEY'),
      backmarketApiUrl: env(
        'BACKMARKET_API_URL',
        'https://www.backmarket.com/ws',
      ),
      // Resend
      resendApiKey: optional('RESEND_API_KEY'),
      resendApiUrl: env('RESEND_API_URL', 'https://api.resend.com/emails'),
      // Escrow.com
      escrowApiKey: optional('ESCROW_API_KEY'),
      escrowEmail: optional('ESCROW_EMAIL'),
      escrowSandbox: escrowEnvironment != 'production',
      escrowApiUrl: env(
        'ESCROW_API_URL',
        escrowEnvironment == 'production'
            ? 'https://api.escrow.com/2017-09-01'
            : 'https://api.escrow-sandbox.com/2017-09-01',
      ),
      // FedEx
      fedexApiKey: optional('FEDEX_API_KEY'),
      fedexSecretKey: optional('FEDEX_SECRET_KEY'),
      fedexWebhookSecret: optional('FEDEX_WEBHOOK_SECRET'),
      fedexSandbox: fedexEnvironment != 'production',
      fedexApiUrl: env(
        'FEDEX_API_URL',
        fedexEnvironment == 'production'
            ? 'https://apis.fedex.com'
            : 'https://apis-sandbox.fedex.com',
      ),
      adminAuthUser: optional('ADMIN_AUTH_USER'),
      adminAuthPass: optional('ADMIN_AUTH_PASS'),
      adminCorsOrigin: optional('ADMIN_CORS_ORIGIN'),
      partnerCorsOrigin: optional('PARTNER_CORS_ORIGIN'),
      dopplerWebhookSecret: optional('DOPPLER_SECRET'),
      dopplerBearerToken: optional('DOPPLER_BEARER_TOKEN'),
      ebayVerificationToken: optional('EBAY_VERIFICATION_TOKEN'),
      ebayDeletionEndpoint: optional('EBAY_DELETION_ENDPOINT'),
      webauthnRpId: optional('WEBAUTHN_RP_ID'),
      webauthnRpName: optional('WEBAUTHN_RP_NAME'),
    );
  }

  final int port;
  final String databaseUrl;
  final String jwtAccessSecret;
  final String jwtRefreshSecret;
  final Duration accessTokenTtl;
  final Duration refreshTokenTtl;
  final String corsOrigin;
  final bool isDebug;

  final String? mlServiceUrl;

  // ── Square Web Payments ─────────────────────────────────────────────────────

  final String squareAccessToken;

  final String squareApplicationId;

  final String squareLocationId;

  final String squareEnvironment;

  final String? squarePlanStarterMonthly;
  final String? squarePlanStarterAnnual;
  final String? squarePlanGrowthMonthly;
  final String? squarePlanGrowthAnnual;
  final String? squarePlanProMonthly;
  final String? squarePlanProAnnual;

  String? monthlyVariationId(String plan) => switch (plan) {
    'starter' => squarePlanStarterMonthly,
    'growth' => squarePlanGrowthMonthly,
    'pro' => squarePlanProMonthly,
    _ => null,
  };

  final String squareApiUrl;

  // ── GuildMark Wallet ────────────────────────────────────────────────────────
  final String? gmWalletAchRouting;
  final String? gmWalletAchAccount;

  // ── MDM integrations ────────────────────────────────────────────────────────
  // Jamf and Intune credentials are stored per-company in the DB — no platform-level vars.

  final String intuneApiUrl;

  // ── Market data sources ─────────────────────────────────────────────────────
  final String? ebayAppId;
  final String? ebayCertId;
  final String? ebayDevId;

  final String ebayApiUrl;

  final String? backmarketApiKey;

  final String backmarketApiUrl;

  // ── Email — Resend ──────────────────────────────────────────────────────────
  final String? resendApiKey;

  final String resendApiUrl;

  // ── Escrow.com ──────────────────────────────────────────────────────────────
  final String? escrowApiKey;
  final String? escrowEmail;
  final bool escrowSandbox;

  final String escrowApiUrl;

  // ── FedEx Track API ─────────────────────────────────────────────────────────
  final String? fedexApiKey;
  final String? fedexSecretKey;
  final String? fedexWebhookSecret;
  final bool fedexSandbox;

  final String fedexApiUrl;

  // ── DevDash ─────────────────────────────────────────────────────────────────
  final String? adminAuthUser;
  final String? adminAuthPass;
  final String? adminCorsOrigin;
  final String? partnerCorsOrigin;

  // ── Doppler webhook ─────────────────────────────────────────────────────────

  final String? dopplerWebhookSecret;

  final String? dopplerBearerToken;

  // ── WebAuthn / Passkey 2FA ───────────────────────────────────────────────────

  final String? webauthnRpId;

  final String? webauthnRpName;

  // ── eBay Marketplace Account Deletion ───────────────────────────────────────

  final String? ebayVerificationToken;

  final String? ebayDeletionEndpoint;
}
