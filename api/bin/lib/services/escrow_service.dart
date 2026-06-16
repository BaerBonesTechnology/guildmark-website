/// Escrow.com API wrapper.
///
/// Docs: https://www.escrow.com/api/docs
///
/// Authentication: HTTP Basic auth — base64("email:api_key").
/// All failures are logged and return null/false; they never throw so that
/// an Escrow.com outage never breaks the order flow.
library;

import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

// ---------------------------------------------------------------------------
// Value objects
// ---------------------------------------------------------------------------

class EscrowTransaction {
  EscrowTransaction({
    required this.id,
    required this.status,
    this.paymentUrl,
  });

  final String id;
  final String status;

  /// URL the buyer visits to fund the escrow on Escrow.com.
  /// Falls back to the dashboard URL when the API doesn't return one.
  final String? paymentUrl;

  factory EscrowTransaction.fromJson(Map<String, dynamic> json, {bool sandbox = true}) {
    final id = json['id']?.toString() ?? '';
    final status = json['status'] as String? ?? '';

    // Try to extract a payment / checkout URL from the response.
    // Escrow.com returns a `payment_methods` array; we look for a direct URL
    // or fall back to the standard transaction dashboard URL.
    String? paymentUrl;
    final parties = json['parties'] as List?;
    if (parties != null) {
      for (final p in parties) {
        if (p is Map && p['role'] == 'buyer') {
          final methods = p['payment_methods'] as List?;
          if (methods != null && methods.isNotEmpty) {
            paymentUrl = (methods.first as Map?)?['url'] as String?;
          }
        }
      }
    }
    paymentUrl ??= sandbox
        ? 'https://www.escrow-sandbox.com/transactions/$id'
        : 'https://www.escrow.com/transactions/$id';

    return EscrowTransaction(id: id, status: status, paymentUrl: paymentUrl);
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class EscrowService {
  EscrowService({
    required this.apiKey,
    required this.accountEmail,
    bool sandbox = true,
    String? apiUrl,
  })  : _sandbox = sandbox,
        _baseUrl = apiUrl ??
            (sandbox
                ? 'https://api.escrow-sandbox.com/2017-09-01'
                : 'https://api.escrow.com/2017-09-01');

  final String apiKey;
  final String accountEmail;
  final bool _sandbox;
  final String _baseUrl;

  bool get isConfigured => apiKey.isNotEmpty && accountEmail.isNotEmpty;

  Map<String, String> get _headers => {
        HttpHeaders.authorizationHeader:
            'Basic ${base64Encode(utf8.encode('$accountEmail:$apiKey'))}',
        HttpHeaders.contentTypeHeader: 'application/json',
      };

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  /// Create a new escrow transaction between [buyerEmail] and [sellerEmail].
  ///
  /// Returns the created transaction (with a payment URL for the buyer) or
  /// null if the API call fails.
  Future<EscrowTransaction?> createTransaction({
    required String buyerEmail,
    required String sellerEmail,
    required double amount,
    required String description,
    String currency = 'usd',
    int inspectionPeriodDays = 2,
  }) async {
    if (!isConfigured) {
      stderr.writeln('[escrow] not configured — skipping createTransaction');
      return null;
    }

    final inspectionSeconds = inspectionPeriodDays * 24 * 3600;

    final body = jsonEncode({
      'currency': currency,
      'description': description,
      'items': [
        {
          'title': description,
          'description': description,
          'type': 'general_merchandise',
          'quantity': 1,
          'schedule': [
            {
              'amount': amount,
              'payer_customer': buyerEmail,
              'beneficiary_customer': sellerEmail,
            }
          ],
          'inspection_period': inspectionSeconds,
          'shipping_type': 'cargo',
        }
      ],
      'parties': [
        {'role': 'buyer', 'customer': buyerEmail},
        {'role': 'seller', 'customer': sellerEmail},
      ],
    });

    try {
      final resp = await http
          .post(Uri.parse('$_baseUrl/transaction'), headers: _headers, body: body)
          .timeout(const Duration(seconds: 15));

      if (resp.statusCode != 201 && resp.statusCode != 200) {
        stderr.writeln(
          '[escrow] createTransaction ${resp.statusCode}: ${resp.body}',
        );
        return null;
      }

      final json = jsonDecode(resp.body) as Map<String, dynamic>;
      stdout.writeln('[escrow] created transaction ${json['id']}');
      return EscrowTransaction.fromJson(json, sandbox: _sandbox);
    } catch (e) {
      stderr.writeln('[escrow] createTransaction error: $e');
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /// Mark items as received by the buyer.
  /// This starts the inspection period — after it expires, funds release.
  Future<bool> markReceived(String transactionId) =>
      _action(transactionId, 'receive');

  /// Buyer explicitly accepts delivery — releases funds to seller immediately.
  Future<bool> acceptDelivery(String transactionId) =>
      _action(transactionId, 'accept');

  /// Raise a dispute on a transaction.
  Future<bool> raiseDispute(String transactionId) =>
      _action(transactionId, 'raise_dispute');

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  /// Fetch the latest transaction state from Escrow.com.
  Future<Map<String, dynamic>?> getTransaction(String transactionId) async {
    if (!isConfigured) return null;
    try {
      final resp = await http
          .get(Uri.parse('$_baseUrl/transaction/$transactionId'), headers: _headers)
          .timeout(const Duration(seconds: 10));
      if (resp.statusCode != 200) return null;
      return jsonDecode(resp.body) as Map<String, dynamic>;
    } catch (e) {
      stderr.writeln('[escrow] getTransaction error: $e');
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  Future<bool> _action(String transactionId, String action) async {
    if (!isConfigured) {
      stderr.writeln('[escrow] not configured — skipping $action');
      return false;
    }
    try {
      final resp = await http
          .patch(
            Uri.parse('$_baseUrl/transaction/$transactionId/action/$action'),
            headers: _headers,
            body: jsonEncode({'action': action}),
          )
          .timeout(const Duration(seconds: 10));

      if (resp.statusCode >= 200 && resp.statusCode < 300) {
        stdout.writeln('[escrow] $action on $transactionId OK');
        return true;
      }
      stderr.writeln('[escrow] $action ${resp.statusCode}: ${resp.body}');
      return false;
    } catch (e) {
      stderr.writeln('[escrow] $action error: $e');
      return false;
    }
  }
}
