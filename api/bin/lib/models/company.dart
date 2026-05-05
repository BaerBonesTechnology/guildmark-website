import 'package:astech_api/models/invoice.dart';
import 'package:astech_api/models/listing.dart';
import 'package:astech_api/models/offer.dart';
import 'package:astech_api/models/portfolio.dart';
import 'package:astech_api/models/user.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'company.freezed.dart';
part 'company.g.dart';

@Freezed()
class Company with _$Company {
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
  }) = _Company;

  factory Company.fromJson(Map<String, dynamic> json) =>
      _$CompanyFromJson(json);
}
