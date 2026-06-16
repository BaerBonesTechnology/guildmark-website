/// Square Web Payments service.
///
/// Wraps the Square Payments API using the `http` package since there is no
/// official Square Dart SDK. All amounts are in the smallest currency unit
/// (cents for USD).
///
/// Docs: https://developer.squareup.com/reference/square/payments-api
library;

import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';

const _uuid = Uuid();

class SquareService {
  SquareService({
    required this.accessToken,
    required this.locationId,
    required String environment,
    String? apiUrl,
  }) : _baseUrl = _normalizeUrl(
            apiUrl,
            environment == 'production'
                ? 'https://connect.squareup.com/'
                : 'https://connect.squareupsandbox.com/',
          ),
       _client = http.Client();

  /// Strips trailing slashes from [url] so that `$_baseUrl/payments` never
  /// produces a double slash (which Square's CDN silently 404s with no body).
  static String _normalizeUrl(String? url, String fallback) {
    final base = (url != null && url.isNotEmpty) ? url : fallback;
    return base.endsWith('/') ? base.substring(0, base.length - 1) : base;
  }

  final String accessToken;
  final String locationId;
  final String _baseUrl;
  final http.Client _client;

  Map<String, String> get _headers => {
        'Authorization': 'Bearer $accessToken',
        'Content-Type': 'application/json',
        'Square-Version': '2025-04-16',
      };

  /// Create a payment from a Square Web Payments SDK nonce.
  ///
  /// [sourceId]   — payment nonce from the frontend SDK (cnon:...)
  /// [amountCents] — amount in cents (USD)
  /// [note]       — optional note attached to the payment
  /// [referenceId] — your internal order/transaction ID
  Future<SquarePaymentResult> createPayment({
    required String sourceId,
    required int amountCents,
    String? note,
    String? referenceId,
    /// Square customer ID — attaches payment to the customer record so Square
    /// owns the full payment history. Created at signup via [createCustomer].
    String? customerId,
    /// When true and [customerId] is set, saves the card on file for future
    /// charges. Requires the customer to have consented.
    bool saveCard = false,
    /// Optional cardholder name for display and verification purposes.
    String? cardholderName,
    /// Optional billing address forwarded to Square for AVS checks.
    SquareBillingAddress? billingAddress,
  }) async {
    final idempotencyKey = _uuid.v4();

    final body = {
      'idempotency_key': idempotencyKey,
      'source_id': sourceId,
      'location_id': locationId,
      'amount_money': {
        'amount': amountCents,
        'currency': 'USD',
      },
      if (note != null)        'note': note,
      if (referenceId != null) 'reference_id': referenceId,
      if (customerId != null)  'customer_id': customerId,
      if (saveCard && customerId != null)
        'store_payment_method_in_vault': 'ON_SUCCESS',
      if (billingAddress != null)
        'billing_address': billingAddress.toJson(),
    };

    print(_headers);
    print(jsonEncode(body));

    final resp = await _client.post(
      Uri.parse('$_baseUrl/v2/payments'),
      headers: _headers,
      body: jsonEncode(body),
    );

    if (resp.statusCode != 200) {
      stderr.writeln('[Square] POST $_baseUrl/v2/payments → ${resp.statusCode}  body: ${resp.body}');
      if (resp.body.isEmpty) {
        // Empty body usually means the URL was wrong (double slash, wrong host)
        // or the nonce was already consumed by a previous attempt.
        throw SquareException(
          resp.statusCode,
          resp.statusCode == 404
              ? 'Square API endpoint not found — check SQUARE_API_URL env var '
                '(current base: $_baseUrl).'
              : 'Payment nonce was already used or has expired. '
                'Please re-enter your card details and try again.',
        );
      }
      final json   = jsonDecode(resp.body) as Map<String, dynamic>;
      final errors = json['errors'] as List? ?? [];
      final detail = errors.isNotEmpty
          ? (errors.first as Map)['detail'] as String? ?? 'Unknown error'
          : 'Square payment error ${resp.statusCode}';
      throw SquareException(resp.statusCode, detail);
    }

    final json = jsonDecode(resp.body) as Map<String, dynamic>;

    final payment = json['payment'] as Map<String, dynamic>;
    return SquarePaymentResult(
      id: payment['id'] as String,
      status: payment['status'] as String,
      amountCents: (payment['amount_money']['amount'] as int),
      receiptUrl: payment['receipt_url'] as String?,
    );
  }

  /// Create a Square Customer record for a newly registered company.
  ///
  /// Stores the customer in Square so that payment history, saved cards, and
  /// invoices are owned by Square rather than our database.
  ///
  /// Returns the Square customer ID (e.g. "JDKYHBWT1D4F8MFH63DBMEN8Y4") which
  /// should be persisted on the company row for future payment references.
  Future<String> createCustomer({
    required String email,
    required String companyName,
    String? referenceId,
  }) async {
    final resp = await _client.post(
      Uri.parse('$_baseUrl/customers'),
      headers: _headers,
      body: jsonEncode({
        'idempotency_key': _uuid.v4(),
        'email_address':   email,
        'company_name':    companyName,
        if (referenceId != null) 'reference_id': referenceId,
      }),
    );

    final json = jsonDecode(resp.body) as Map<String, dynamic>;

    if (resp.statusCode != 200) {
      final errors = json['errors'] as List? ?? [];
      final detail = errors.isNotEmpty
          ? (errors.first as Map)['detail'] as String? ?? 'Unknown error'
          : 'Square API error ${resp.statusCode}';
      throw SquareException(resp.statusCode, detail);
    }

    return (json['customer'] as Map<String, dynamic>)['id'] as String;
  }

  // ---------------------------------------------------------------------------
  // Card-on-file — saves a payment nonce to the customer vault so Square can
  // charge the card on future subscription renewals without a new nonce.
  // ---------------------------------------------------------------------------

  /// Tokenise and save a card to a Square Customer's vault.
  ///
  /// [sourceId]   — one-time nonce from the Web Payments SDK (cnon:...)
  /// [customerId] — Square customer ID (created at signup)
  ///
  /// Returns the saved card ID (e.g. "ccof:uA...") which can be passed as
  /// the [sourceId] for future charges or as the subscription card source.
  Future<String> createCard({
    required String sourceId,
    required String customerId,
    String? cardholderName,
    SquareBillingAddress? billingAddress,
  }) async {
    final body = {
      'idempotency_key': _uuid.v4(),
      'source_id': sourceId,
      'card': {
        'customer_id': customerId,
        if (cardholderName != null) 'cardholder_name': cardholderName,
        if (billingAddress != null) 'billing_address': billingAddress.toJson(),
      },
    };

    final resp = await _client.post(
      Uri.parse('$_baseUrl/cards'),
      headers: _headers,
      body: jsonEncode(body),
    );

    if (resp.statusCode != 200) {
      stderr.writeln('[Square] POST $_baseUrl/cards → ${resp.statusCode}  body: ${resp.body}');
      if (resp.body.isEmpty) {
        throw SquareException(
          resp.statusCode,
          resp.statusCode == 404
              ? 'Square API endpoint not found — check SQUARE_API_URL env var '
                '(current base: $_baseUrl).'
              : 'Card could not be saved — the payment nonce may have already been used. '
                'Please re-enter your card details.',
        );
      }
      final json   = jsonDecode(resp.body) as Map<String, dynamic>;
      final errors = json['errors'] as List? ?? [];
      final detail = errors.isNotEmpty
          ? (errors.first as Map)['detail'] as String? ?? 'Unknown error'
          : 'Square card error ${resp.statusCode}';
      throw SquareException(resp.statusCode, detail);
    }

    final json = jsonDecode(resp.body) as Map<String, dynamic>;

    return (json['card'] as Map<String, dynamic>)['id'] as String;
  }

  // ---------------------------------------------------------------------------
  // Subscriptions API — Square handles recurring billing automatically.
  // ---------------------------------------------------------------------------

  /// Create a recurring subscription against a Square plan variation.
  ///
  /// [planVariationId] — the SUBSCRIPTION_PLAN_VARIATION catalog ID
  /// [customerId]      — Square customer ID
  /// [cardId]          — saved card ID from [createCard]
  /// [locationId]      — Square location ID
  /// [startDate]       — ISO-8601 date string; defaults to today
  ///
  /// Returns a [SquareSubscriptionResult] containing the Square subscription ID.
  Future<SquareSubscriptionResult> createSubscription({
    required String planVariationId,
    required String customerId,
    required String cardId,
    required String locationId,
    String? startDate,
  }) async {
    final today = DateTime.now().toUtc();
    final start = startDate ??
        '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

    final body = {
      'idempotency_key':    _uuid.v4(),
      'location_id':        locationId,
      'plan_variation_id':  planVariationId,
      'customer_id':        customerId,
      'start_date':         start,
      'card_id':            cardId,
    };

    final resp = await _client.post(
      Uri.parse('$_baseUrl/subscriptions'),
      headers: _headers,
      body: jsonEncode(body),
    );

    final json = jsonDecode(resp.body) as Map<String, dynamic>;
    if (resp.statusCode != 200) {
      final errors = json['errors'] as List? ?? [];
      final detail = errors.isNotEmpty
          ? (errors.first as Map)['detail'] as String? ?? 'Unknown error'
          : 'Square API error ${resp.statusCode}';
      throw SquareException(resp.statusCode, detail);
    }

    final sub = json['subscription'] as Map<String, dynamic>;
    return SquareSubscriptionResult(
      id:                 sub['id'] as String,
      status:             sub['status'] as String,
      chargedThroughDate: sub['charged_through_date'] as String?,
    );
  }

  /// Cancel a Square subscription immediately.
  Future<void> cancelSubscription(String subscriptionId) async {
    final resp = await _client.post(
      Uri.parse('$_baseUrl/subscriptions/$subscriptionId/cancel'),
      headers: _headers,
      body: jsonEncode({}),
    );

    if (resp.statusCode != 200) {
      final json  = jsonDecode(resp.body) as Map<String, dynamic>;
      final errors = json['errors'] as List? ?? [];
      final detail = errors.isNotEmpty
          ? (errors.first as Map)['detail'] as String? ?? 'Unknown error'
          : 'Square API error ${resp.statusCode}';
      throw SquareException(resp.statusCode, detail);
    }
  }

  // ---------------------------------------------------------------------------

  /// Retrieve a payment by its Square payment ID.
  Future<SquarePaymentResult> getPayment(String paymentId) async {
    final resp = await _client.get(
      Uri.parse('$_baseUrl/payments/$paymentId'),
      headers: _headers,
    );
    final json = jsonDecode(resp.body) as Map<String, dynamic>;
    if (resp.statusCode != 200) {
      throw SquareException(resp.statusCode, 'Payment not found');
    }
    final payment = json['payment'] as Map<String, dynamic>;
    return SquarePaymentResult(
      id: payment['id'] as String,
      status: payment['status'] as String,
      amountCents: (payment['amount_money']['amount'] as int),
      receiptUrl: payment['receipt_url'] as String?,
    );
  }

  void close() => _client.close();
}

class SquarePaymentResult {
  SquarePaymentResult({
    required this.id,
    required this.status,
    required this.amountCents,
    this.receiptUrl,
  });

  final String id;
  final String status;
  final int amountCents;
  final String? receiptUrl;

  Map<String, dynamic> toJson() => {
        'id': id,
        'status': status,
        'amount_cents': amountCents,
        if (receiptUrl != null) 'receipt_url': receiptUrl,
      };
}

class SquareSubscriptionResult {
  SquareSubscriptionResult({
    required this.id,
    required this.status,
    this.chargedThroughDate,
  });

  final String  id;
  final String  status;
  /// ISO-8601 date string (e.g. "2026-06-09") — the date the subscription is
  /// paid through. Null until the first invoice is processed.
  final String? chargedThroughDate;
}

/// Billing address forwarded to Square's Payments API for AVS verification.
/// Square field names follow their v2 address schema.
class SquareBillingAddress {
  SquareBillingAddress({
    this.businessName,
    required this.addressLine1,
    this.addressLine2,
    required this.city,
    required this.state,
    required this.postalCode,
    this.country = 'US',
  });

  final String? businessName;
  final String  addressLine1;
  final String? addressLine2;
  final String  city;
  final String  state;
  final String  postalCode;
  final String  country;

  Map<String, dynamic> toJson() => {
        'address_line_1':                 addressLine1,
        if (addressLine2 != null)
          'address_line_2':               addressLine2,
        'locality':                       city,
        'administrative_district_level_1': state,
        'postal_code':                    postalCode,
        'country':                        country,
      };
}

class SquareException implements Exception {
  SquareException(this.statusCode, this.detail);
  final int statusCode;
  final String detail;

  @override
  String toString() => 'SquareException($statusCode): $detail';
}
