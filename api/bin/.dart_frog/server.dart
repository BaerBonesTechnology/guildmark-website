// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, implicit_dynamic_list_literal

import 'dart:io';

import 'package:dart_frog/dart_frog.dart';

import '../main.dart' as entrypoint;
import '../routes/index.dart' as index;
import '../routes/webhooks/doppler.dart' as webhooks_doppler;
import '../routes/webhooks/fedex/index.dart' as webhooks_fedex_index;
import '../routes/webhooks/ebay/account_deletion.dart' as webhooks_ebay_account_deletion;
import '../routes/waitlist/index.dart' as waitlist_index;
import '../routes/valuation/estimate.dart' as valuation_estimate;
import '../routes/subscriptions/current.dart' as subscriptions_current;
import '../routes/subscriptions/checkout.dart' as subscriptions_checkout;
import '../routes/subscriptions/cancel.dart' as subscriptions_cancel;
import '../routes/seller/offers/[offerId]/[action].dart' as seller_offers_$offer_id_$action;
import '../routes/seller/listings/index.dart' as seller_listings_index;
import '../routes/seller/listings/[id]/withdraw.dart' as seller_listings_$id_withdraw;
import '../routes/seller/listings/[id]/publish.dart' as seller_listings_$id_publish;
import '../routes/seller/listings/[id]/index.dart' as seller_listings_$id_index;
import '../routes/payments/index.dart' as payments_index;
import '../routes/partner/workboard/index.dart' as partner_workboard_index;
import '../routes/partner/workboard/[id]/claim.dart' as partner_workboard_$id_claim;
import '../routes/partner/services/index.dart' as partner_services_index;
import '../routes/partner/services/[id]/index.dart' as partner_services_$id_index;
import '../routes/partner/auth/refresh.dart' as partner_auth_refresh;
import '../routes/partner/auth/logout.dart' as partner_auth_logout;
import '../routes/partner/auth/login.dart' as partner_auth_login;
import '../routes/partner/account/withdraw.dart' as partner_account_withdraw;
import '../routes/partner/account/index.dart' as partner_account_index;
import '../routes/orders/index.dart' as orders_index;
import '../routes/orders/[id]/track.dart' as orders_$id_track;
import '../routes/orders/[id]/ship.dart' as orders_$id_ship;
import '../routes/orders/[id]/index.dart' as orders_$id_index;
import '../routes/orders/[id]/dispute.dart' as orders_$id_dispute;
import '../routes/orders/[id]/confirm.dart' as orders_$id_confirm;
import '../routes/marketplace/stats.dart' as marketplace_stats;
import '../routes/marketplace/listings/index.dart' as marketplace_listings_index;
import '../routes/marketplace/listings/[id]/index.dart' as marketplace_listings_$id_index;
import '../routes/marketplace/listings/[id]/buy.dart' as marketplace_listings_$id_buy;
import '../routes/dashboard/index.dart' as dashboard_index;
import '../routes/contact/index.dart' as contact_index;
import '../routes/config/fees.dart' as config_fees;
import '../routes/buyer/offers/index.dart' as buyer_offers_index;
import '../routes/auth/signup.dart' as auth_signup;
import '../routes/auth/reset_password.dart' as auth_reset_password;
import '../routes/auth/refresh.dart' as auth_refresh;
import '../routes/auth/logout.dart' as auth_logout;
import '../routes/auth/login.dart' as auth_login;
import '../routes/auth/forgot_password.dart' as auth_forgot_password;
import '../routes/assets/index.dart' as assets_index;
import '../routes/assets/[id]/valuations.dart' as assets_$id_valuations;
import '../routes/amps/valuation_status.dart' as amps_valuation_status;
import '../routes/amps/valuate.dart' as amps_valuate;
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
import '../routes/admin/passkey/register/complete.dart' as admin_passkey_register_complete;
import '../routes/admin/passkey/register/begin.dart' as admin_passkey_register_begin;
import '../routes/admin/passkey/auth/complete.dart' as admin_passkey_auth_complete;
import '../routes/admin/orders/expire_inspections.dart' as admin_orders_expire_inspections;
import '../routes/admin/employees/index.dart' as admin_employees_index;
import '../routes/admin/employees/[id]/index.dart' as admin_employees_$id_index;
import '../routes/admin/config/index.dart' as admin_config_index;
import '../routes/admin/analytics/index.dart' as admin_analytics_index;

import '../routes/_middleware.dart' as middleware;
import '../routes/partner/_middleware.dart' as partner_middleware;
import '../routes/amps/_middleware.dart' as amps_middleware;

void main() async {
  final address = InternetAddress.tryParse('') ?? InternetAddress.anyIPv6;
  final port = int.tryParse(Platform.environment['PORT'] ?? '8443') ?? 8443;
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
    ..mount('/webhooks', (context) => buildWebhooksHandler()(context))
    ..mount('/webhooks/fedex', (context) => buildWebhooksFedexHandler()(context))
    ..mount('/webhooks/ebay', (context) => buildWebhooksEbayHandler()(context))
    ..mount('/waitlist', (context) => buildWaitlistHandler()(context))
    ..mount('/valuation', (context) => buildValuationHandler()(context))
    ..mount('/subscriptions', (context) => buildSubscriptionsHandler()(context))
    ..mount('/seller/offers/<offerId>', (context,offerId,) => buildSellerOffers$offerIdHandler(offerId,)(context))
    ..mount('/seller/listings', (context) => buildSellerListingsHandler()(context))
    ..mount('/seller/listings/<id>', (context,id,) => buildSellerListings$idHandler(id,)(context))
    ..mount('/payments', (context) => buildPaymentsHandler()(context))
    ..mount('/partner/workboard', (context) => buildPartnerWorkboardHandler()(context))
    ..mount('/partner/workboard/<id>', (context,id,) => buildPartnerWorkboard$idHandler(id,)(context))
    ..mount('/partner/services', (context) => buildPartnerServicesHandler()(context))
    ..mount('/partner/services/<id>', (context,id,) => buildPartnerServices$idHandler(id,)(context))
    ..mount('/partner/auth', (context) => buildPartnerAuthHandler()(context))
    ..mount('/partner/account', (context) => buildPartnerAccountHandler()(context))
    ..mount('/orders', (context) => buildOrdersHandler()(context))
    ..mount('/orders/<id>', (context,id,) => buildOrders$idHandler(id,)(context))
    ..mount('/marketplace', (context) => buildMarketplaceHandler()(context))
    ..mount('/marketplace/listings', (context) => buildMarketplaceListingsHandler()(context))
    ..mount('/marketplace/listings/<id>', (context,id,) => buildMarketplaceListings$idHandler(id,)(context))
    ..mount('/dashboard', (context) => buildDashboardHandler()(context))
    ..mount('/contact', (context) => buildContactHandler()(context))
    ..mount('/config', (context) => buildConfigHandler()(context))
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
    ..mount('/admin/passkey/register', (context) => buildAdminPasskeyRegisterHandler()(context))
    ..mount('/admin/passkey/auth', (context) => buildAdminPasskeyAuthHandler()(context))
    ..mount('/admin/orders', (context) => buildAdminOrdersHandler()(context))
    ..mount('/admin/employees', (context) => buildAdminEmployeesHandler()(context))
    ..mount('/admin/employees/<id>', (context,id,) => buildAdminEmployees$idHandler(id,)(context))
    ..mount('/admin/config', (context) => buildAdminConfigHandler()(context))
    ..mount('/admin/analytics', (context) => buildAdminAnalyticsHandler()(context));
  return pipeline.addHandler(router);
}

Handler buildHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildWebhooksHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/doppler', (context) => webhooks_doppler.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildWebhooksFedexHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => webhooks_fedex_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildWebhooksEbayHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/account_deletion', (context) => webhooks_ebay_account_deletion.onRequest(context,));
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

Handler buildSubscriptionsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/cancel', (context) => subscriptions_cancel.onRequest(context,))..all('/checkout', (context) => subscriptions_checkout.onRequest(context,))..all('/current', (context) => subscriptions_current.onRequest(context,));
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
    ..all('/publish', (context) => seller_listings_$id_publish.onRequest(context,id,))..all('/withdraw', (context) => seller_listings_$id_withdraw.onRequest(context,id,))..all('/', (context) => seller_listings_$id_index.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildPaymentsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => payments_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildPartnerWorkboardHandler() {
  final pipeline = const Pipeline().addMiddleware(partner_middleware.middleware);
  final router = Router()
    ..all('/', (context) => partner_workboard_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildPartnerWorkboard$idHandler(String id,) {
  final pipeline = const Pipeline().addMiddleware(partner_middleware.middleware);
  final router = Router()
    ..all('/claim', (context) => partner_workboard_$id_claim.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildPartnerServicesHandler() {
  final pipeline = const Pipeline().addMiddleware(partner_middleware.middleware);
  final router = Router()
    ..all('/', (context) => partner_services_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildPartnerServices$idHandler(String id,) {
  final pipeline = const Pipeline().addMiddleware(partner_middleware.middleware);
  final router = Router()
    ..all('/', (context) => partner_services_$id_index.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildPartnerAuthHandler() {
  final pipeline = const Pipeline().addMiddleware(partner_middleware.middleware);
  final router = Router()
    ..all('/login', (context) => partner_auth_login.onRequest(context,))..all('/logout', (context) => partner_auth_logout.onRequest(context,))..all('/refresh', (context) => partner_auth_refresh.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildPartnerAccountHandler() {
  final pipeline = const Pipeline().addMiddleware(partner_middleware.middleware);
  final router = Router()
    ..all('/withdraw', (context) => partner_account_withdraw.onRequest(context,))..all('/', (context) => partner_account_index.onRequest(context,));
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
    ..all('/confirm', (context) => orders_$id_confirm.onRequest(context,id,))..all('/dispute', (context) => orders_$id_dispute.onRequest(context,id,))..all('/ship', (context) => orders_$id_ship.onRequest(context,id,))..all('/track', (context) => orders_$id_track.onRequest(context,id,))..all('/', (context) => orders_$id_index.onRequest(context,id,));
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
    ..all('/', (context) => marketplace_listings_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildMarketplaceListings$idHandler(String id,) {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/buy', (context) => marketplace_listings_$id_buy.onRequest(context,id,))..all('/', (context) => marketplace_listings_$id_index.onRequest(context,id,));
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

Handler buildConfigHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/fees', (context) => config_fees.onRequest(context,));
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
  final pipeline = const Pipeline().addMiddleware(amps_middleware.middleware);
  final router = Router()
    ..all('/portfolio', (context) => amps_portfolio.onRequest(context,))..all('/valuate', (context) => amps_valuate.onRequest(context,))..all('/valuation_status', (context) => amps_valuation_status.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAmpsMdmHandler() {
  final pipeline = const Pipeline().addMiddleware(amps_middleware.middleware);
  final router = Router()
    ..all('/connect', (context) => amps_mdm_connect.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAmpsMdmConnectionsHandler() {
  final pipeline = const Pipeline().addMiddleware(amps_middleware.middleware);
  final router = Router()
    ..all('/', (context) => amps_mdm_connections_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAmpsMdmConnections$idHandler(String id,) {
  final pipeline = const Pipeline().addMiddleware(amps_middleware.middleware);
  final router = Router()
    ..all('/sync', (context) => amps_mdm_connections_$id_sync.onRequest(context,id,))..all('/', (context) => amps_mdm_connections_$id_index.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildAmpsInvoicesHandler() {
  final pipeline = const Pipeline().addMiddleware(amps_middleware.middleware);
  final router = Router()
    ..all('/generate', (context) => amps_invoices_generate.onRequest(context,))..all('/', (context) => amps_invoices_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAmpsAssetsHandler() {
  final pipeline = const Pipeline().addMiddleware(amps_middleware.middleware);
  final router = Router()
    ..all('/', (context) => amps_assets_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAmpsAssets$idHandler(String id,) {
  final pipeline = const Pipeline().addMiddleware(amps_middleware.middleware);
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

Handler buildAdminPasskeyRegisterHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/begin', (context) => admin_passkey_register_begin.onRequest(context,))..all('/complete', (context) => admin_passkey_register_complete.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAdminPasskeyAuthHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/complete', (context) => admin_passkey_auth_complete.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAdminOrdersHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/expire_inspections', (context) => admin_orders_expire_inspections.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAdminEmployeesHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => admin_employees_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAdminEmployees$idHandler(String id,) {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => admin_employees_$id_index.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildAdminConfigHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => admin_config_index.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildAdminAnalyticsHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => admin_analytics_index.onRequest(context,));
  return pipeline.addHandler(router);
}

