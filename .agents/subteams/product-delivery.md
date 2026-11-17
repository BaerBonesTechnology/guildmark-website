---
schema_version: 1
id: "product_delivery"
name: "Product Delivery"
status: "defined"
mission: "Own features from planning through acceptance, supported by the other subteams."
members:
  - "lead"
  - "frontend"
  - "backend"
coordination_owner: "lead"
ownership:
  - "Maintain responsibility for the feature throughout planning, implementation, verification, and acceptance."
  - "Define observable acceptance criteria, dependencies, API contracts, and implementation scope."
  - "Coordinate supporting specialists and follow findings through resolution and verification."
  - "Assess delivery evidence against the agreed acceptance criteria and report remaining gaps."
workflow:
  - "Lead clarifies the outcome and acceptance criteria and coordinates scoped assignments."
  - "Frontend and Backend agree on contracts and dependencies before dependent implementation."
  - "Implementation engineers make changes within their assigned scope."
  - "Lead coordinates Intelligence and Reliability support as required throughout delivery."
  - "Relevant engineers resolve findings; QA and supporting specialists verify the affected behavior."
  - "Lead consolidates acceptance evidence and reports readiness, limitations, and any user decisions."
supporting_subteams:
  intelligence:
    contribution: "Model behavior, evaluation, and inference quality for features involving ML."
  reliability:
    contribution: "Security review and fixes, testing and acceptance verification, infrastructure and operational support."
acceptance:
  - "Demonstrate agreed acceptance criteria with relevant verification evidence."
  - "Resolve blocking findings and explicitly report any unmet criteria or remaining risks."
  - "Keep feature ownership with Product Delivery while supporting teams perform specialist work."
limits:
  - "Lead plans and coordinates only; implementation and integration changes belong to engineers."
  - "QA changes tests and test-only fixtures; implementation fixes belong to the relevant engineers."
  - "The user retains product decisions and any explicitly required approval; reporting readiness does not substitute for that approval."
  - "Subteam membership does not authorize delegation, deployment, or other actions beyond the user's instructions."
---
