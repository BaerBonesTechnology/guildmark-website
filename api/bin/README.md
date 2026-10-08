# GuildMark API (Dart Frog)

HTTP layer for GuildMark. Uses Appwrite Cloud for state and an in-process
`ValuationService` for deterministic estimates and depreciation. See
[deployment instructions](../../docs/deployment.md).

## Layout

```
api/
├── routes/                 File-based routing — every .dart file is an endpoint
│   ├── _middleware.dart    Global CORS + JSON middleware
│   ├── auth/               login, signup, refresh, logout
│   ├── marketplace/        Public listings (auth optional for read)
│   ├── seller/             Seller-side listings + offer responses
│   ├── buyer/              Buyer-side offers
│   ├── assets/             Manual assets
│   ├── amps/               AMPS dashboard endpoints
│   └── valuation/          Native FMV + depreciation
├── lib/
│   ├── auth/               JWT, password hashing, session helpers
│   ├── appwrite/           Appwrite Cloud client and schema identifiers
│   ├── services/           Valuation, payments, shipping and email
│   ├── models/             Plain Dart classes mirroring src/app/lib/types.ts
│   └── repos/              Data-access layer (one file per aggregate)
└── test/
```

## Running

```bash
# One-time
dart pub get
dart pub global activate dart_frog_cli
dart run build_runner build --delete-conflicting-outputs   # generate freezed/json_serializable files

# Dev with hot reload
dart_frog dev

# Production build (single AOT binary)
dart_frog build
dart compile exe build/bin/server.dart -o build/bin/server
./build/bin/server
```

> **Codegen:** the model files in `lib/models/` are freezed data classes —
> they reference `*.freezed.dart` and `*.g.dart` parts that `build_runner`
> writes. Run `dart run build_runner build` after editing any model, or
> `dart run build_runner watch` while iterating.

## Conventions

- Routes return `Response.json(body: ...)` only. Never write to the response
  body directly.
- All DB access goes through a `Repository` class in `lib/repos/appwrite/`. Routes
  never touch SQL.
- Snake_case JSON in/out — matches the frontend types.
- All protected routes pull `userId` and `companyId` off the request context;
  middleware in `routes/_middleware.dart` populates this from the JWT.
