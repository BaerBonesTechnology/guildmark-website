gcloud iam service-accounts create gha-pusher
gcloud artifacts repositories add-iam-policy-binding guildmark `
  --location=us-central1 `
  --member="serviceAccount:gha-pusher@guildmark-prod.iam.gserviceaccount.com" `
  --role=roles/artifactregistry.writer

gcloud iam workload-identity-pools create github --location=global
gcloud iam workload-identity-pools providers create-oidc github-oidc `
  --location=global --workload-identity-pool=github `
  --issuer-uri="https://token.actions.githubusercontent.com" `
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" `
  --attribute-condition="assertion.repository=='BaerBonesTechnology/guildmark-website'"

gcloud iam service-accounts add-iam-policy-binding `
  gha-pusher@guildmark-prod.iam.gserviceaccount.com `
  --role=roles/iam.workloadIdentityUser `
  --member="principalSet://iam.googleapis.com/projects/787708780695/locations/global/workloadIdentityPools/github/attribute.repository/BaerBonesTechnology/guildmark-website"