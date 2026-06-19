import 'package:dart_appwrite/dart_appwrite.dart';

import 'package:guildmark_api/config.dart';

/// Thin wrapper around the Appwrite server SDK.
///
/// Appwrite is optional and degrades gracefully (mirrors the MlClient pattern):
/// the API boots even before an Appwrite project + API key exist. Routes that
/// need Appwrite read a nullable `AppwriteService?` from the request context
/// and return 503 when it is null.
class AppwriteService {
  AppwriteService({
    required this.endpoint,
    required this.projectId,
    required this.apiKey,
  }) : client = Client()
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);

  final String endpoint;
  final String projectId;
  final String apiKey;

  /// Shared, pre-authenticated server client.
  final Client client;

  // Lazily-constructed service handles. Construct per use — they are cheap
  // value wrappers around [client].
  Databases get databases => Databases(client);
  Users get users => Users(client);
  Storage get storage => Storage(client);
  Account get account => Account(client);

  /// Builds a service from config, or returns null when Appwrite is not yet
  /// configured (PROJECT_ID and API_KEY both required).
  static AppwriteService? fromConfig(AppConfig cfg) {
    final projectId = cfg.appwriteProjectId;
    final apiKey = cfg.appwriteApiKey;
    if (projectId == null || apiKey == null) return null;
    return AppwriteService(
      endpoint: cfg.appwriteEndpoint,
      projectId: projectId,
      apiKey: apiKey,
    );
  }
}
