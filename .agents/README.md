# Agent team

This folder defines the working team for D:\Projects. The user leads product direction, priorities, and creative decisions. Codex coordinates delivery and uses the roles below as focused responsibilities.

Each agent and subteam has a Markdown file containing YAML front matter. Seven engineering and coordination roles are defined; the Business subteam is defined with two proposed specialist roles for refinement. These files describe responsibilities; they do not register agents or start background work. Load the relevant definitions when assigning work. Delegate to subagents only when the user or applicable instructions authorize delegation.

## Team

| Role | Responsibility | Definition |
| --- | --- | --- |
| Lead | Planning, acceptance criteria, coordination, reporting; makes no direct changes | [lead.md](roles/lead.md) |
| Frontend | Product interfaces, accessibility, client state, API consumption | [frontend.md](roles/frontend.md) |
| Backend | APIs, data storage, integrations, background jobs | [backend.md](roles/backend.md) |
| Security | Authentication, authorization, secrets, trust boundaries | [security.md](roles/security.md) |
| ML | Valuation models, evaluation, training data, inference quality | [ml.md](roles/ml.md) |
| QA | Testing, regression coverage, reproduction, acceptance verification; changes tests only | [qa.md](roles/qa.md) |
| Platform | Local tooling, deployments, infrastructure, operational reliability | [platform.md](roles/platform.md) |
| Business Strategist | Research, business plan, financial assumptions, commercial narrative | [business-strategist.md](roles/business-strategist.md) |
| Pitch Designer | Pitch deck, slide design, speaker notes, presentation quality | [pitch-designer.md](roles/pitch-designer.md) |

## Subteams

| Subteam | Members | Outcome |
| --- | --- | --- |
| [Product Delivery](subteams/product-delivery.md) | Lead, Frontend, Backend | Own features from planning through acceptance, supported by the other subteams |
| [Intelligence](subteams/intelligence.md) | ML | Own the full model lifecycle; Backend owns serving infrastructure |
| [Reliability](subteams/reliability.md) | Security, QA, Platform | Support features throughout delivery and own ongoing security, test health, and operational reliability |
| [Business](subteams/business.md) | Business Strategist, Pitch Designer | Own the pitch deck and business plan |

Subteams group responsibilities; they do not add managers or require separate agent processes. Intelligence begins with one specialist and can expand when the work justifies it. Lead coordinates across all four subteams. Security, QA, and Platform work with delivery throughout a task.

Current [delivery priorities](delivery-priorities.md): Business owns the pitch deck and business plan for Wednesday, November 4; Product Delivery focuses on the demo-ready site for Friday, November 6.

The [commercial policy](commercial-policy.md) records the current user-approved marketplace fee schedule and remaining pricing decisions.

The proposed [deployment strategy](deployment-strategy.md) separates idle cost, traffic cost, and sale contribution, with migration prerequisites and a benchmark plan.

TEAM.md has been migrated into this folder and deleted. Its five original role sections, including their roadmap items, are preserved in the corresponding agent's historical_context field. Those May 2026 notes are unverified historical context, not current assignments. Verify paths, technology assumptions, and completion status against the repository before using them.

## Agent definition format

Every agent uses schema_version, id, name, status, subteam, mission, scope, responsibilities, limits, inputs, outputs, reviews, and partners. The reviews field lists triggers for involving that role. Scope describes responsibility and does not grant exclusive file ownership or additional permissions. Historical roles also include historical_context. Roles may include model_preferences using the user's model labels; these preferences do not configure runtime routing or assert model availability.

For each assigned task, add concrete acceptance criteria, allowed files, dependencies, and required verification to the task brief. Do not store changing task assignments in these standing role definitions.

## Working agreement

- Follow the shared [communication and handoff protocol](communication.md), currently proposed for review. It defines task briefs, status updates, contract decisions, handoff evidence, and cross-subteam routes.
- Start with the user's intended outcome, affected paths, and observable acceptance criteria.
- Read applicable instructions and existing work before changing files. Preserve unrelated edits.
- Give each delegated task a clear owner and explicit file scope. Coordinate shared files before editing them.
- Agree on API and data contracts before implementing changes across layers.
- Use the smallest relevant verification that establishes the behavior. Report what passed and what remains unverified.
- Review security-sensitive changes with the Security role and deployment-sensitive changes with Platform.
- Hand off with: outcome, changed files, verification evidence, unresolved risks, and next owner.
- The Lead coordinates integration by implementation agents and gives the user one clear final report. The Lead makes no direct changes. Role ownership does not grant permission to publish, message others, or perform destructive actions.
- Never include secret values in reports, prompts, or committed documentation.
