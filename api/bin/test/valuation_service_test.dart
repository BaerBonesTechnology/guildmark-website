import 'package:guildmark_api/services/valuation_service.dart';
import 'package:test/test.dart';

ValuationRequest asset({
  String type = 'laptop',
  String grade = 'A',
  int age = 12,
  double? price,
  double? cpu,
  int? ram,
  int? storage,
}) => ValuationRequest(
  assetType: type,
  modelName: '',
  conditionGrade: grade,
  ageMonths: age,
  originalPrice: price,
  cpuScore: cpu,
  ramGb: ram,
  storageGb: storage,
);

void main() {
  final service = ValuationService();
  test('plan acceptance: one-year-old 1200 dollar laptop is 900', () {
    final result = service.estimateFairMarketValue(asset(price: 1200));
    expect(result.fairMarketValue, 900);
    expect(result.confidence, 0.4);
    expect(result.modelVersion, ValuationService.modelVersion);
  });
  test('base tables, condition grades, unknown types and zero anchor', () {
    const baselines = {
      'laptop': 950,
      'desktop': 700,
      'server': 2500,
      'phone': 450,
      'tablet': 400,
      'networking': 600,
      'monitor': 220,
      'software': 80,
      'license': 50,
      'other': 300,
    };
    for (final entry in baselines.entries) {
      expect(
        service
            .estimateFairMarketValue(asset(type: entry.key, age: 0))
            .fairMarketValue,
        entry.value,
      );
    }
    expect(
      service.estimateFairMarketValue(asset(price: 0, age: 0)).fairMarketValue,
      950,
    );
    expect(
      service
          .estimateFairMarketValue(asset(type: 'unknown', grade: '?', age: 0))
          .fairMarketValue,
      210,
    );
    expect(
      service
          .estimateFairMarketValue(asset(price: 1200, grade: 'B'))
          .fairMarketValue,
      702,
    );
    expect(
      service
          .estimateFairMarketValue(asset(price: 1200, grade: 'C'))
          .fairMarketValue,
      495,
    );
  });
  test('old assets retain the 15 percent floor', () {
    expect(
      service
          .estimateFairMarketValue(asset(price: 1200, age: 240))
          .fairMarketValue,
      180,
    );
  });
  test(
    'spec premium matches training coefficients and saturates at 20 percent',
    () {
      expect(
        service
            .estimateFairMarketValue(
              asset(price: 1200, cpu: 250, ram: 64, storage: 2048),
            )
            .fairMarketValue,
        1080,
      );
      expect(
        service
            .estimateFairMarketValue(
              asset(price: 1200, cpu: 10000, ram: 1024, storage: 99999),
            )
            .fairMarketValue,
        1080,
      );
    },
  );
  test('invalid values are rejected', () {
    for (final request in [
      asset(age: -1),
      asset(age: 241),
      asset(price: -1),
      asset(price: double.nan),
      asset(cpu: double.infinity),
      asset(ram: -1),
    ]) {
      expect(
        () => service.estimateFairMarketValue(request),
        throwsArgumentError,
      );
    }
    expect(
      () => service.forecastDepreciation(startingValue: -1),
      throwsArgumentError,
    );
    expect(
      () => service.forecastDepreciation(startingValue: 1, horizonMonths: 37),
      throwsArgumentError,
    );
  });
  test(
    '12/24/36 month curves cross year boundaries without rounding drift',
    () {
      for (final horizon in [12, 24, 36]) {
        final forecast = service.forecastDepreciation(
          startingValue: 100000,
          horizonMonths: horizon,
          asOf: DateTime.utc(2026, 12, 31),
        );
        expect(forecast.length, horizon);
        expect(forecast.first.month, '2027-01');
        expect(forecast.first.projectedValue, 98500);
        expect(forecast[11].projectedValue, 83413.2);
        expect(forecast.last.month, '${2026 + horizon ~/ 12}-12');
      }
      expect(
        service.forecastDepreciation(startingValue: 0).first.projectedValue,
        0,
      );
    },
  );
  test('weighted priors use defaults and clamp decay', () {
    final weighted = ValuationService(
      decayPriors: {'server': 0.99, 'phone': 0.95},
    );
    expect(
      weighted
          .forecastDepreciation(
            startingValue: 1000,
            typeWeights: {'server': 750, 'phone': 250},
          )
          .first
          .projectedValue,
      980,
    );
    expect(
      weighted
          .forecastDepreciation(
            startingValue: 1000,
            typeWeights: {'unknown': 10},
          )
          .first
          .projectedValue,
      985,
    );
    expect(
      weighted
          .forecastDepreciation(startingValue: 1000, typeWeights: {'phone': 0})
          .first
          .projectedValue,
      985,
    );
    expect(
      ValuationService(decayPriors: {'phone': 0.1})
          .forecastDepreciation(startingValue: 1000, typeWeights: {'phone': 1})
          .first
          .projectedValue,
      900,
    );
  });
}
