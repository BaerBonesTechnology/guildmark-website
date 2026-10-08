# GuildMark API

The runtime is a single native Dart Frog API with Appwrite Cloud as its datastore.
Valuation and depreciation formulas run in-process through `ValuationService`;
Python and PostgreSQL are no longer runtime dependencies.

The Dart package lives in `api/bin/`. After configuring the environment described
in the root `.env.example`, run:

```bash
cd api/bin
dart pub get --enforce-lockfile
dart test
dart_frog dev
```

From the repository root, `./start.sh` starts local API/frontend containers;
`./start.sh --prod` starts only the production API container.
See [deployment and migration instructions](../docs/deployment.md) for Appwrite
Cloud, Cloudflare Pages, HTTPS ingress, and retiring legacy containers safely.

`migrations/` and the Postgres repositories are retained as migration history.
`ml-qv/` at the repository root is retained for offline model research.
Neither is used by the production request pipeline.
