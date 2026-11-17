import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const app of ['guildmark', 'devdash', 'partners']) {
  test(`${app}: stale Doppler URL cannot send local auth to nginx port 8443`, async () => {
    const previous = process.env.VITE_API_URL;
    process.env.VITE_API_URL = 'http://localhost:8443';
    try {
      const { resolveConfig } = await import(pathToFileURL(path.join(root, app, 'node_modules/vite/dist/node/index.js')));
      const config = await resolveConfig({ root: path.join(root, app) }, 'serve');
      assert.equal(config.define['import.meta.env.VITE_API_URL'], '"/api"');
      assert.equal(config.server.proxy['/api'].target, process.env.GM_LOCAL_API_TARGET ?? 'http://127.0.0.1:8080');
    } finally {
      if (previous === undefined) delete process.env.VITE_API_URL;
      else process.env.VITE_API_URL = previous;
    }
  });
}
