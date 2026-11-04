import 'dart:async';
import 'package:guildmark_api/services/square_service.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:test/test.dart';

void main() {
  for (final success in [true, false]) {
    test(
      'payment ${success ? "success" : "failure"} never logs credentials or payload',
      () async {
        final logs = <String>[];
        final client = MockClient((request) async {
          expect(
            request.headers['Authorization'],
            'Bearer secret-access-token',
          );
          expect(request.body, contains('secret-payment-nonce'));
          return success
              ? http.Response(
                  '{"payment":{"id":"payment","status":"COMPLETED","amount_money":{"amount":100}}}',
                  200,
                )
              : http.Response(
                  '{"errors":[{"detail":"secret-provider-response"}]}',
                  400,
                );
        });
        final service = SquareService(
          accessToken: 'secret-access-token',
          locationId: 'location',
          environment: 'sandbox',
          client: client,
          paymentErrorLogger: logs.add,
        );
        await runZoned(
          () async {
            final payment = service.createPayment(
              sourceId: 'secret-payment-nonce',
              amountCents: 100,
              note: 'private-buyer-note',
            );
            if (success) {
              expect((await payment).id, 'payment');
            } else {
              await expectLater(payment, throwsA(isA<SquareException>()));
            }
          },
          zoneSpecification: ZoneSpecification(
            print: (_, _, _, line) => logs.add(line),
          ),
        );
        final output = logs.join('\n');
        for (final secret in [
          'secret-access-token',
          'secret-payment-nonce',
          'private-buyer-note',
          'secret-provider-response',
        ]) {
          expect(output, isNot(contains(secret)));
        }
        if (!success) expect(output, contains('HTTP 400'));
        client.close();
      },
    );
  }
}
