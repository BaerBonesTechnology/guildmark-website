// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, implicit_dynamic_list_literal

import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import '../main.dart' as entrypoint;
import '../routes/index.dart' as index;
import '../routes/webhooks/fedex/index.dart' as webhooks_fedex_index;
import '../routes/waitlist/index.dart' as waitlist_index;
import '../routes/valuation/estimate.dart' as valuation_estimate;
import '../routes/seller/offers/[offerId]/[action].dart' as seller_offers_$offer_id_$action;
import '../routes/seller/listings/index.dart' as seller_listings_index;
import '../routes/seller/listings/[id]/withdraw.dart' as seller_listings_$id_withdraw;
import '../routes/payments/index.dart' as payments_index;
import '../routes/orders/index.dart' as orders_index;
import '../routes/orders/[id]/ship.dart' as orders_$id_ship;
import '../routes/orders/[id]/index.dart' as orders_$id_index;
import '../routes/orders/[id]/dispute.dart' as orders_$id_dispute;
import '../routes/orders/[id]/confirm.dart' as orders_$id_confirm;
import '../routes/marketplace/stats.dart' as marketplace_stats;
import '../routes/marketplace/listings/index.dart' as marketplace_listings_index;
import '../routes/marketplace/listings/[id].dart' as marketplace_listings_$id;
import '../routes/dashboard/index.dart' as dashboard_index;
import '../routes/contact/index.dart' as contact_index;
import '../routes/buyer/offers/index.dart' as buyer_offers_index;
import '../routes/auth/signup.dart' as auth_signup;
import '../routes/auth/reset_password.dart' as auth_reset_password;
import '../routes/auth/refresh.dart' as auth_refresh;
import '../routes/auth/logout.dart' as auth_logout;
import '../routes/auth/login.dart' as auth_login;
import '../routes/auth/forgot_password.dart' as auth_forgot_password;
import '../routes/assets/index.dart' as assets_index;
import '../routes/assets/[id]/valuations.dart' as assets_$id_valuations;
import '../routes/amps/portfolio.dart' as amps_portfolio;
import '../routes/amps/mdm/connect.dart' as amps_mdm_connect;
import '../routes/amps/mdm/connections/index.dart' as amps_mdm_connections_index;
import '../routes/amps/mdm/connections/[id]/sync.dart' as amps_mdm_connections_$id_sync;
import '../routes/amps/mdm/connections/[id]/index.dart' as amps_mdm_connections_$id_index;
import '../routes/amps/invoices/index.dart' as amps_invoices_index;
import '../routes/amps/invoices/generate.dart' as amps_invoices_generate;
import '../routes/amps/assets/index.dart' as amps_assets_index;
import '../routes/amps/assets/[id]/list.dart' as amps_assets_$id_list;
import '../routes/admin/auth.dart' as admin_auth;
import '../routes/admin/waitlist/index.dart' as admin_waitlist_index;
import '../routes/admin/waitlist/[id]/notes.dart' as admin_waitlist_$id_notes;
import '../routes/admin/waitlist/[id]/index.dart' as admin_waitlist_$id_index;
import '../routes/admin/waitlist/[id]/contact.dart' as admin_waitlist_$id_contact;
import '../routes/admin/users/index.dart' as admin_users_index;
import '../routes/admin/users/[id]/index.dart' as admin_users_$id_index;
import '../routes/admin/orders/expire_inspections.dart' as admin_orders_expire_inspections;
import '../routes/admin/analytics/index.dart' as admin_analytics_index;

import '../routes/_middleware.dart' as middleware;

void main() async {
  final address = InternetAddress.tryParse('') ?? InternetAddress.anyIPv6;
  final port = int.tryParse(Platform.environment['PORT'] ?? '8080') ?? 8080;
  hotReload(() => createServer(address, port));
}

Future<HttpServer> createServer(InternetAddress address, int port) {
  final handler = Cascade().add(buildRootHandler()).handler;
  return entrypoint.run(handler, address, port);
}

Handler buildRootHandler() {
  final pipeline = const Pipeline().addMiddleware(middleware.middleware);
  final router = Router()
    ..mount('/', (context) => buildHandler()(context))
    ..mount('/webhooks/fedex', (context) => buildWebhooksFedexHandler()(context))
    ..mount('/waitlist', (context) => buildWaitlistHandler()(context))
    ..mount('/valuation', (context) => buildValuationHandler()(context))
    ..mount('/seller/offers/<offerId>', (context,offerId,) => buildSellerOffers$offerIdHandler(offerId,)(context))
    ..mount('/seller/listings', (context) => buildSellerListingsHandler()(context))
    ..mount('/seller/listings/<id>', (context,id,) => buildSellerListings$idHandler(id,)(context))
    ..mount('/payments', (context) => buildPaymentsHandler()(context))
    ..mount('/orders', (context) => buildOrdersHandler()(context))
    ..mount('/orders/<id>', (context,id,) => buildOrders$idHandler(id,)(context))
    ..mount('/marketplace', (context) => buildMarketplaceHandler()(context))
    ..mount('/marketplace/listings', (context) => buildMarketplaceListingsHandler()(context))
    ..mount('/dashboard', (context) => buildDashboardHandler()(context))
    ..mount('/contact', (context) => buildContactHandler()(context))
    ..mount('/buyer/offers', (context) => buildBuyerOffersHandler()(context))
    ..mount('/auth', (context) => buildAuthHandler()(context))
    ..mount('/assets', (context) => buildAssetsHandler()(context))
    ..mount('/assets/<id>', (context,id,) => buildAssets$idHandler(id,)(context))
    ..mount('/amps', (context) => buildAmpsHandler()(context))
    ..mount('/amps/mdm', (context) => buildAmpsMdmHandler()(context))
    ..mount('/amps/mdm/connections', (context) => buildAmpsMdmConnectionsHandler()(context))
    ..mount('/amps/mdm/connections/<id>', (context,id,) => buildAmpsMdmConnections$idHandler(id,)(context))
    ..mount('/amps/invoices', (context) => buildAmpsInvoicesHandler()(context))
    ..mount('/amps/assets', (context) => buildAmpsAssetsHandler()(context))
    ..mount('/amps/assets/<id>', (context,id,) => buildAmpsAssets$idHandler(id,)(context))
    ..mount('/admin', (context) => buildAdminHandler()(context))
    ..mount('/admin/waitlist', (context) => buildAdminWaitlistHandler()(context))
    ..mount('/admin/waitlist/<id>', (context,id,) => buildAdminWaitlist$idHandler(id,)(context))
    ..mount('/admin/users', (context) => buildAdminUsersHandler()(context))
    ..mount('/admin/users/<id>', (context,id,) => buildAdminUsers$idHandler(id,)(context))
    ..mount('/admin/orders', (context) => buildAdminOrdersHandler()(context))
    ..mount('/admin/analytics', (context) => buildAdminAnalyticsHandler()(context));
  return pipeline.addHandler(router);
}

Handler buildHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildWebhooksFedexHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => webhooks_fedex_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildWaitlistHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => waitlist_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildValuationHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/estimate', (context) => valuation_estimate.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildSellerOffers$offerIdHandler(String offerId,) {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/<action>', (context,action,) => seller_offers_$offer_id_$action.onRequest(context,offerId,action,));
  return pipeline.addHandler(router);
}

Handler buildSellerListingsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => seller_listings_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildSellerListings$idHandler(String id,) {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/withdraw', (context) => seller_listings_$id_withdraw.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildPaymentsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => payments_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildOrdersHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => orders_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildOrders$idHandler(String id,) {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/confirm', (context) => orders_$id_confirm.onRequest(context,id,))..all('/dispute', (context) => orders_$id_dispute.onRequest(context,id,))..all('/ship', (context) => orders_$id_ship.onRequest(context,id,))..all('/', (context) => orders_$id_index.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildMarketplaceHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/stats', (context) => marketplace_stats.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildMarketplaceListingsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/<id>', (context,id,) => marketplace_listings_$id.onRequest(context,id,))..all('/', (context) => marketplace_listings_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildDashboardHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => dashboard_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildContactHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => contact_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildBuyerOffersHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => buyer_offers_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAuthHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/forgot_password', (context) => auth_forgot_password.onRequest(context,))..all('/login', (context) => auth_login.onRequest(context,))..all('/logout', (context) => auth_logout.onRequest(context,))..all('/refresh', (context) => auth_refresh.onRequest(context,))..all('/reset_password', (context) => auth_reset_password.onRequest(context,))..all('/signup', (context) => auth_signup.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAssetsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => assets_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAssets$idHandler(String id,) {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/valuations', (context) => assets_$id_valuations.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildAmpsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/portfolio', (context) => amps_portfolio.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAmpsMdmHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/connect', (context) => amps_mdm_connect.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAmpsMdmConnectionsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => amps_mdm_connections_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAmpsMdmConnections$idHandler(String id,) {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/sync', (context) => amps_mdm_connections_$id_sync.onRequest(context,id,))..all('/', (context) => amps_mdm_connections_$id_index.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildAmpsInvoicesHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/generate', (context) => amps_invoices_generate.onRequest(context,))..all('/', (context) => amps_invoices_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAmpsAssetsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => amps_assets_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAmpsAssets$idHandler(String id,) {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/list', (context) => amps_assets_$id_list.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildAdminHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/auth', (context) => admin_auth.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAdminWaitlistHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => admin_waitlist_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAdminWaitlist$idHandler(String id,) {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/contact', (context) => admin_waitlist_$id_contact.onRequest(context,id,))..all('/notes', (context) => admin_waitlist_$id_notes.onRequest(context,id,))..all('/', (context) => admin_waitlist_$id_index.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildAdminUsersHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => admin_users_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAdminUsers$idHandler(String id,) {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => admin_users_$id_index.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildAdminOrdersHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/expire_inspections', (context) => admin_orders_expire_inspections.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAdminAnalyticsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => admin_analytics_index.onRequest(context,));
  return pipeline.addHandler(router);
}

