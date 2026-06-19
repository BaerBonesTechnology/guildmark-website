import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:guildmark_api/models/invoice.dart';
import 'package:guildmark_api/models/listing.dart';
import 'package:guildmark_api/models/offer.dart';
import 'package:guildmark_api/models/portfolio.dart';
import 'package:guildmark_api/models/user.dart';

part 'company.freezed.dart';
part 'company.g.dart';

@Freezed()
abstract class Company with _$Company {
  const factory Company({
    required String id,
    required String name,
    String? logoUrl,
    List<User>? personnel,
    PortfolioSummary? portfolioSummary,
    Map<String, String>? mdmConnections, // Map of MDM type to connection ID
    Map<String, String>? customFields, // For extensibility
    List<TaxInvoice>? invoices, // Optional list of recent invoices
    List<Listing>? listings, // Optional list of recent listings
    List<BuyerOffer>? offers, // Optional map of listings to buyer offers
    // ── Per-company Jamf Pro credentials (stored in DB, not env) ───
    String? jamfInstanceUrl,
    String? jamfClientId,
    String? jamfClientSecret, // write-only; API returns null after save
    // ── Per-company Jamf School credentials ────────────────────────
    String? jamfSchoolUrl,
    String? jamfSchoolApiKey, // write-only; API returns null after save
    // ── Per-company Intune / Azure AD credentials ───────────────────
    String? azureTenantId,
    String? azureClientId,
    String? azureClientSecret, // write-only; API returns null after save
  }) = _Company;

  factory Company.fromJson(Map<String, dynamic> json) =>
      _$CompanyFromJson(json);
}
