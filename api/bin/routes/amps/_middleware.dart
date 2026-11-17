import 'package:dart_frog/dart_frog.dart';

import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/http_helpers.dart';
import 'package:guildmark_api/repos/firestore/subscription_repo.dart';
import 'package:guildmark_api/repos/firestore/amps_inventory_repo.dart';

Handler middleware(Handler handler) {
  return (context) async {
    final auth = context.read<AuthPrincipal?>();
    if (auth == null) return unauthorized();

    final aw = context.read<FirebaseService?>();
    if (aw == null) {
      return jsonError(503, 'DB_UNAVAILABLE', 'Datastore is not configured');
    }

    // Look up this company's subscription status.
    final sub = await SubscriptionRepo(aw).findByCompany(auth.companyId);

    final path = context.request.uri.path;
    final retainedAssetPath = RegExp(
      r'/amps/assets(?:/[^/]+)?$',
    ).hasMatch(path);
    final retentionRequest =
        retainedAssetPath &&
        {
          HttpMethod.get,
          HttpMethod.patch,
          HttpMethod.delete,
        }.contains(context.request.method);
    var canRetain = sub != null && sub.plan != 'free';
    if (sub != null && !canRetain && retentionRequest) {
      final row = await aw.tablesDB.getRow(
        databaseId: '',
        tableId: 'subscriptions',
        rowId: sub.id,
      );
      canRetain = row.data['amps_ever_paid'] == true;
    }
    if (retentionRequest && canRetain) return handler(context);
    if (!activePaid(sub)) {
      return jsonError(
        403,
        'SUBSCRIPTION_REQUIRED',
        'An active AMPS plan is required for this action.',
      );
    }

    return handler(context);
  };
}
