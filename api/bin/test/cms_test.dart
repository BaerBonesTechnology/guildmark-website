import 'dart:convert';
import 'dart:io';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/cms.dart';
import 'package:http/http.dart' as http;
import 'package:test/test.dart';
import '../routes/content/blog/[slug].dart' as article;
import '../routes/admin/content/_middleware.dart' as guard;
import '../routes/admin/content/media/index.dart' as media;
import '../routes/admin/content/posts/[id]/index.dart' as postRoute;
import '../routes/admin/content/posts/index.dart' as postsRoute;

void main() {
  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  group(
    'CMS publication boundary',
    () {
      late FirebaseService db;
      late Cms cms;
      final actor = AuthPrincipal(
        userId: 'staff',
        companyId: 'devdash',
        role: 'superadmin',
        audience: 'staff',
      );
      const draft = {
        'title': 'A useful article',
        'slug': 'useful-article',
        'excerpt': 'Useful advice',
        'category': 'Guides',
        'author': 'QA Editor',
        'body': '## Original\n\nOriginal article body.',
      };
      setUp(() async {
        db = FirebaseService(
          projectId: 'demo-cms-${ID.unique()}',
          emulatorHost: host,
        );
        cms = Cms(db);
        await db.tablesDB.createRow(
          databaseId: '',
          tableId: 'guildmark_employees',
          rowId: 'staff',
          data: {
            'role': 'superadmin',
            'is_active': true,
            'full_name': 'QA Editor',
          },
        );
      });
      tearDown(() => db.close());
      Future<Map<String, dynamic>> mutate(
        String action,
        int version, {
        Map<String, dynamic>? fields,
        int? revision,
        String id = 'post',
      }) => cms.mutate(id, actor, {
        'action': action,
        'version': version,
        if (fields != null) 'draft': fields,
        if (revision != null) 'revision': revision,
      });
      Future<http.Response> request(
        Handler handler, {
        String method = 'GET',
        String path = '/test',
        Object? body,
        AuthPrincipal? principal,
      }) async {
        final server = await serve(
          handler
              .use(provider<FirebaseService?>((_) => db))
              .use(provider<AuthPrincipal?>((_) => principal ?? actor)),
          InternetAddress.loopbackIPv4,
          0,
        );
        try {
          final req = http.Request(
            method,
            Uri.parse('http://127.0.0.1:${server.port}$path'),
          );
          if (body != null) {
            req.headers['Content-Type'] = 'application/json';
            req.body = jsonEncode(body);
          }
          return await http.Response.fromStream(await http.Client().send(req));
        } finally {
          await server.close(force: true);
        }
      }

      test(
        'mounted editor middleware preserves dynamic post routing',
        () async {
          await mutate('create', 0, fields: draft);
          final list = Router()..all('/', postsRoute.onRequest);
          final router = Router()
            ..mount('/admin/content/posts', guard.middleware(list.call))
            ..mount('/admin/content/posts/<id>', (context, String id) {
              final detail = Router()
                ..all('/', (context) => postRoute.onRequest(context, id));
              return guard.middleware(detail.call)(context);
            });
          final response = await request(
            router.call,
            path: '/admin/content/posts/post',
          );
          expect(response.statusCode, 200);
          expect(jsonDecode(response.body)['id'], 'post');
          expect(response.headers['cache-control'], 'no-store');
          final missing = await request(
            router.call,
            path: '/admin/content/posts/missing',
          );
          expect(missing.statusCode, 404);
        },
      );
      test(
        'draft edits never replace published snapshots; unpublish hides public detail',
        () async {
          await mutate('create', 0, fields: draft);
          expect(
            (await request(
              (c) => article.onRequest(c, 'useful-article'),
            )).statusCode,
            404,
          );
          await mutate('publish', 1);
          await mutate(
            'save',
            2,
            fields: {...draft, 'body': 'Private replacement'},
          );
          final public = await request(
            (c) => article.onRequest(c, 'useful-article'),
          );
          expect(public.statusCode, 200);
          expect(jsonDecode(public.body)['body'], draft['body']);
          expect(public.body, isNot(contains('Private replacement')));
          await mutate('unpublish', 3);
          expect(
            (await request(
              (c) => article.onRequest(c, 'useful-article'),
            )).statusCode,
            404,
          );
          final history = await db.tablesDB.listRows(
            databaseId: '',
            tableId: 'cms_revisions',
          );
          expect(history.rows.length, 4);
        },
      );
      test(
        'restore appends a revision, leaves live content unchanged and requires explicit publish',
        () async {
          await mutate('create', 0, fields: draft);
          await mutate('publish', 1);
          await mutate('save', 2, fields: {...draft, 'body': 'New live text'});
          await mutate('publish', 3);
          final restored = await mutate('restore', 4, revision: 1);
          expect(restored['version'], 5);
          expect((restored['draft'] as Map)['body'], draft['body']);
          expect((restored['published'] as Map)['body'], 'New live text');
          await mutate('publish', 5);
          final public = await request(
            (c) => article.onRequest(c, 'useful-article'),
          );
          expect(jsonDecode(public.body)['body'], draft['body']);
          final original = await db.tablesDB.getRow(
            databaseId: '',
            tableId: 'cms_revisions',
            rowId: Cms.revisionId('post', 1),
          );
          expect(original.data['draft'], containsPair('body', draft['body']));
        },
      );
      test(
        'concurrent editors cannot overwrite each other and a slug cannot be stolen',
        () async {
          await mutate('create', 0, fields: draft);
          final results = await Future.wait([
            for (final title in ['First', 'Second'])
              mutate(
                'save',
                1,
                fields: {...draft, 'title': title},
              ).then<Object>((p) => p).catchError((Object e) => e),
          ]);
          expect(results.whereType<Map>().length, 1);
          expect(results.whereType<CmsFailure>().single.status, 409);
          await expectLater(
            mutate('create', 0, fields: draft, id: 'other'),
            throwsA(isA<CmsFailure>().having((e) => e.status, 'status', 409)),
          );
          await expectLater(
            mutate('save', 2, fields: {...draft, 'slug': 'changed-url'}),
            throwsA(isA<CmsFailure>()),
          );
        },
      );
      test(
        'marketing can save and restore drafts but cannot publish or unpublish',
        () async {
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'guildmark_employees',
            rowId: 'staff',
            data: {'role': 'marketing'},
          );
          await mutate('create', 0, fields: draft);
          await mutate('save', 1, fields: {...draft, 'body': 'Editorial work'});
          await mutate('restore', 2, revision: 1);
          for (final action in ['publish', 'unpublish'])
            await expectLater(
              mutate(action, 3),
              throwsA(isA<CmsFailure>().having((e) => e.status, 'status', 403)),
            );
        },
      );
      test(
        'revoked staff and nonstaff claims cannot write; stale publisher role is ignored',
        () async {
          await mutate('create', 0, fields: draft);
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'guildmark_employees',
            rowId: 'staff',
            data: {'role': 'support'},
          );
          await expectLater(
            mutate('publish', 1),
            throwsA(isA<CmsFailure>().having((e) => e.status, 'status', 403)),
          );
          final customer = AuthPrincipal(
            userId: 'staff',
            companyId: 'devdash',
            role: 'superadmin',
            audience: 'customer',
          );
          await expectLater(
            cms.mutate('post', customer, {
              'action': 'save',
              'version': 1,
              'draft': draft,
            }),
            throwsA(isA<CmsFailure>()),
          );
          await db.tablesDB.updateRow(
            databaseId: '',
            tableId: 'guildmark_employees',
            rowId: 'staff',
            data: {'role': 'superadmin', 'is_active': false},
          );
          await expectLater(
            mutate('save', 1, fields: draft),
            throwsA(isA<CmsFailure>()),
          );
        },
      );
      test(
        'publication validates required metadata and cover description',
        () async {
          await mutate('create', 0, fields: {...draft, 'author': ''});
          await expectLater(
            mutate('publish', 1),
            throwsA(isA<CmsFailure>().having((e) => e.status, 'status', 400)),
          );
          await db.tablesDB.createRow(
            databaseId: '',
            tableId: 'cms_media',
            rowId: 'image',
            data: {'url': 'https://example.test/image.png'},
          );
          await mutate(
            'save',
            1,
            fields: {...draft, 'cover_id': 'image', 'cover_alt': ''},
          );
          await expectLater(mutate('publish', 2), throwsA(isA<CmsFailure>()));
        },
      );
      test(
        'HTTP editor guard protects uploads and rejects SVG payloads',
        () async {
          final customer = AuthPrincipal(
            userId: 'staff',
            companyId: 'devdash',
            role: 'admin',
            audience: 'customer',
          );
          final denied = await request(
            guard.middleware(media.onRequest),
            method: 'POST',
            principal: customer,
            body: {},
          );
          expect(denied.statusCode, 403);
          final svg = await request(
            guard.middleware(media.onRequest),
            method: 'POST',
            body: {
              'name': 'unsafe.svg',
              'alt': 'A diagram',
              'base64': base64Encode(utf8.encode('<svg onload="alert(1)"/>')),
            },
          );
          expect(svg.statusCode, 400);
          final invalid = await request(
            guard.middleware(media.onRequest),
            method: 'POST',
            body: {'name': 'bad.png', 'alt': 'Image', 'base64': 'not base64'},
          );
          expect(invalid.statusCode, 400);
        },
      );
    },
    skip: host == null ? 'Requires Firestore emulator' : false,
  );
}
