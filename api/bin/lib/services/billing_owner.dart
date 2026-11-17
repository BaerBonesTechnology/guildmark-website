import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';

/// No customer membership/invite system exists yet. Legacy companies qualify
/// only when the caller is their sole persisted admin, never from a JWT role
/// alone. New company ownership can be recorded explicitly on the company.
Future<bool> isBillingOwner(FirebaseService service, AuthPrincipal auth) async {
  if (auth.audience != 'customer' || !{'admin', 'owner'}.contains(auth.role)) {
    return false;
  }
  final company = await service.tablesDB.getRow(
    databaseId: '',
    tableId: 'companies',
    rowId: auth.companyId,
  );
  final owner = company.data['billing_owner_user_id'];
  final user = await service.tablesDB.getRow(
    databaseId: '',
    tableId: 'users',
    rowId: auth.userId,
  );
  if (user.data['company_id'] != auth.companyId ||
      !{'admin', 'owner'}.contains(user.data['role']) ||
      user.data['disabled'] == true) {
    return false;
  }
  if (owner != null) return owner == auth.userId;
  final admins = await service.tablesDB.listRows(
    databaseId: '',
    tableId: 'users',
    queries: [Query.equal('company_id', auth.companyId), Query.limit(100)],
  );
  final eligible = admins.rows
      .where(
        (r) =>
            {'admin', 'owner'}.contains(r.data['role']) &&
            r.data['disabled'] != true,
      )
      .toList();
  return eligible.length == 1 && eligible.single.$id == auth.userId;
}
