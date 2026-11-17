/// Approved monthly AMPS catalog. Limits count physical units, not rows.
class AmpsPlan {
  const AmpsPlan(
    this.priceCents,
    this.assetLimit,
    this.seatLimit,
    this.valuationLimit,
  );
  final int priceCents;
  final int assetLimit;
  final int seatLimit;
  final int valuationLimit;
  Map<String, dynamic> toJson() => {
    'price_cents': priceCents,
    'asset_limit': assetLimit,
    'seat_limit': seatLimit,
    'included_seats': 1,
    'additional_seat_price_cents': priceCents == 3900
        ? 800
        : priceCents == 9900
        ? 2000
        : 4000,
    'seat_addon_status': 'approved_pricing_not_purchasable',
    'valuation_limit': valuationLimit,
  };
}

const ampsPlans = {
  'starter': AmpsPlan(3900, 100, 1, 200),
  'growth': AmpsPlan(9900, 500, 1, 1000),
  'pro': AmpsPlan(19900, 2000, 1, 4000),
};

DateTime nextBillingMonth(DateTime start) {
  final firstNext = DateTime.utc(start.year, start.month + 1);
  final lastNext = DateTime.utc(start.year, start.month + 2, 0).day;
  return DateTime.utc(
    firstNext.year,
    firstNext.month,
    start.day > lastNext ? lastNext : start.day,
    start.hour,
    start.minute,
    start.second,
    start.millisecond,
    start.microsecond,
  );
}

class PlanLimitException implements Exception {
  const PlanLimitException(this.code, this.message, {this.status = 403});
  final String code;
  final String message;
  final int status;
}
