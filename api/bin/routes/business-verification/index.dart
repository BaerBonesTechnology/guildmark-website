import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/services/business_verification.dart';
import 'package:guildmark_api/services/email_service.dart';

Future<Response> onRequest(RequestContext context) async {
  final principal = context.read<AuthPrincipal?>();
  if (principal == null) return unauthorized();
  if (principal.audience != 'customer') return forbidden();
  final store = context.read<FirebaseService?>();
  if (store == null)
    return jsonError(503, 'DB_UNAVAILABLE', 'Datastore unavailable');
  final service = BusinessVerification(store.tablesDB);
  if (context.request.method == HttpMethod.get) {
    return Response.json(
      body: await service.view(principal.companyId, principal.userId),
      headers: {'Cache-Control': 'no-store'},
    );
  }
  if (context.request.method != HttpMethod.post)
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'GET or POST only');
  try {
    final body = await context.request.json();
    if (body is! Map<String, dynamic>)
      return badRequest('JSON object required');
    final user = await store.tablesDB.getRow(
      databaseId: '',
      tableId: 'users',
      rowId: principal.userId,
    );
    final email = user.data['email'] as String;
    switch (body['action']) {
      case 'send_code':
        final code = await service.issueCode(principal.userId, email);
        final sent = await context.read<EmailService>().sendBusinessEmailCode(
          toEmail: email,
          code: code,
        );
        if (!sent)
          return jsonError(
            503,
            'EMAIL_UNAVAILABLE',
            'Email could not be sent. Wait a minute and try again.',
          );
      case 'confirm_code':
        final code = body['code'];
        if (code is! String ||
            !RegExp(r'^\d{8}$').hasMatch(code) ||
            !await service.confirmCode(principal.userId, email, code)) {
          return badRequest(
            'Invalid or expired code. Request a new code if needed.',
          );
        }
      case 'submit':
        await service.submit(
          principal.companyId,
          principal.userId,
          email,
          body,
        );
      default:
        return badRequest('Unknown action');
    }
    return Response.json(
      body: await service.view(principal.companyId, principal.userId),
      headers: {'Cache-Control': 'no-store'},
    );
  } on FormatException catch (error) {
    return badRequest(error.message);
  }
}
