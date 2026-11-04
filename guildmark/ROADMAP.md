# GuildMark roadmap

## Deferred: U.S. tax determination

Status: roadmap only; no tax collection has been enabled. TaxCloud is the leading candidate for evaluation, not a purchased or configured integration. User scope confirmed November 4, 2026: U.S. equipment sales and AMPS subscriptions, including exemptions and jurisdiction-specific exceptions.

### Coverage

- Server-calculated tax quotes for marketplace hardware, related taxable fees/shipping and each AMPS billing period, with separate product tax classifications.
- Destination and service-use address validation, seller/GuildMark tax registrations and marketplace-facilitator responsibility.
- Resale, government and nonprofit exemptions only where applicable and supported by valid evidence; certificate scope, jurisdiction, product coverage and expiry must be checked.
- Product-specific exclusions, partial taxability and other jurisdiction rules, determined from the configured provider rather than invented rates or a blanket tax-free business account flag.
- Immutable quote/rule/provider versions in order and invoice records, exact-cent reconciliation, and idempotent capture/refund/reversal reporting.
- Role-restricted administration for registrations, product-code mapping, exemption review and audit history.

### Dependencies before activation

1. Select the provider and confirm its marketplace-facilitator and SaaS coverage, test isolation, API pricing and certificate workflow. TaxCloud Premium currently includes API access; confirm the applicable commercial terms during onboarding.
2. Configure an approved business profile, origin locations, registrations and product classifications. Do not infer real registrations from the Square sandbox merchant's demonstration address.
3. Design Square recurring invoice tax handling and update paid-invoice verification to validate base price, tax and total separately. Updating billing tax must not silently create another subscription or duplicate an invoice.
4. Verify taxable/exempt/partially taxable cases, changed addresses, expired certificates, unconfigured registrations, provider outages, refunds and subscription renewals in dev. Missing configuration must not masquerade as a successful zero-tax determination.
5. Require an explicit separate production rollout; development and production credentials/data remain separate.

References: [TaxCloud API](https://taxcloud.com/api/), [SaaS coverage](https://taxcloud.com/saas/), [pricing](https://taxcloud.com/taxcloud-pricing/), [exemption certificates](https://taxcloud.com/exemption-certificate-management/).


## Deferred: custom tax and invoice payment-allocation tool

Requested November 4, 2026; explicitly scheduled for later. Build a custom orchestration engine covering tax decisions and allocation of an invoice's payment across multiple authorized business accounts. Provider-backed jurisdiction data remains a candidate; TaxCloud is not a requirement or an active integration.

- Versioned invoice allocation rules for seller proceeds, platform fees, partner services, tax liabilities/reserves and other approved business accounts; every cent must balance to the paid invoice.
- Separate accounting allocations from actual money movement. Validate account ownership, eligibility, settlement availability and provider-supported payout capabilities before executing any transfer.
- Deterministic allocation snapshots, an auditable ledger, idempotent transfer keys, approval controls, payout holds and reconciliation against provider statements.
- Refunds, partial refunds, chargebacks, reversals, failed transfers and adjustments must preserve the original invoice's accounting history and prevent duplicate payouts.
- Apply the U.S. equipment/AMPS tax scope and exceptions described above. Do not equate a configured payout account with tax-exempt status.
- Test with synthetic invoices and isolated provider accounts before any separately authorized production activation. Current Square payments, allocations and payouts are unchanged by this roadmap entry.


## Planned separately: staff content management

Confirmed November 4, 2026: staff-only CMS covering public pages, blog posts, FAQs and help articles. Planning only; no CMS implementation or provider provisioning is included in the current integration release.

- Add a Content workspace within the integrated admin portal. Reuse staff passkey authentication and enforce separate edit/review/publish capabilities on the API.
- Start with structured page sections and a rich-text article editor, with reusable media, categories, slugs, SEO metadata, image alt text and internal links. Preserve GuildMark design components rather than allowing arbitrary HTML or scripts.
- Support drafts, private previews, approval, publishing, unpublishing and immutable revision history with rollback. Detect conflicting edits and record actor/time for every publication.
- Use Firestore for content and revisions, Firebase Storage for images and Cloud Run for authorized editorial APIs and published-content reads. Keep Cloud SQL deferred. Public responses expose only published revisions; preview responses require staff authorization and are not publicly cached.
- Import existing markdown blog posts while preserving slugs and links. Migrate help/FAQs next, then selected landing-page sections. Published content should update without requiring a storefront code release; SEO rendering and cache invalidation must be decided in the technical design.
- Keep listings, payment/pricing rules, verification decisions and customer/partner account administration in their existing product workflows. Legal-policy publication should retain explicit review and effective dates.
- First delivery milestone: blog and media library through draft, preview, publish and rollback in guildmark-dev. Follow with pages/FAQs/help and editor usability checks on desktop and mobile. Production rollout remains separately authorized.
