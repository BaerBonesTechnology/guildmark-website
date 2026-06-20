# Multi-stage build: produce a tiny native binary, no Dart SDK at runtime.

FROM dart:3.12.1 AS build

WORKDIR /app
COPY pubspec.yaml .
RUN dart pub get

# Install dart_frog_cli to compile routes into a single entrypoint.
RUN dart pub global activate dart_frog_cli

COPY . .

# Generate freezed/json_serializable parts before dart_frog build, since the
# generated files are not committed.
RUN dart run build_runner build --delete-conflicting-outputs

RUN /root/.pub-cache/bin/dart_frog build
RUN dart compile exe build/bin/server.dart -o build/bin/server

# Runtime image — distroless-ish, AOT binary only.
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# WORKDIR must be /app/bin so the MigrationRunner's default relative path
# "../migrations" resolves to /app/migrations, which is volume-mounted from
# ./api/migrations in docker-compose.
WORKDIR /app/bin
COPY --from=build /app/build/bin/server ./server

EXPOSE 8080
CMD ["./server"]
