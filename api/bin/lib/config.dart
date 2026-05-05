/// Centralized config — read once at startup, fail loud on missing required values.
library;

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
    required this.squareLocationId,
    required this.squareEnvironment,
    // GuildMark Wallet — ACH payout details (optional until wallet is live)
    this.gmWalletAchRouting,
    this.gmWalletAchAccount,
    // MDM integrations (optional — only required when MDM features are enabled)
    this.jamfClientId,
    this.jamfClientSecret,
    this.intuneTenatId,
    this.intuneClientId,
    this.intuneClientSecret,
    // Market data sources (optional)
    // eBay uses OAuth — all three IDs are needed to exchange for a token.
    this.ebayAppId,
    this.ebayCertId,
    this.ebayDevId,
    this.backmarketApiKey,
    // Email — Resend (optional; emails are skipped when key is absent)
    this.resendApiKey,
    // Escrow.com (optional; escrow steps are skipped when not configured)
    this.escrowApiKey,
    this.escrowEmail,
    this.escrowSandbox = true,
    // FedEx Track API (optional; tracking falls back to manual)
    this.fedexClientId,
    this.fedexClientSecret,
    this.fedexWebhookSecret,
    this.fedexSandbox = true,
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

    int requireInt(String key) => int.parse(require(key));

    bool optionalBool(String key, {bool defaultValue = false}) =>
        (Platform.environment[key] ?? '').toLowerCase() == 'true'
            ? true
            : defaultValue;

    return AppConfig(
      port: int.tryParse(Platform.environment['API_PORT'] ?? '') ?? 8080,
      databaseUrl: require('DATABASE_URL'),
      jwtAccessSecret: require('JWT_ACCESS_SECRET'),
      jwtRefreshSecret: require('JWT_REFRESH_SECRET'),
      accessTokenTtl: Duration(seconds: requireInt('JWT_ACCESS_TTL_SECONDS')),
      refreshTokenTtl: Duration(seconds: requireInt('JWT_REFRESH_TTL_SECONDS')),
      corsOrigin: Platform.environment['CORS_ORIGIN'] ?? '*',
      isDebug: optionalBool('GM_DEBUG'),
      mlServiceUrl: optional('ML_SERVICE_URL'),
      squareAccessToken: require('SQUARE_ACCESS_TOKEN'),
      squareLocationId: require('SQUARE_LOCATION_ID'),
      squareEnvironment: Platform.environment['SQUARE_ENVIRONMENT'] ?? 'sandbox',
      gmWalletAchRouting: optional('GM_WALLET_ACH_ROUTING'),
      gmWalletAchAccount: optional('GM_WALLET_ACH_ACCOUNT'),
      // MDM integrations
      jamfClientId: optional('JAMF_PRO_CLIENT_ID'),
      jamfClientSecret: optional('JAMF_PRO_CLIENT_SECRET'),
      intuneTenatId: optional('INTUNE_TENANT_ID'),
      intuneClientId: optional('INTUNE_CLIENT_ID'),
      intuneClientSecret: optional('INTUNE_CLIENT_SECRET'),
      // Market data — eBay OAuth triple
      ebayAppId:        optional('EBAY_APP_ID'),
      ebayCertId:       optional('EBAY_CERT_ID'),
      ebayDevId:        optional('EBAY_DEV_ID'),
      backmarketApiKey: optional('BACKMARKET_API_KEY'),
      resendApiKey: optional('RESEND_API_KEY'),
      // Escrow.com
      escrowApiKey:  optional('ESCROW_API_KEY'),
      escrowEmail:   optional('ESCROW_EMAIL'),
      escrowSandbox: (Platform.environment['ESCROW_ENVIRONMENT'] ?? 'sandbox') != 'production',
      // FedEx
      fedexClientId:     optional('FEDEX_CLIENT_ID'),
      fedexClientSecret: optional('FEDEX_CLIENT_SECRET'),
      fedexWebhookSecret: optional('FEDEX_WEBHOOK_SECRET'),
      fedexSandbox: (Platform.environment['FEDEX_ENVIRONMENT'] ?? 'sandbox') != 'production',
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

  /// Null when the ML service is not configured — callers must handle gracefully.
  final String? mlServiceUrl;

  // Square Web Payments
  final String squareAccessToken;
  final String squareLocationId;

  /// 'sandbox' or 'production'
  final String squareEnvironment;

  // GuildMark Wallet — ACH payout routing (null until wallet is live)
  final String? gmWalletAchRouting;
  final String? gmWalletAchAccount;

  // MDM integrations — all optional; only consumed by MDM-specific routes
  final String? jamfClientId;
  final String? jamfClientSecret;
  final String? intuneTenatId;
  final String? intuneClientId;
  final String? intuneClientSecret;

  // Market data sources — optional; used by valuation/pricing routes.
  // eBay requires all three IDs to complete the OAuth client-credentials flow.
  final String? ebayAppId;
  final String? ebayCertId;
  final String? ebayDevId;
  final String? backmarketApiKey;

  // Email — Resend. Null means email sends are silently skipped.
  final String? resendApiKey;

  // Escrow.com — all three required for escrow to be active.
  final String? escrowApiKey;
  final String? escrowEmail;
  final bool escrowSandbox;

  // FedEx Track API
  final String? fedexClientId;
  final String? fedexClientSecret;
  final String? fedexWebhookSecret;
  final bool fedexSandbox;
}
