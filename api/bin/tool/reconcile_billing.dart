// Scheduled recovery uses the same provider verification as checkout/webhooks.
import 'dart:io';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/recurring_billing.dart';
import 'package:guildmark_api/services/square_service.dart';

Future<void> main() async {
  final env = Platform.environment;
  if (env['FIREBASE_PROJECT_ID'] != 'guildmark-dev' ||
      env['SQUARE_ENVIRONMENT'] != 'sandbox' ||
      env['SQUARE_RECURRING_ENABLED'] != 'true')
    throw StateError('Dev sandbox required');
  final db = FirebaseService(projectId: 'guildmark-dev');
  final square = SquareService(
    accessToken: env['SQUARE_ACCESS_TOKEN']!,
    locationId: env['SQUARE_LOCATION_ID']!,
    environment: 'sandbox',
    apiUrl: 'https://connect.squareupsandbox.com',
  );
  final billing = RecurringBilling(db, square);
  var checked = 0, failed = 0;
  String? cursor;
  try {
    while (true) {
      final page = await db.tablesDB.listRows(
        databaseId: '',
        tableId: 'recurring_billing_companies',
        queries: [
          Query.limit(100),
          if (cursor != null) Query.cursorAfter(cursor),
        ],
      );
      for (final row in page.rows) {
        if (row.data['active_intent'] == null) continue;
        try {
          await billing.company(row.$id);
          checked++;
        } catch (_) {
          failed++;
        }
      }
      if (page.rows.length < 100) break;
      cursor = page.rows.last.$id;
    }
    stdout.writeln('Billing reconciliation: checked=$checked failed=$failed');
    if (failed > 0) exitCode = 1;
  } finally {
    square.close();
    db.close();
  }
}
