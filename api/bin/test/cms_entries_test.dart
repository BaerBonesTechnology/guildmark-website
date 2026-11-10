import 'dart:convert';
import 'dart:io';
import 'package:dart_frog/dart_frog.dart';
import 'package:guildmark_api/context.dart';
import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/services/cms.dart';
import 'package:guildmark_api/services/cms_entries.dart';
import 'package:http/http.dart' as http;
import 'package:test/test.dart';
import '../routes/admin/content/_middleware.dart' as guard;
import '../routes/content/promotions/[placement].dart' as placements;

void main() {
  final host = Platform.environment['FIRESTORE_EMULATOR_HOST'];
  group(
    'CMS pages, FAQs and help',
    () {
      late FirebaseService db;
      final actor = AuthPrincipal(
        userId: 'editor',
        companyId: 'staff',
        role: 'superadmin',
        audience: 'staff',
      );
      setUp(() async {
        db = FirebaseService(
          projectId: 'demo-cms-entries-${ID.unique()}',
          emulatorHost: host,
        );
        await db.tablesDB.createRow(
          databaseId: '',
          tableId: 'guildmark_employees',
          rowId: actor.userId,
          data: {
            'role': 'superadmin',
            'is_active': true,
            'full_name': 'QA Content Editor',
          },
        );
      });
      tearDown(() => db.close());
      Map<String, dynamic> draft(
        String kind, {
        String body = 'Original answer',
      }) => {
        'title': 'Test $kind',
        if (kind == 'promotion') ...{
          'placement': 'marketplace-banner',
          'cta_label': 'Browse',
          'target_url': '/marketplace',
          'disclosure': 'announcement',
          'sponsor': '',
          'starts_at': '',
          'ends_at': '',
          'priority': '10',
        },
        'slug': 'same-url',
        'body': body,
        'excerpt': kind == 'help' || kind == 'blog' ? 'A useful summary' : '',
        'category': kind == 'help' || kind == 'blog' ? 'Guides' : '',
        'author': kind == 'blog' ? 'QA' : '',
        'date': '2026-01-01',
      };
      Future<Map<String, dynamic>> write(
        String kind,
        String action,
        int version, {
        Map<String, dynamic>? fields,
        int? revision,
        String id = 'entry',
      }) => Cms(db, kind: kind).mutate(id, actor, {
        'action': action,
        'version': version,
        if (fields != null) 'draft': fields,
        if (revision != null) 'revision': revision,
      });
      Future<http.Response> send(
        Handler handler, {
        String path = '/content',
        String method = 'GET',
        Map<String, dynamic>? body,
        AuthPrincipal? principal,
      }) async {
        final server = await serve(
          handler
              .use(provider<FirebaseService?>((_) => db))
              .use(provider<AuthPrincipal?>((_) => principal ?? actor)),
          InternetAddress.loopbackIPv4,
          0,
        );
        final client = http.Client();
        try {
          final request = http.Request(
            method,
            Uri.parse('http://127.0.0.1:${server.port}$path'),
          );
          if (body != null) {
            request.headers['Content-Type'] = 'application/json';
            request.body = jsonEncode(body);
          }
          return await http.Response.fromStream(await client.send(request));
        } finally {
          client.close();
          await server.close(force: true);
        }
      }

      for (final kind in ['page', 'faq', 'help', 'promotion']) {
        test(
          '$kind draft, publish, restore and unpublish preserve immutable history',
          () async {
            await write(kind, 'create', 0, fields: draft(kind));
            expect(
              (await send(
                (c) => publishedContent(c, kind, slug: 'same-url'),
              )).statusCode,
              404,
            );
            await write(kind, 'save', 1, fields: draft(kind));
            await write(kind, 'publish', 2);
            await write(
              kind,
              'save',
              3,
              fields: draft(kind, body: 'Private changed text'),
            );
            var live = await send(
              (c) => publishedContent(c, kind, slug: 'same-url'),
            );
            expect(
              kind == 'promotion'
                  ? (await db.tablesDB.getRow(
                      databaseId: '',
                      tableId: 'cms_promotions',
                      rowId: 'entry',
                    )).data['published']['body']
                  : jsonDecode(live.body)['body'],
              'Original answer',
            );
            expect(live.headers['cache-control'], 'no-store');
            await write(kind, 'publish', 4);
            await write(kind, 'restore', 5, revision: 2);
            live = await send(
              (c) => publishedContent(c, kind, slug: 'same-url'),
            );
            expect(
              kind == 'promotion'
                  ? (await db.tablesDB.getRow(
                      databaseId: '',
                      tableId: 'cms_promotions',
                      rowId: 'entry',
                    )).data['published']['body']
                  : jsonDecode(live.body)['body'],
              'Private changed text',
            );
            await write(kind, 'publish', 6);
            live = await send(
              (c) => publishedContent(c, kind, slug: 'same-url'),
            );
            expect(
              kind == 'promotion'
                  ? (await db.tablesDB.getRow(
                      databaseId: '',
                      tableId: 'cms_promotions',
                      rowId: 'entry',
                    )).data['published']['body']
                  : jsonDecode(live.body)['body'],
              'Original answer',
            );
            final list = await send((c) => publishedContent(c, kind));
            final entries = kind == 'promotion'
                ? [<String, dynamic>{}]
                : jsonDecode(list.body)['posts'] as List;
            if (kind == 'promotion') expect(list.statusCode, 404);
            expect(entries.length, 1);
            expect((entries.single as Map).containsKey('body'), kind == 'faq');
            await write(kind, 'unpublish', 7);
            expect(
              (await send(
                (c) => publishedContent(c, kind, slug: 'same-url'),
              )).statusCode,
              404,
            );
            final history = await db.tablesDB.listRows(
              databaseId: '',
              tableId: Cms(db, kind: kind).revisionsTable,
            );
            expect(history.rows.length, 8);
            final first = await db.tablesDB.getRow(
              databaseId: '',
              tableId: Cms(db, kind: kind).revisionsTable,
              rowId: Cms.revisionId('entry', 1),
            );
            expect((first.data['draft'] as Map)['body'], 'Original answer');
          },
        );
        test(
          '$kind editor permission and current employee authority are enforced',
          () async {
            await db.tablesDB.updateRow(
              databaseId: '',
              tableId: 'guildmark_employees',
              rowId: 'editor',
              data: {'role': 'marketing'},
            );
            await write(kind, 'create', 0, fields: draft(kind));
            for (final action in ['publish', 'unpublish'])
              await expectLater(
                write(kind, action, 1),
                throwsA(
                  isA<CmsFailure>().having((e) => e.status, 'status', 403),
                ),
              );
            await db.tablesDB.updateRow(
              databaseId: '',
              tableId: 'guildmark_employees',
              rowId: 'editor',
              data: {'is_active': false},
            );
            await expectLater(
              write(kind, 'save', 1, fields: draft(kind)),
              throwsA(isA<CmsFailure>().having((e) => e.status, 'status', 403)),
            );
          },
        );
        test(
          '$kind mounted nested routes keep detail and history reachable',
          () async {
            await write(kind, 'create', 0, fields: draft(kind));
            final list = Router()..all('/', (c) => contentList(c, kind));
            final router = Router()
              ..mount(
                '/admin/content/entries/$kind',
                guard.middleware(list.call),
              )
              ..mount('/admin/content/entries/$kind/<id>', (c, String id) {
                final routes = Router()
                  ..all('/revisions', (c) => contentRevisions(c, kind, id))
                  ..all('/', (c) => contentDetail(c, kind, id));
                return guard.middleware(routes.call)(c);
              });
            expect(
              (await send(
                router.call,
                path: '/admin/content/entries/$kind/entry',
              )).statusCode,
              200,
            );
            final history = await send(
              router.call,
              path: '/admin/content/entries/$kind/entry/revisions',
            );
            expect(history.statusCode, 200);
            expect((jsonDecode(history.body)['revisions'] as List).length, 1);
            final customer = AuthPrincipal(
              userId: 'editor',
              companyId: 'company',
              role: 'superadmin',
              audience: 'customer',
            );
            expect(
              (await send(
                router.call,
                path: '/admin/content/entries/$kind/entry',
                principal: customer,
              )).statusCode,
              403,
            );
          },
        );
      }
      test(
        'identical IDs and slugs are isolated across blog, page, FAQ and help',
        () async {
          for (final kind in ['blog', 'page', 'faq', 'help']) {
            await write(
              kind,
              'create',
              0,
              fields: draft(kind, body: 'Only $kind'),
            );
            await write(kind, 'publish', 1);
          }
          await write('page', 'unpublish', 2);
          for (final kind in ['faq', 'help']) {
            final live = await send(
              (c) => publishedContent(c, kind, slug: 'same-url'),
            );
            expect(
              kind == 'promotion'
                  ? (await db.tablesDB.getRow(
                      databaseId: '',
                      tableId: 'cms_promotions',
                      rowId: 'entry',
                    )).data['published']['body']
                  : jsonDecode(live.body)['body'],
              'Only $kind',
            );
          }
          final blog = await db.tablesDB.getRow(
            databaseId: '',
            tableId: 'cms_posts',
            rowId: 'entry',
          );
          expect((blog.data['published'] as Map)['body'], 'Only blog');
          await write(
            'help',
            'save',
            2,
            fields: draft('help', body: 'Help changed'),
          );
          await write('help', 'restore', 3, revision: 1);
          final help = await db.tablesDB.getRow(
            databaseId: '',
            tableId: 'cms_help',
            rowId: 'entry',
          );
          expect((help.data['draft'] as Map)['body'], 'Only help');
        },
      );
      test(
        'type-specific publication validation rejects empty answers and unorganized help',
        () async {
          await write('faq', 'create', 0, fields: draft('faq', body: ''));
          await expectLater(
            write('faq', 'publish', 1),
            throwsA(isA<CmsFailure>().having((e) => e.status, 'status', 400)),
          );
          await write(
            'help',
            'create',
            0,
            fields: {...draft('help'), 'category': ''},
          );
          await expectLater(
            write('help', 'publish', 1),
            throwsA(isA<CmsFailure>()),
          );
          expect(
            () => Cms(db, kind: 'unknown'),
            throwsA(isA<CmsFailure>().having((e) => e.status, 'status', 404)),
          );
          expect(
            (await send((c) => publishedContent(c, 'unknown'))).statusCode,
            404,
          );
        },
      );
      test(
        'public placement picks only active published priority winner and excludes draft internals',
        () async {
          for (final item in [
            {'id': 'low', 'priority': '1', 'start': ''},
            {'id': 'high', 'priority': '10', 'start': ''},
            {
              'id': 'future',
              'priority': '100',
              'start': '2099-01-01T00:00:00Z',
            },
          ]) {
            await write(
              'promotion',
              'create',
              0,
              id: item['id']!,
              fields: {
                ...draft('promotion'),
                'slug': item['id'],
                'priority': item['priority'],
                'starts_at': item['start'],
              },
            );
            await write('promotion', 'publish', 1, id: item['id']!);
          }
          final response = await send(
            (c) => placements.onRequest(c, 'marketplace-banner'),
          );
          expect(response.statusCode, 200);
          final p = jsonDecode(response.body)['promotion'] as Map;
          expect(p['id'], 'high');
          expect(p.containsKey('body'), false);
          expect(p.containsKey('priority'), false);
          expect(response.headers['cache-control'], 'no-store');
          await write('promotion', 'unpublish', 2, id: 'high');
          final fallback = await send(
            (c) => placements.onRequest(c, 'marketplace-banner'),
          );
          expect(jsonDecode(fallback.body)['promotion']['id'], 'low');
          expect(
            (await send((c) => placements.onRequest(c, 'unknown'))).statusCode,
            404,
          );
        },
      );
      test(
        'stale saves and duplicate URLs fail without changing saved content',
        () async {
          await write('page', 'create', 0, fields: draft('page'));
          await write(
            'page',
            'save',
            1,
            fields: draft('page', body: 'Updated once'),
          );
          await expectLater(
            write(
              'page',
              'save',
              1,
              fields: draft('page', body: 'Stale overwrite'),
            ),
            throwsA(isA<CmsFailure>().having((e) => e.status, 'status', 409)),
          );
          await expectLater(
            write('page', 'create', 0, id: 'other', fields: draft('page')),
            throwsA(isA<CmsFailure>().having((e) => e.status, 'status', 409)),
          );
        },
      );
    },
    skip: host == null ? 'Requires Firestore emulator' : false,
  );
}
