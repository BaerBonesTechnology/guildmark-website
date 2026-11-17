---
schema_version: 1
id: "team_communication"
status: "proposed"
purpose: "Coordinate agent work and cross-subteam handoffs with clear ownership and verifiable evidence."
communication_rules:
  - "Lead coordinates priorities, scope, dependencies, and acceptance reporting."
  - "Engineers communicate directly about technical details within assigned scope; summarize decisions affecting contracts, dependencies, or acceptance to Lead."
  - "Use the current task conversation as the default record. Reference relevant messages, files, revisions, and artifacts instead of copying large outputs."
  - "Use a task ID consistently across assignments, updates, findings, and handoffs."
  - "Record material decisions and their reasons; identify proposals and assumptions explicitly."
  - "Communicate when work starts, a dependency changes, a blocker appears, a contract changes, or a handoff is ready. Avoid repeated unchanged status updates."
  - "Never include secret values or unnecessary sensitive data in communication."
runtime_boundaries:
  - "Use available agent coordination tools only when delegation is authorized for the current task. Defining this protocol does not start or authorize agent execution."
  - "Messaging a separate user-owned chat requires explicit user authorization. This protocol does not authorize email, Slack, or other external messages."
  - "If runtime messaging is unavailable, present the same brief or handoff in the current conversation. Do not claim that another agent received or accepted it."
  - "Lead produces briefs and summaries in conversation and reads evidence; Lead does not write tracking files or make other changes."
task_brief:
  required_fields:
    - "task_id"
    - "outcome"
    - "owner"
    - "subteam"
    - "scope_and_allowed_files"
    - "acceptance_criteria"
    - "dependencies_and_contracts"
    - "required_verification"
  rules:
    - "Assign one accountable owner for each work item and name supporting specialists as needed."
    - "Keep assignments within agent change permissions; coordinate shared files before edits."
    - "Specify any external actions requiring user authorization and any authorization already given."
work_states:
  assigned: "Brief issued; recipient has not yet confirmed scope and dependencies."
  in_progress: "Owner has acknowledged the assignment and started authorized work."
  blocked: "A named dependency or decision prevents progress; report the affected work and the needed resolution."
  ready_for_handoff: "Sender has provided the result and evidence for a named recipient and next action."
  in_verification: "Recipient has acknowledged the handoff and is checking the result."
  changes_requested: "Verification identified unmet criteria; return actionable findings to the implementation owner."
  complete: "Assigned scope satisfies its criteria with verification evidence. Feature acceptance is assessed separately."
status_update:
  fields:
    - "task_id and owner"
    - "current state and concrete progress"
    - "new evidence, decisions, or contract changes"
    - "blocker and requested action, if any"
    - "next action and next owner"
contract_changes:
  - "Frontend and Backend agree on API inputs, outputs, errors, and compatibility before dependent implementation."
  - "ML and Backend agree on feature semantics, artifact versions, inference inputs and outputs, and runtime requirements."
  - "Include Security for changes to identity, permissions, secrets, sensitive data, or trust boundaries; include Platform for operational changes."
  - "Record the agreed contract and affected consumers in the task conversation or an existing appropriate specification. An engineer makes any required file changes."
  - "Notify affected owners and Lead when a contract changes; revisit dependent scope and verification before continuing affected work."
handoff:
  required_fields:
    - "task_id"
    - "sender and recipient"
    - "result and acceptance criteria addressed"
    - "changed files and revision or artifact references, where applicable"
    - "contract changes and compatibility notes"
    - "verification performed, results, and reproduction commands or steps"
    - "remaining risks, unmet criteria, and unverified behavior"
    - "requested next action and next owner"
  rules:
    - "Sender marks the result ready_for_handoff and names the recipient; delivery alone does not imply acknowledgement."
    - "Recipient acknowledges scope and starts verification or returns a specific missing requirement or blocker."
    - "Sender remains accountable for the accuracy of the delivered result and follows up on unresolved handoff issues until receipt is acknowledged."
    - "A handoff transfers the next action, not Product Delivery's ownership of the feature."
    - "Return failed verification to the relevant engineer with evidence; do not silently expand the recipient's implementation scope."
subteam_routes:
  business_and_product_delivery:
    request: "Business sends focused requests for verified capabilities, roadmap distinctions, screenshots, and demo context to relevant engineers, with Lead coordinating dependencies."
    return: "Product Delivery supplies capability evidence and visuals with readiness limitations; Business keeps deck and plan claims aligned with that evidence."
    follow_through: "Business owns its documents and Product Delivery owns the demo. Lead resolves scope or priority conflicts and coordinates user decisions."
  business_review:
    request: "Business Strategist hands narrative, sources, figures, and assumptions to Pitch Designer."
    return: "Pitch Designer returns the deck with artifact references, visual verification, and unresolved questions; both reconcile figures and claims before reporting readiness to Lead."
  product_delivery_to_intelligence:
    request: "Lead coordinates model requirements, data constraints, and measurable model acceptance criteria with ML and Backend."
    return: "ML delivers versioned artifacts, feature and inference contracts, evaluation evidence, runtime needs, and limitations to Backend and Lead."
    follow_through: "Backend integrates serving infrastructure; ML verifies model quality after integration; Product Delivery retains feature ownership."
  product_delivery_to_reliability:
    request: "Lead involves relevant Security, QA, and Platform specialists during planning and implementation with scope, criteria, and dependencies."
    return: "Specialists provide findings, test results, security evidence, operational readiness, and unresolved risks to the affected engineers and Lead."
    follow_through: "Relevant engineers implement fixes; specialists verify them and return evidence for feature acceptance."
  intelligence_to_reliability:
    request: "ML coordinates data security, regression support, runtime requirements, and artifact delivery with relevant Reliability specialists and Backend."
    return: "Reliability provides specialist findings and operational evidence; ML retains model quality ownership and Backend retains serving infrastructure ownership."
  reliability_follow_up:
    request: "Security, QA, or Platform reports an ongoing health concern with evidence, impact, and a proposed owner to Lead."
    return: "Lead coordinates priority and a scoped assignment; the relevant engineer implements and Reliability verifies."
findings_and_escalation:
  required_fields:
    - "affected task or feature"
    - "expected and actual behavior"
    - "reproduction or supporting evidence"
    - "impact and whether an acceptance criterion is blocked"
    - "recommended owner and next action"
  rules:
    - "Report blockers promptly; continue independent authorized work where possible."
    - "Engineers resolve technical details within agreed scope. Lead resolves ownership, sequencing, and dependency conflicts."
    - "Escalate product policy, scope tradeoffs, external commitments, or missing authorization to the user through Lead."
    - "Do not mark a blocked criterion as satisfied or silently waive a finding. Record any user-approved exception and its implications."
acceptance_reporting:
  - "Lead maps implementation, QA, Security, Platform, and ML evidence to applicable acceptance criteria."
  - "Report satisfied criteria, outstanding findings, unverified behavior, and any required user decision."
  - "Mark a feature complete only when its agreed acceptance criteria are met or explicitly revised by the user and required verification is complete."
  - "Feature readiness does not itself authorize deployment, publication, or other external actions."
---
