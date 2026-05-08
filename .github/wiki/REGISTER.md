# GuildMark — External Service Registration Checklist

Placeholder credentials are used in `.env` so the app starts locally without real accounts.
Replace each entry before going live.

---

## Required to Run (sandbox OK)

### Square (Payments)
- Register: https://developer.squareup.com/apps
- Vars: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT=sandbox`
- Placeholder: `sq0atp-PLACEHOLDER` / `PLACEHOLDER_LOCATION`

---

## Optional — app degrades gracefully when absent

### Resend (Email)
- Register: https://resend.com — verify domain `guildmark.co`
- Var: `RESEND_API_KEY`
- Placeholder: `re_PLACEHOLDER`

### Escrow.com
- Register: https://www.escrow-sandbox.com (sandbox) or https://www.escrow.com
- Vars: `ESCROW_API_KEY`, `ESCROW_EMAIL`, `ESCROW_ENVIRONMENT=sandbox`
- Placeholder: `escrow_PLACEHOLDER` / `noreply@guildmark.co`

### FedEx Track API
- Register: https://developer.fedex.com — create OAuth app
- Vars: `FEDEX_CLIENT_ID`, `FEDEX_CLIENT_SECRET`, `FEDEX_WEBHOOK_SECRET`, `FEDEX_ENVIRONMENT=sandbox`
- Placeholder: `fedex_client_PLACEHOLDER` / `fedex_secret_PLACEHOLDER`

### eBay Browse API (ML training data + market data)
- Register: https://developer.ebay.com/my/keys
- Vars: `EBAY_APP_ID`, `EBAY_CERT_ID`, `EBAY_DEV_ID`, `EBAY_SANDBOX=0`
- Placeholder: `EBAY-AppId-PLACEHOLDER` / `EBAY-CertId-PLACEHOLDER` / `EBAY-DevId-PLACEHOLDER`
- Without key: ML training uses synthetic data (confidence 0.40 fallback)

### BackMarket (Price Feed)
- Register: https://www.backmarket.com — partner API program (request access)
- Var: `BACKMARKET_API_KEY`
- Placeholder: `bm_PLACEHOLDER`

### Jamf Pro (MDM)
- Register: Your Jamf Pro instance → Settings → API Roles and Clients
- Vars: `JAMF_PRO_CLIENT_ID`, `JAMF_PRO_CLIENT_SECRET`
- Placeholder: `jamf_client_PLACEHOLDER` / `jamf_secret_PLACEHOLDER`

### Microsoft Intune (MDM)
- Register: https://portal.azure.com → Azure AD → App Registrations
- Grant `DeviceManagementManagedDevices.Read.All`
- Vars: `INTUNE_TENANT_ID`, `INTUNE_CLIENT_ID`, `INTUNE_CLIENT_SECRET`
- Placeholder: `00000000-0000-0000-0000-000000000000` for all three UUID fields

---

## Planned (not yet wired)

### GuildMark Wallet ACH (Square Payouts or Dwolla)
- For seller ACH payouts — Square: https://developer.squareup.com/docs/payouts-api
- Vars: `GM_WALLET_ACH_ROUTING`, `GM_WALLET_ACH_ACCOUNT`

---

## JWT Secrets (no registration — generate locally)

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

Vars: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
Placeholder: `CHANGEME_access_secret_min32chars` / `CHANGEME_refresh_secret_min32chars`

---

## ML Service (Python — not needed for main Docker stack)

```powershell
cd ml-qv
pip install -r requirements.txt
python -m training.train_valuation      # writes models/valuation.joblib
python -m training.train_depreciation   # writes models/depreciation.joblib
```

Place resulting `.joblib` files in `ml-qv/model_artifacts/` for Docker builds.
Without artifacts: service runs rules-based fallback (confidence 0.40).
