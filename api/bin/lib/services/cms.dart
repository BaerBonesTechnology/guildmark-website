import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';

class CmsFailure implements Exception {
  CmsFailure(this.status, this.message);
  final int status;
  final String message;
}

class Cms {
  Cms(this.store);
  final FirebaseService store;
  static bool canEdit(String role) =>
      {'admin', 'superadmin', 'marketing'}.contains(role);
  static bool canPublish(String role) => {'admin', 'superadmin'}.contains(role);
  static bool validId(String id) =>
      RegExp(r'^[a-zA-Z0-9_-]{1,128}$').hasMatch(id);
  Future<Row> authorize(
    AuthPrincipal? principal, {
    bool publish = false,
  }) async {
    if (principal?.audience != 'staff')
      throw CmsFailure(403, 'Staff access required.');
    final employee = await store.tablesDB.getRow(
      databaseId: '',
      tableId: 'guildmark_employees',
      rowId: principal!.userId,
    );
    checkEmployee(employee, publish: publish);
    return employee;
  }

  static void checkEmployee(Row? employee, {bool publish = false}) {
    final role = employee?.data['role'] as String? ?? '';
    if (employee?.data['is_active'] != true ||
        !(publish ? canPublish(role) : canEdit(role))) {
      throw CmsFailure(
        403,
        publish
            ? 'Publishing requires an administrator.'
            : 'Content editor access required.',
      );
    }
  }

  static Map<String, dynamic> fields(dynamic input) {
    if (input is! Map) throw CmsFailure(400, 'Article fields required.');
    final result = <String, dynamic>{};
    for (final entry in {
      'title': 160,
      'slug': 100,
      'excerpt': 320,
      'category': 60,
      'author': 100,
      'body': 100000,
      'seo_title': 160,
      'seo_description': 320,
      'cover_id': 128,
      'cover_alt': 300,
      'date': 10,
    }.entries) {
      final value = input[entry.key] ?? '';
      if (value is! String || value.length > entry.value)
        throw CmsFailure(
          400,
          'Invalid ${entry.key} (maximum ${entry.value} characters).',
        );
      result[entry.key] = value.trim();
    }
    final date = result['date'] as String;
    if (date.isNotEmpty &&
        (!RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(date) ||
            DateTime.tryParse(date)?.toIso8601String().substring(0, 10) !=
                date))
      throw CmsFailure(400, 'Use a valid publication date.');
    if ((result['title'] as String).isEmpty)
      throw CmsFailure(400, 'Give the article a title.');
    if (!RegExp(
      r'^[a-z0-9]+(?:-[a-z0-9]+)*$',
    ).hasMatch(result['slug'] as String))
      throw CmsFailure(
        400,
        'Use lowercase words separated by hyphens for the URL.',
      );
    return result;
  }

  Future<Map<String, dynamic>> mutate(
    String id,
    AuthPrincipal actor,
    Map<String, dynamic> body,
  ) async {
    if (!validId(id)) throw CmsFailure(400, 'Invalid article ID.');
    final action = body['action'];
    if (!{'create', 'save', 'publish', 'unpublish', 'restore'}.contains(action))
      throw CmsFailure(400, 'Unsupported content action.');
    final publishing = action == 'publish' || action == 'unpublish';
    if (actor.audience != 'staff')
      throw CmsFailure(403, 'Staff access required.');
    final expected = body['version'];
    if (expected is! int || expected < 0)
      throw CmsFailure(400, 'Article version required.');
    return store.tablesDB.transaction((tx) async {
      final employee = await tx.get('guildmark_employees', actor.userId);
      checkEmployee(employee, publish: publishing);
      final previous = await tx.get('cms_posts', id);
      if (action == 'create' && previous != null)
        throw CmsFailure(409, 'This draft already exists. Refresh the list.');
      if (action != 'create' && previous == null)
        throw CmsFailure(404, 'Article not found.');
      final currentVersion = previous?.data['version'] as int? ?? 0;
      if (expected != currentVersion)
        throw CmsFailure(
          409,
          'Someone changed this article. Reload before saving; your text is still in the editor.',
        );
      Map<String, dynamic> draft;
      if (action == 'create' || action == 'save') {
        draft = fields(body['draft']);
      } else if (action == 'restore') {
        final revision = body['revision'];
        if (revision is! int || revision < 1)
          throw CmsFailure(400, 'Choose a revision.');
        final old = await tx.get('cms_revisions', revisionId(id, revision));
        if (old == null || old.data['post_id'] != id)
          throw CmsFailure(404, 'Revision not found.');
        draft = fields(old.data['draft']);
      } else {
        draft = fields(previous!.data['draft']);
      }
      final slug = draft['slug'] as String;
      if (previous != null && (previous.data['draft'] as Map)['slug'] != slug)
        throw CmsFailure(
          400,
          'The article URL is permanent. Create a new article for a different URL.',
        );
      final slugRow = await tx.get('cms_slugs', slug);
      if (slugRow != null && slugRow.data['post_id'] != id)
        throw CmsFailure(409, 'That article URL is already reserved.');
      Row? cover;
      if ((draft['cover_id'] as String).isNotEmpty) {
        if (!validId(draft['cover_id'] as String))
          throw CmsFailure(400, 'Invalid cover image.');
        cover = await tx.get('cms_media', draft['cover_id'] as String);
        if (cover == null)
          throw CmsFailure(400, 'Cover image no longer exists.');
      }
      if (action == 'publish' &&
          ((draft['body'] as String).isEmpty ||
              (draft['excerpt'] as String).isEmpty ||
              (draft['author'] as String).isEmpty ||
              (draft['category'] as String).isEmpty))
        throw CmsFailure(
          400,
          'Add an excerpt, category, author and article body before publishing.',
        );
      if (action == 'publish' &&
          cover != null &&
          (draft['cover_alt'] as String).isEmpty)
        throw CmsFailure(400, 'Describe the cover image before publishing.');
      final now = DateTime.now().toUtc().toIso8601String();
      final version = currentVersion + 1;
      final published = action == 'unpublish'
          ? null
          : action == 'publish'
          ? {
              ...draft,
              'id': id,
              'cover_url': cover?.data['url'],
              'date': (draft['date'] as String).isNotEmpty
                  ? draft['date']
                  : now.substring(0, 10),
              'readTime':
                  '${((draft['body'] as String).split(RegExp(r'\s+')).length / 200).ceil().clamp(1, 999)} min',
            }
          : previous?.data['published'];
      final data = <String, dynamic>{
        'draft': draft,
        'version': version,
        'published': published,
        'published_visible': published != null,
        'published_revision': action == 'publish'
            ? version
            : action == 'unpublish'
            ? null
            : previous?.data['published_revision'],
        'updated_at': now,
        'updated_by': actor.userId,
      };
      if (slugRow == null) tx.create('cms_slugs', slug, {'post_id': id});
      if (previous == null) {
        tx.create('cms_posts', id, data);
      } else {
        tx.update('cms_posts', id, data);
      }
      tx.create('cms_revisions', revisionId(id, version), {
        'post_id': id,
        'version': version,
        'draft': draft,
        'action': action,
        'source_revision': action == 'restore' ? body['revision'] : null,
        'actor_id': actor.userId,
        'actor_name': employee!.data['full_name'],
        'created_at': now,
      });
      return {'id': id, ...data};
    });
  }

  static String revisionId(String id, int version) =>
      '${id}_${version.toString().padLeft(10, '0')}';
}
