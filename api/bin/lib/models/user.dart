import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@Freezed()
abstract class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
    @Default([]) List<String> companyIds,
    @Default({}) Map<String, String> companyRoles,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

  factory User.fromRow(Map<String, dynamic> row) => User(
    id: row['id'] as String,
    name: row['name'] as String,
    email: row['email'] as String,
    companyIds:
        (row['company_ids'] as List<dynamic>?)
            ?.map((e) => e as String)
            .toList() ??
        [],
    companyRoles:
        (row['company_roles'] as Map<String, dynamic>?)?.map(
          (k, v) => MapEntry(k, v as String),
        ) ??
        {},
  );

  factory User.empty() => const User(
    id: '',
    name: '',
    email: '',
  );
}
