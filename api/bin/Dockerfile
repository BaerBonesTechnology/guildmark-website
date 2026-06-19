FROM dart:3.12.1 AS build

WORKDIR /app
# Copy the lockfile too so the container resolves the exact pinned versions
# that build/.dart_tool/package_config.json will reference.
COPY pubspec.yaml pubspec.lock ./
RUN dart pub get

RUN dart pub global activate dart_frog_cli

COPY . .

RUN dart run build_runner build --delete-conflicting-outputs

RUN /root/.pub-cache/bin/dart_frog build

# Runtime: use dart to run the server directly (skip AOT compile due to freezed/json_serializable version mismatch).
# Because we JIT with `dart run` instead of AOT-compiling, the runtime needs the
# package SOURCES at startup. They live in the pub cache, which is OUTSIDE /app —
# so it must be copied in explicitly or every `package:` import fails to resolve.
FROM dart:3.12.1 AS runtime

WORKDIR /app

# Package sources required by `dart run` (JIT). Without this, package_config.json
# points at /root/.pub-cache paths that don't exist in this stage.
COPY --from=build /root/.pub-cache /root/.pub-cache

COPY --from=build /app /app

EXPOSE 8080
CMD ["dart", "run", "build/bin/server.dart"]
