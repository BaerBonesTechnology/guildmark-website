/// Square Web Payments service.
///
/// Wraps the Square Payments API using the `http` package since there is no
/// official Square Dart SDK. All amounts are in the smallest currency unit
/// (cents for USD).
///
/// Docs: https://developer.squareup.com/reference/square/payments-api
library;

import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';

const _uuid = Uuid();

class SquareService {
  SquareService({
    required this.accessToken,
    required this.locationId,
    required String environment,
  }) : _baseUrl = environment == 'production'
            ? 'https://connect.squareup.com/v2'
            : 'https://connect.squareupsandbox.com/v2',
       _client = http.Client();

  final String accessToken;
  final String locationId;
  final String _baseUrl;
  final http.Client _client;

  Map<String, String> get _headers => {
        'Authorization': 'Bearer $accessToken',
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
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
      if (note != null) 'note': note,
      if (referenceId != null) 'reference_id': referenceId,
    };

    final resp = await _client.post(
      Uri.parse('$_baseUrl/payments'),
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

    final payment = json['payment'] as Map<String, dynamic>;
    return SquarePaymentResult(
      id: payment['id'] as String,
      status: payment['status'] as String,
      amountCents: (payment['amount_money']['amount'] as int),
      receiptUrl: payment['receipt_url'] as String?,
    );
  }

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

class SquareException implements Exception {
  SquareException(this.statusCode, this.detail);
  final int statusCode;
  final String detail;

  @override
  String toString() => 'SquareException($statusCode): $detail';
}
