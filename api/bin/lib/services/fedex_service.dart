/// FedEx Track API wrapper.
///
/// Docs: https://developer.fedex.com/api/en-us/catalog/track/docs.html
///
/// Authentication: OAuth 2.0 client-credentials flow.
/// Tokens are cached in-memory (expiry = issued_at + expires_in − 60s buffer).
/// Failures are logged but never thrown — callers check for null returns.
library;

import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

// ---------------------------------------------------------------------------
// Value objects
// ---------------------------------------------------------------------------

class FedexTrackEvent {
  FedexTrackEvent({
    required this.eventType,
    required this.eventDescription,
    required this.timestamp,
    this.city,
    this.stateOrProvinceCode,
    this.countryCode,
  });

  final String eventType;
  final String eventDescription;
  final DateTime timestamp;
  final String? city;
  final String? stateOrProvinceCode;
  final String? countryCode;

  bool get isDelivered => eventType == 'DL';

  Map<String, dynamic> toJson() => {
        'event_type': eventType,
        'event_description': eventDescription,
        'timestamp': timestamp.toIso8601String(),
        if (city != null) 'city': city,
        if (stateOrProvinceCode != null) 'state': stateOrProvinceCode,
        if (countryCode != null) 'country': countryCode,
      };
}

class FedexTrackResult {
  FedexTrackResult({
    required this.trackingNumber,
    required this.statusCode,
    required this.status,
    required this.events,
    this.estimatedDelivery,
    this.actualDelivery,
  });

  final String trackingNumber;
  final String statusCode;
  final String status;
  final List<FedexTrackEvent> events;
  final DateTime? estimatedDelivery;
  final DateTime? actualDelivery;

  bool get isDelivered => statusCode == 'DL';

  /// The delivery timestamp, present only when status is DL.
  DateTime? get deliveredAt =>
      isDelivered ? (actualDelivery ?? events.where((e) => e.isDelivered).firstOrNull?.timestamp) : null;

  // FedEx Track API wraps results under output.completeTrackResults[].trackResults[]
  static FedexTrackResult? fromApiJson(
      Map<String, dynamic> json, String trackingNumber) {
    try {
      final output = json['output'] as Map?;
      final completeResults = output?['completeTrackResults'] as List?;
      if (completeResults == null || completeResults.isEmpty) return null;

      final trackResults =
          (completeResults.first as Map)['trackResults'] as List?;
      if (trackResults == null || trackResults.isEmpty) return null;

      final tr = trackResults.first as Map<String, dynamic>;

      final trackingInfo =
          tr['trackingNumberInfo'] as Map? ?? {};
      final tn = (trackingInfo['trackingNumber'] as String?) ?? trackingNumber;

      final latestStatus = tr['latestStatusDetail'] as Map? ?? {};
      final statusCode = latestStatus['statusByLocale'] as String? ??
          latestStatus['code'] as String? ??
          '';
      final status = latestStatus['description'] as String? ?? statusCode;

      // Parse scan events
      final scanEvents = tr['scanEvents'] as List? ?? [];
      final events = scanEvents.map((e) {
        final ev = e as Map<String, dynamic>;
        final loc = ev['scanLocation'] as Map? ?? {};
        return FedexTrackEvent(
          eventType: ev['derivedStatusCode'] as String? ??
              ev['eventType'] as String? ??
              '',
          eventDescription: ev['eventDescription'] as String? ?? '',
          timestamp: _parseTs(ev['date'] as String? ?? ''),
          city: loc['city'] as String?,
          stateOrProvinceCode: loc['stateOrProvinceCode'] as String?,
          countryCode: loc['countryCode'] as String?,
        );
      }).toList();

      // Estimated / actual delivery
      final dateInfo = tr['dateAndTimes'] as List? ?? [];
      DateTime? estimated;
      DateTime? actual;
      for (final d in dateInfo) {
        final dm = d as Map;
        if (dm['type'] == 'ESTIMATED_DELIVERY') {
          estimated = _parseTs(dm['dateTime'] as String? ?? '');
        }
        if (dm['type'] == 'ACTUAL_DELIVERY') {
          actual = _parseTs(dm['dateTime'] as String? ?? '');
        }
      }

      return FedexTrackResult(
        trackingNumber: tn,
        statusCode: statusCode,
        status: status,
        events: events,
        estimatedDelivery: estimated,
        actualDelivery: actual,
      );
    } catch (e) {
      stderr.writeln('[fedex] fromApiJson parse error: $e');
      return null;
    }
  }

  static DateTime _parseTs(String s) {
    if (s.isEmpty) return DateTime.now().toUtc();
    try {
      return DateTime.parse(s).toUtc();
    } catch (_) {
      return DateTime.now().toUtc();
    }
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class FedexService {
  FedexService({
    required this.clientId,
    required this.clientSecret,
    bool sandbox = true,
    String? apiUrl,
  }) : _baseUrl = apiUrl ??
            (sandbox
                ? 'https://apis-sandbox.fedex.com'
                : 'https://apis.fedex.com');

  final String clientId;
  final String clientSecret;
  final String _baseUrl;

  // ── Token cache ─────────────────────────────────────────────────────────────
  String? _token;
  DateTime? _tokenExpiry;

  bool get isConfigured => clientId.isNotEmpty && clientSecret.isNotEmpty;

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /// Look up a shipment by tracking number.
  /// Returns null when the service is not configured or the API call fails.
  Future<FedexTrackResult?> track(String trackingNumber) async {
    if (!isConfigured) {
      stderr.writeln('[fedex] not configured — skipping track');
      return null;
    }

    final token = await _getToken();
    if (token == null) return null;

    try {
      final resp = await http
          .post(
            Uri.parse('$_baseUrl/track/v1/trackingnumbers'),
            headers: {
              HttpHeaders.authorizationHeader: 'Bearer $token',
              HttpHeaders.contentTypeHeader: 'application/json',
              'x-locale': 'en_US',
              'x-customer-transaction-id': trackingNumber,
            },
            body: jsonEncode({
              'includeDetailedScans': true,
              'trackingInfo': [
                {
                  'trackingNumberInfo': {'trackingNumber': trackingNumber},
                }
              ],
            }),
          )
          .timeout(const Duration(seconds: 15));

      if (resp.statusCode != 200) {
        stderr.writeln('[fedex] track ${resp.statusCode}: ${resp.body}');
        return null;
      }

      final json = jsonDecode(resp.body) as Map<String, dynamic>;
      return FedexTrackResult.fromApiJson(json, trackingNumber);
    } catch (e) {
      stderr.writeln('[fedex] track error: $e');
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // OAuth token management
  // ---------------------------------------------------------------------------

  Future<String?> _getToken() async {
    if (_token != null &&
        _tokenExpiry != null &&
        DateTime.now().isBefore(_tokenExpiry!)) {
      return _token;
    }

    try {
      final resp = await http
          .post(
            Uri.parse('$_baseUrl/oauth/token'),
            headers: {
              HttpHeaders.contentTypeHeader:
                  'application/x-www-form-urlencoded',
            },
            body:
                'grant_type=client_credentials&client_id=$clientId&client_secret=$clientSecret',
          )
          .timeout(const Duration(seconds: 10));

      if (resp.statusCode != 200) {
        stderr.writeln('[fedex] auth ${resp.statusCode}: ${resp.body}');
        return null;
      }

      final json = jsonDecode(resp.body) as Map<String, dynamic>;
      _token = json['access_token'] as String;
      final expiresIn = (json['expires_in'] as num).toInt();
      // Subtract 60 s buffer so we refresh before actual expiry.
      _tokenExpiry = DateTime.now().add(Duration(seconds: expiresIn - 60));
      stdout.writeln('[fedex] token refreshed (expires in ${expiresIn}s)');
      return _token;
    } catch (e) {
      stderr.writeln('[fedex] token error: $e');
      return null;
    }
  }
}
