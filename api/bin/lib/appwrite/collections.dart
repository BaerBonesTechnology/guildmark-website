/// Central registry of Appwrite database + collection IDs.
///
/// Shared by the setup script (bin/tool/appwrite_setup.dart), the Appwrite
/// repos (lib/repos/appwrite/*), and the backfill scripts so the IDs never
/// drift between them.
library;

class Aw {
  Aw._();

  /// Single database that backs the whole API.
  static const String databaseId = 'guildmark';

  // ── Collection IDs ──────────────────────────────────────────────────────
  static const String companies = 'companies';
  static const String users = 'users';
  static const String refreshTokens = 'refresh_tokens';
  static const String assets = 'assets';
  static const String listings = 'listings';
  static const String buyerOffers = 'buyer_offers';
  static const String mdmConnections = 'mdm_connections';
  static const String taxInvoices = 'tax_invoices';
  static const String valuationSnapshots = 'valuation_snapshots';
  static const String mailingList = 'mailing_list';
  static const String orders = 'orders';
  static const String subscriptions = 'subscriptions';
  static const String subscriptionInvoices = 'subscription_invoices';
  static const String platformConfig = 'platform_config';
  static const String guildmarkEmployees = 'guildmark_employees';
  static const String employeeGroups = 'employee_groups';
  static const String employeeGroupMembers = 'employee_group_members';
  static const String employeeInvites = 'employee_invites';
  static const String employeePasskeys = 'employee_passkeys';
  static const String employeePasskeyChallenges = 'employee_passkey_challenges';
  static const String passwordResetTokens = 'password_reset_tokens';
  static const String assetValuations = 'asset_valuations';
  static const String partners = 'partners';
  static const String partnerRefreshTokens = 'partner_refresh_tokens';
  static const String partnerResetTokens = 'partner_reset_tokens';
  static const String partnerServiceAssignments = 'partner_service_assignments';
  static const String partnerPayouts = 'partner_payouts';

  /// `$id` of the single platform_config row (singleton table).
  static const String platformConfigRowId = 'config';
}

/// Postgres UUIDs contain hyphens, which are illegal in an Appwrite `$id`.
/// Strip them so the same identifier can be reused as the document `$id` and
/// in every field that references it (preserving foreign keys across backfill).
String awId(String uuid) => uuid.replaceAll('-', '');
