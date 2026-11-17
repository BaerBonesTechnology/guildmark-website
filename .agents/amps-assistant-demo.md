---
schema_version: 1
id: "amps_assistant_demo"
status: "implemented_and_verified_locally"
target_date: "2026-11-06"
owner_subteam: "product_delivery"
purpose: "Help asset owners understand inventory, estimate recovery, and prepare listings for review."
demo_scope:
  - "Authenticated AMPS user opens the assistant and reads a bounded company inventory summary."
  - "User explicitly selects up to five laptop asset records; quantities are displayed separately from record counts."
  - "Assistant requests estimates from the existing ML service and shows per-unit values, quantity-adjusted totals, model metadata, and limitations."
  - "Assistant prepares structured listing previews without creating or publishing listings."
interaction: "Guided actions backed by deterministic tools and existing ML valuation; a free-form language-model agent is not part of this first implementation."
new_work:
  - "AMPS assistant page, responsive presentation, action selection, and result states."
  - "POST /amps/assistant with allowlisted intents and company-scoped read-only orchestration."
  - "Focused verification of access boundaries, missing data, partial failures, quantities, and no listing writes."
existing_foundation:
  - "AMPS company inventory, authentication and subscription enforcement."
  - "ML valuation service and asset metadata."
  - "Existing AMPS design system and feature-gated routes."
acceptance:
  - "Authentication and AMPS entitlement remain enforced; company identity comes from the authenticated principal."
  - "Cross-company asset access is rejected without exposing foreign asset details."
  - "Summary bounds and shown counts are explicit; a partial inventory is not represented as the full fleet."
  - "Numeric estimates and totals come from service results and application calculations."
  - "Missing age or other required fields and unavailable ML produce honest incomplete results."
  - "Confidence is described as a heuristic score, not a probability of price accuracy."
  - "All listing content remains a preview; assistant actions produce no marketplace or asset changes."
  - "No model training, production deployment, payment, MDM write, or external message is triggered."
  - "Affected frontend build and focused backend and frontend checks pass; end-to-end demo status is reported separately."
demo_prerequisites:
  - "Reachable local or agreed demo environment with AMPS feature flag enabled."
  - "Authenticated test company with valid AMPS entitlement and representative laptop assets."
  - "Available ML service with known artifact and data provenance; clearly label synthetic or fallback behavior."
  - "Verify the complete flow in the intended environment before claiming demo readiness."
later_scope:
  - "Free-form language understanding and conversational follow-up."
  - "Saved drafts, approval and publishing workflows, and persistent activity history."
  - "Procurement assistance, MDM actions, service ordering, and larger fleet operations."
business_handoff:
  - "Describe existing ML valuation separately from the new guided assistant."
  - "Treat the assistant as in development until integrated verification; do not claim demonstrated customer outcomes."
verification_record:
  date: "2026-10-30"
  environment: "Isolated ephemeral Firebase demo emulators, local API, Vite, and existing ML artifacts; no production credentials or deployment."
  evidence:
    - "8 focused backend tests pass; service and route analysis reports no issues."
    - "13 frontend helper and regression tests pass; production frontend build passes."
    - "End-to-end HTTP smoke passes entitlement denial, tenant isolation, inference totals, missing data, preview boundaries, and unchanged stored records."
    - "Desktop and mobile browser flow verified; bookmarked preview login redirect found, fixed, and reverified."
  screenshot: "output/amps-assistant/assistant-demo.jpg"
  remaining:
    - "Choose the lasting Friday demo environment, provide representative demo records and AMPS entitlement, and rehearse there."
    - "Confirm model artifact provenance and real-market evaluation before making accuracy claims."
    - "This is a guided ML workflow, not free-form LLM chat; previews are not saved or published."
---
