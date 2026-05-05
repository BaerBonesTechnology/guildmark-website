/// Enum string constants matching the Postgres types and types.ts unions.
/// Kept as `const` strings rather than Dart enums so they round-trip to JSON
/// without any case/serialization translation.
library;

abstract final class AssetType {
  static const laptop = 'laptop';
  static const desktop = 'desktop';
  static const server = 'server';
  static const phone = 'phone';
  static const tablet = 'tablet';
  static const networking = 'networking';
  static const monitor = 'monitor';
  static const software = 'software';
  static const license = 'license';
  static const other = 'other';

  static const all = [
    laptop,
    desktop,
    server,
    phone,
    tablet,
    networking,
    monitor,
    software,
    license,
    other,
  ];
}

abstract final class ConditionGrade {
  static const a = 'A';
  static const b = 'B';
  static const c = 'C';
  static const all = [a, b, c];
}

abstract final class MdmSource {
  static const manual = 'manual';
  static const jamfPro = 'jamf_pro';
  static const jamfSchool = 'jamf_school';
  static const intune = 'intune';
  static const all = [manual, jamfPro, jamfSchool, intune];
}

abstract final class MdmType {
  static const jamfPro = 'jamf_pro';
  static const jamfSchool = 'jamf_school';
  static const intune = 'intune';
  static const all = [jamfPro, jamfSchool, intune];
}

abstract final class ValuationFlag {
  static const standard = 'standard';
  static const sellerOverpriced = 'seller_overpriced';
  static const distressed = 'distressed';
  static const insufficientData = 'insufficient_data';
}

abstract final class ListingStatus {
  static const draft = 'draft';
  static const active = 'active';
  static const sold = 'sold';
  static const expired = 'expired';
  static const withdrawn = 'withdrawn';
}

abstract final class OfferStatus {
  static const pending = 'pending';
  static const accepted = 'accepted';
  static const rejected = 'rejected';
  static const expired = 'expired';
  static const countered = 'countered';
}

abstract final class InvoiceType {
  static const disposal = 'disposal';
  static const loss = 'loss';
  static const sale = 'sale';
  static const donation = 'donation';
  static const all = [disposal, loss, sale, donation];
}

abstract final class UserRole {
  static const admin = 'admin';
  static const member = 'member';
  static const viewer = 'viewer';
}
