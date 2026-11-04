import 'dart:convert';
import 'dart:io';
import 'package:test/test.dart';

void main() {
  test('cloud-only queries have deployable ordered indexes', () {
    final manifest =
        jsonDecode(
              File(
                '../../deployment/firebase/firestore.indexes.json',
              ).readAsStringSync(),
            )
            as Map;
    final indexes = (manifest['indexes'] as List).cast<Map>();
    for (final required in [
      ('valuation_snapshots', 'snapshot_date'),
      ('subscription_invoices', '_createdAt'),
    ]) {
      expect(
        indexes.any(
          (index) =>
              index['collectionGroup'] == required.$1 &&
              index['queryScope'] == 'COLLECTION' &&
              jsonEncode(index['fields']) ==
                  jsonEncode([
                    {'fieldPath': 'company_id', 'order': 'ASCENDING'},
                    {'fieldPath': required.$2, 'order': 'DESCENDING'},
                  ]),
        ),
        isTrue,
        reason:
            'Missing company + descending ${required.$2} index for ${required.$1}',
      );
    }
  });
}
