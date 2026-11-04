# Optional business verification: developer handoff

Business signup is available immediately, including to small businesses. Verification is optional until selling: approved business verification is required to publish listings or sell. Signup, browsing, buying, and inventory remain available before approval. Subscription and AMPS entitlement checks remain unchanged. The Verified business badge confirms reviewed business registration and the applicant’s authority to represent it; it does not certify transactions, listing quality, grading, valuation, or compliance facts. This change does not authorize a consumer marketplace.

## Customer routes and API

- `/signup` and `/pre/signup`: full name, company, work email, password, confirmation on one page; successful account creation enters the corresponding dashboard.
- `/business-verification` and `/pre/business-verification`: authenticated application/status page, with dashboard exit and sign-out. `VerificationPrompt.tsx` links here; `BusinessBadge.tsx` displays the badge.
- `GET /business-verification`: current company application, default `unsubmitted`, plus current applicant email confirmation state. Reviewer-only `internal_evidence` is removed.
- `POST /business-verification`: `action` is `send_code`, `confirm_code` (with `code`), or `submit` (with `legal_name`, `registration_country`, `registration_number`, HTTPS `website`, `representative_role`). These paths are relative to the configured API base.
- `GET /business-badge?company_id=…`: exposes only `verified_business`, true only for an approved application; responses use `Cache-Control: no-store`.

Email challenges use eight digits, a ten-minute expiry, one issuance per minute, and five attempts. Confirmation consumes the challenge. Submission requires a confirmed email matching the current applicant email.

## Manual review and state

`unsubmitted` → submission → `pending` → staff decision `approved`, `needs_information`, or `rejected`. Only `unsubmitted` and `needs_information` are applicant-editable. A requested-information application may be corrected and resubmitted to `pending`; a rejected application has no implemented self-service resubmission path. The customer sees the decision reason.

`GET /admin/business-verifications?status=pending` lists up to 50 records with `next_cursor`; supported statuses are pending, approved, needs_information, rejected. `cursor` pages the queue. `GET /admin/business-verifications?company_id=…` returns up to 100 history events ordered by revision. This limit is not a guarantee of a complete long-running history.

`POST /admin/business-verifications` accepts `company_id`, expected `revision`, `decision`, and a nonempty `reason` (up to 2,000 characters). Approval additionally requires `registry_checked`, `authority_checked`, and nonempty `internal_evidence` (up to 4,000 characters). Current active staff records are checked on every request: only staff superadmin/compliance may review. Self-review and stale revisions are refused. A transaction updates the application and creates an immutable audit event; the exposed workflow has no event update/delete action.

Storage collections are `business_verifications`, `business_verification_events`, and `business_email_challenges`. Submission records `method: manual`. `api/bin/lib/services/business_verification.dart` owns transitions; the three route directories implement the endpoints above. `devdash/src/pages/BusinessReviews.tsx` implements the review component; `guildmark/src/app/portals/AdminPortal.tsx` mounts the integrated review surface at `/admin/business-reviews`. The separate portal integration chat owns portal source and later dev deployment.

## Future evidence automation (planned, not implemented)

Keep the current manual workflow operational. A future evidence adapter may collect registration and representation evidence, normalize its source, checked time, jurisdiction, outcome and uncertainty, and associate evidence with the exact submitted application revision. Treat failures, ambiguous matches, unsupported jurisdictions, and missing authority evidence as items for staff review. Do not label a provider lookup as approval.

Define an adapter contract and retention/access policy before integrating a provider. Keep credentials and raw evidence server-side; expose only applicant-safe status/reasons and the existing minimal badge result. Preserve revision checks, immutable review events, staff authorization, and explicit approval evidence. Add tests for adapter failure, retries/idempotency, changed applications, evidence redaction, and conflicting evidence. No provider is selected and no automatic registry checking is implemented. Only authorized human staff may grant the badge until policy is explicitly changed.

## Selling eligibility

Approval is checked inside the same Firestore transaction that publishes a draft, accepts/counters a seller offer, creates an accepted-offer order, or reserves a new buy-now checkout. New buyer offers on an unapproved seller’s existing listing are also rejected. Missing, pending, needs-information and rejected applications do not authorize selling. The API returns `403 SELLER_VERIFICATION_REQUIRED` for blocked selling actions.

Draft preparation, inventory reads, withdrawal and rejection remain available. Existing payment attempts retain their same-key reconciliation path, and fulfillment of existing orders remains available; the gate prevents new sales rather than abandoning already-started payment or delivery obligations. A buyer does not need business approval to buy from an approved seller.

## Validation and scope

The final seller-policy test pass completed 57 tests across `business_verification_test.dart`, `checkout_integration_test.dart` and `staff_authorization_test.dart` against local Firestore. It covers draft/publication eligibility, unapproved legacy listings, buyer eligibility, pre-payment denial without provider calls or inventory holds, payment idempotency, manual decisions and staff boundaries. The final Vite production build passed. Email delivery was simulated locally; live Resend delivery has not been exercised in this chat. The portal integration chat owns the combined dev deployment and real HTTPS admin/partner review checks. Reviewer screenshots are under `D:/Projects/.impeccable/review/signup`; their verdict belongs to the finish review.
