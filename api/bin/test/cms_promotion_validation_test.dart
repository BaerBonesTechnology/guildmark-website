import 'package:test/test.dart';
import 'package:guildmark_api/services/cms.dart';

void main() {
  final creative = <String, dynamic>{
    'placement': 'marketplace-banner',
    'cta_label': 'Browse',
    'target_url': '/marketplace',
    'disclosure': 'sponsored',
    'sponsor': 'QA',
    'starts_at': '',
    'ends_at': '',
    'priority': '0',
  };
  test('valid internal and HTTPS destinations', () {
    Cms.validatePromotion(creative);
    Cms.validatePromotion({
      ...creative,
      'target_url': 'https://example.com/path',
    });
  });
  test('unsafe destinations and invalid publishing metadata are rejected', () {
    for (final bad in [
      {'target_url': 'javascript:alert(1)'},
      {'target_url': '//evil.test'},
      {'target_url': r'/\evil.test'},
      {'sponsor': ''},
      {'placement': 'arbitrary'},
      {'priority': '-1'},
      {'starts_at': 'invalid'},
      {'starts_at': '2026-01-02T00:00:00Z', 'ends_at': '2026-01-01T00:00:00Z'},
    ]) {
      expect(
        () => Cms.validatePromotion({...creative, ...bad}),
        throwsA(isA<CmsFailure>()),
      );
    }
  });
  test('schedule starts inclusively and ends exclusively', () {
    expect(
      Cms.promotionActive({
        ...creative,
        'starts_at': '2026-01-02T00:00:00Z',
      }, DateTime.utc(2026, 1, 1)),
      false,
    );
    expect(
      Cms.promotionActive({
        ...creative,
        'ends_at': '2026-01-01T00:00:00Z',
      }, DateTime.utc(2026, 1, 1)),
      false,
    );
    expect(
      Cms.promotionActive({
        ...creative,
        'starts_at': '2026-01-01T00:00:00Z',
      }, DateTime.utc(2026, 1, 1)),
      true,
    );
  });
}
