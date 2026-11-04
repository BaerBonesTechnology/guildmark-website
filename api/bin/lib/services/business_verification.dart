import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:guildmark_api/firebase/firestore.dart';

class SellerVerificationRequired implements Exception {
  const SellerVerificationRequired();
  static const code = 'SELLER_VERIFICATION_REQUIRED';
  static const message =
      'The seller must complete business verification before publishing listings or making sales.';
}

/// Optional business badge review. Only a staff decision may grant approval.
/// Future providers can supply evidence without changing badge eligibility.
class BusinessVerification {
  BusinessVerification(this.db);
  final TablesDB db;
  static const table = 'business_verifications';
  static const events = 'business_verification_events';
  static const challenges = 'business_email_challenges';
  static const editable = {'unsubmitted', 'needs_information'};

  /// Read eligibility in the same transaction that publishes or starts a sale.
  /// Draft inventory, buying and fulfillment of existing orders remain usable.
  static Future<void> requireSeller(
    FirestoreTransaction transaction,
    String company,
  ) async {
    if (status(await transaction.get(table, company)) != 'approved') {
      throw const SellerVerificationRequired();
    }
  }

  Future<Row?> record(String company) async {
    try {
      return await db.getRow(databaseId: '', tableId: table, rowId: company);
    } on DatastoreException catch (error) {
      if (error.code == 404) return null;
      rethrow;
    }
  }

  static String status(Row? record) =>
      record?.data['status'] as String? ?? 'unsubmitted';
  static bool canReview(String audience, String role) =>
      audience == 'staff' && {'superadmin', 'compliance'}.contains(role);

  static Map<String, String> details(Map<String, dynamic> body) {
    String field(String name, int maximum) {
      final value = body[name];
      if (value is! String || value.trim().isEmpty || value.length > maximum) {
        throw FormatException('Complete $name (maximum $maximum characters).');
      }
      return value.trim();
    }

    final website = field('website', 500);
    final uri = Uri.tryParse(website);
    if (uri == null ||
        uri.scheme != 'https' ||
        uri.host.isEmpty ||
        uri.userInfo.isNotEmpty) {
      throw const FormatException(
        'Enter a full HTTPS business website address.',
      );
    }
    return {
      'legal_name': field('legal_name', 200),
      'registration_country': field('registration_country', 100),
      'registration_number': field('registration_number', 100),
      'website': website,
      'representative_role': field('representative_role', 150),
    };
  }

  Future<Map<String, dynamic>> view(String company, String user) async {
    final application = await record(company);
    final email = await emailRecord(user);
    return {
      ...?application?.data,
      'id': company,
      'status': status(application),
      'email_verified': email?.data['verified_at'] != null,
      // Reviewer-only evidence is never returned to the applicant.
    }..remove('internal_evidence');
  }

  Future<Row?> emailRecord(String user) async {
    try {
      return await db.getRow(databaseId: '', tableId: challenges, rowId: user);
    } on DatastoreException catch (error) {
      if (error.code == 404) return null;
      rethrow;
    }
  }

  static String hash(String code) =>
      sha256.convert(utf8.encode(code)).toString();

  /// Persist before sending; failures never verify the address. One challenge
  /// per minute, five attempts, ten-minute expiry; confirmation consumes it.
  Future<String> issueCode(String user, String email) async {
    final code = (Random.secure().nextInt(90000000) + 10000000).toString();
    final now = DateTime.now().toUtc();
    await db.transaction((transaction) async {
      final previous = await transaction.get(challenges, user);
      final sent = DateTime.tryParse(
        previous?.data['sent_at'] as String? ?? '',
      );
      if (sent != null && now.difference(sent) < const Duration(minutes: 1)) {
        throw const FormatException(
          'Wait one minute before requesting another code.',
        );
      }
      final data = <String, dynamic>{
        'email': email,
        'code_hash': hash('$user:$email:$code'),
        'sent_at': now.toIso8601String(),
        'expires_at': now.add(const Duration(minutes: 10)).toIso8601String(),
        'attempts': 0,
        'verified_at': null,
      };
      if (previous == null) {
        transaction.create(challenges, user, data);
      } else {
        transaction.update(challenges, user, data);
      }
    });
    return code;
  }

  Future<bool> confirmCode(String user, String email, String code) =>
      db.transaction((transaction) async {
        final challenge = await transaction.get(challenges, user);
        if (challenge == null ||
            challenge.data['email'] != email ||
            challenge.data['verified_at'] != null)
          return false;
        final data = challenge.data;
        final attempts = data['attempts'] as int? ?? 0;
        final expiry = DateTime.tryParse(data['expires_at'] as String? ?? '');
        if (attempts >= 5 ||
            expiry == null ||
            !expiry.isAfter(DateTime.now().toUtc()))
          return false;
        final matches = data['code_hash'] == hash('$user:$email:$code');
        transaction.update(challenges, user, {
          'attempts': attempts + 1,
          if (matches) 'verified_at': DateTime.now().toUtc().toIso8601String(),
          if (matches) 'code_hash': null,
        });
        return matches;
      });

  Future<void> submit(
    String company,
    String user,
    String email,
    Map<String, dynamic> body,
  ) async {
    final fields = details(body);
    await db.transaction((transaction) async {
      final previous = await transaction.get(table, company);
      final challenge = await transaction.get(challenges, user);
      if (!editable.contains(status(previous)))
        throw const FormatException(
          'This application cannot be edited in its current state.',
        );
      if (challenge?.data['verified_at'] == null ||
          challenge?.data['email'] != email) {
        throw const FormatException(
          'Confirm your work email before submitting.',
        );
      }
      final revision = (previous?.data['revision'] as int? ?? 0) + 1;
      final data = <String, dynamic>{
        ...fields,
        'company_id': company,
        'applicant_id': user,
        'email': email,
        'email_verified_at': challenge!.data['verified_at'],
        'status': 'pending',
        'method': 'manual',
        'revision': revision,
        'submitted_at': DateTime.now().toUtc().toIso8601String(),
        'reason': null,
        'reviewed_by': null,
        'reviewed_at': null,
      };
      if (previous == null) {
        transaction.create(table, company, data);
      } else {
        transaction.update(table, company, data);
      }
      transaction.create(events, ID.unique(), {
        ...data,
        'actor_id': user,
        'action': 'submitted',
      });
    });
  }

  Future<void> review(
    String company,
    String reviewer,
    Map<String, dynamic> body,
  ) async {
    final decision = body['decision'];
    final reason = body['reason'];
    if (!{'approved', 'needs_information', 'rejected'}.contains(decision) ||
        reason is! String ||
        reason.trim().isEmpty ||
        reason.length > 2000) {
      throw const FormatException(
        'Choose a decision and provide a reason (up to 2,000 characters).',
      );
    }
    final evidence = body['internal_evidence'];
    if (decision == 'approved' &&
        (body['registry_checked'] != true ||
            body['authority_checked'] != true ||
            evidence is! String ||
            evidence.trim().isEmpty ||
            evidence.length > 4000)) {
      throw const FormatException(
        'Approval requires registry and representative checks, with evidence recorded.',
      );
    }
    await db.transaction((transaction) async {
      final previous = await transaction.get(table, company);
      if (status(previous) != 'pending' ||
          previous?.data['revision'] != body['revision']) {
        throw const FormatException(
          'This application changed. Refresh before reviewing.',
        );
      }
      if (previous!.data['applicant_id'] == reviewer)
        throw const FormatException('You cannot review your own application.');
      final data = <String, dynamic>{
        'status': decision,
        'reason': reason.trim(),
        'reviewed_by': reviewer,
        'reviewed_at': DateTime.now().toUtc().toIso8601String(),
        'revision': (previous.data['revision'] as int) + 1,
        'internal_evidence': evidence is String ? evidence.trim() : '',
        'registry_checked': body['registry_checked'] == true,
        'authority_checked': body['authority_checked'] == true,
      };
      transaction.update(table, company, data);
      transaction.create(events, ID.unique(), {
        ...previous.data,
        ...data,
        'actor_id': reviewer,
        'action': decision,
      });
    });
  }
}
