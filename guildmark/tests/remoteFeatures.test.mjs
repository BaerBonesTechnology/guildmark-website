import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parsePublicFeatures,
  fetchPublicFeatures,
} from "../src/app/services/remoteFeatures.service.ts";
test("only explicitly true boolean flags enable features", () => {
  assert.deepEqual(
    parsePublicFeatures({
      flags: { launch_enabled: true, amps_enabled: "true", secret: "hidden" },
    }),
    { launch_enabled: true, amps_enabled: false },
  );
  for (const body of [null, {}, [], { flags: null }, { flags: "true" }])
    assert.deepEqual(parsePublicFeatures(body), {
      launch_enabled: false,
      amps_enabled: false,
    });
});
test("feature bootstrap omits credentials and uses a bounded fresh read", async () => {
  let seen;
  const flags = await fetchPublicFeatures("/api/", async (url, options) => {
    seen = { url, options };
    return new Response(
      JSON.stringify({ flags: { launch_enabled: true, amps_enabled: true } }),
    );
  });
  assert.deepEqual(flags, { launch_enabled: true, amps_enabled: true });
  assert.equal(seen.url, "/api/config/features");
  assert.equal(seen.options.credentials, "omit");
  assert.equal(seen.options.cache, "no-store");
  assert.ok(seen.options.signal instanceof AbortSignal);
});
test("feature outages and invalid payloads fail disabled", async () => {
  for (const request of [
    async () => new Response("no", { status: 503 }),
    async () => {
      throw new Error("offline");
    },
    async () => new Response("invalid"),
  ])
    assert.deepEqual(await fetchPublicFeatures("/api", request), {
      launch_enabled: false,
      amps_enabled: false,
    });
});
