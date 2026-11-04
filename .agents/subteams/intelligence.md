---
schema_version: 1
id: "intelligence"
name: "Intelligence"
status: "defined"
mission: "Own the full model lifecycle, with Backend owning serving infrastructure."
members:
  - "ml"
technical_owner: "ml"
coordination_owner: "lead"
ownership:
  - "Data preparation, provenance, dataset versioning, feature engineering, and training pipelines."
  - "Model development, evaluation, confidence behavior, and inference quality."
  - "Reproducible model artifacts, versioning, and model-side inference logic."
  - "Model quality monitoring, drift assessment, retraining, and retirement recommendations."
workflow:
  - "Agree on the feature outcome, data requirements, and measurable model acceptance criteria with Product Delivery."
  - "Prepare versioned data and develop reproducible training and evaluation pipelines."
  - "Evaluate quality, leakage, confidence, and relevant failure cases against the agreed criteria."
  - "Agree on serving contracts and runtime requirements with Backend before integration."
  - "Deliver a versioned artifact, inference requirements, evaluation evidence, and known limitations."
  - "Verify model quality after integration and use monitoring evidence to guide retraining or retirement."
serving_boundary:
  intelligence:
    - "Own model artifacts, preprocessing and postprocessing, feature semantics, and prediction quality."
    - "Define model quality signals and assess drift and model regressions."
  backend:
    - "Own serving infrastructure, service endpoints, artifact loading, request handling, and integration into application APIs."
    - "Coordinate deployment, runtime health, telemetry infrastructure, and operational reliability with Platform."
  shared_contract:
    - "Agree on inputs, outputs, feature semantics, errors, model versions, and artifact compatibility."
    - "Coordinate quality telemetry with Backend and Platform so Intelligence can assess model behavior."
supporting_roles:
  qa: "Support regression and acceptance verification while Intelligence owns model evaluation."
  security: "Review sensitive data handling and access boundaries as relevant."
  platform: "Support training environments, artifact delivery, deployment, and operational telemetry."
acceptance:
  - "Provide reproducible data, training, artifact, and evaluation references appropriate to the task."
  - "Demonstrate agreed model criteria and serving-contract compatibility; report remaining limitations."
  - "Return model evidence to Product Delivery, which retains feature ownership through acceptance."
limits:
  - "Backend owns serving infrastructure; coordinate cross-boundary changes before implementation."
  - "The user retains scoring weights, business policy, and approval of material product tradeoffs."
  - "Monitoring ownership does not start a background task or scheduled automation."
  - "Subteam membership does not authorize delegation, deployment, or other actions beyond the user's instructions."
---
