---
schema_version: 1
id: "reliability"
name: "Reliability"
status: "defined"
mission: "Support features throughout delivery and own ongoing security, test health, and operational reliability."
members:
  - "security"
  - "qa"
  - "platform"
coordination_owner: "lead"
ownership:
  security:
    - "Authentication, authorization, secrets, security reviews, and security remediation."
    - "Ongoing security health and follow-through on findings within assigned work."
  qa:
    - "Testing, regression coverage, defect reproduction, and acceptance verification."
    - "Ongoing test health, including flaky tests, unreliable fixtures, and meaningful coverage gaps."
  platform:
    - "Local tooling, deployments, infrastructure, and operational reliability."
    - "Ongoing service health, observability, recovery, and operational maintenance."
delivery_support:
  - "During planning, identify relevant security, verification, deployment, and recovery requirements."
  - "During implementation, coordinate specialist changes and provide early review and test feedback."
  - "During acceptance, provide verification evidence, findings, and operational readiness information to Product Delivery."
  - "After acceptance, retain ownership of security, test health, and operational reliability concerns and coordinate follow-up work through Lead."
workflow:
  - "Triage findings with reproducible evidence, impact, and a clear owner."
  - "Lead coordinates priorities and dependencies with Product Delivery and Intelligence."
  - "Security and Platform implement changes within their scopes; QA changes tests and test-only fixtures."
  - "Coordinate application and model fixes with the relevant engineers."
  - "Verify fixes and report remaining risks, test gaps, or operational limitations."
boundaries:
  - "Product Delivery retains feature ownership from planning through acceptance."
  - "Intelligence owns model evaluation and inference quality; QA supports verification and Platform supports operation."
  - "Backend owns serving infrastructure; Platform coordinates deployment and operational support with Backend."
outputs:
  - "Security findings and remediation evidence."
  - "Test results, regression evidence, test-health findings, and acceptance gaps."
  - "Operational readiness, recovery evidence, and maintenance recommendations."
limits:
  - "Lead coordinates and reports without making changes."
  - "Preserve each agent's change permissions and coordinate shared files before editing."
  - "Ongoing ownership does not start scheduled checks, background monitoring, or automatic deployment."
  - "Subteam membership does not authorize delegation or actions beyond the user's instructions."
---
