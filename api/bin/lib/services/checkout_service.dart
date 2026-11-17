import 'package:guildmark_api/firebase/firestore.dart';
import 'package:guildmark_api/repos/firestore/checkout_repo.dart';
import 'package:guildmark_api/services/square_service.dart';

class CheckoutService {
  CheckoutService(this.repo, this.square);
  final CheckoutRepo repo;
  final SquareService square;

  Future<Row> pay(Row order, String? source) async {
    if (order.data['status'] != 'payment_pending') return order;
    SquarePaymentResult payment;
    try {
      final paymentId = order.data['square_payment_id'] as String?;
      if (paymentId != null) {
        payment = await square.getPayment(paymentId);
      } else {
        if (source == null ||
            DateTime.now().toUtc().difference(
                  DateTime.parse(order.$createdAt),
                ) >
                const Duration(minutes: 15)) {
          return order;
        }
        payment = await square.createPayment(
          sourceId: source,
          amountCents: order.data['charge_cents'] as int,
          idempotencyKey: order.data['payment_idempotency_key'] as String,
          referenceId: order.$id,
        );
      }
    } on SquareException catch (error) {
      if (error.definitiveDecline) {
        return repo.resolve(order.$id, paid: false, providerStatus: 'DECLINED');
      }
      return order;
    } catch (_) {
      // Unknown outcomes retain the reservation and original provider key.
      return order;
    }
    return applyPayment(order, payment);
  }

  Future<Row> applyPayment(Row order, SquarePaymentResult payment) async {
    if (order.data['payment_provider'] != 'square') return order;
    if (payment.amountCents != order.data['charge_cents'] ||
        payment.currency != 'USD' ||
        payment.referenceId != order.$id ||
        payment.locationId != square.locationId) {
      return order;
    }
    if (payment.status == 'COMPLETED') {
      return repo.resolve(
        order.$id,
        paid: true,
        paymentId: payment.id,
        providerStatus: payment.status,
      );
    }
    if (payment.status == 'FAILED' || payment.status == 'CANCELED') {
      return repo.resolve(
        order.$id,
        paid: false,
        paymentId: payment.id,
        providerStatus: payment.status,
      );
    }
    return repo.recordPending(order.$id, payment.id, payment.status);
  }
}
