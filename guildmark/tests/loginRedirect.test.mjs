import test from 'node:test';
import assert from 'node:assert/strict';
import { loginDestination, loginPathFor } from '../src/app/services/loginRedirect.service.ts';

test('protected preview and launched routes use the matching sign-in path', () => {
  assert.equal(loginPathFor('/pre/amps/assistant'), '/pre/login');
  assert.equal(loginPathFor('/amps/assistant'), '/login');
  assert.equal(loginPathFor('/preview/amps'), '/login');
});

test('successful login returns to intended assistant including query and fragment', () => {
  assert.equal(loginDestination('/pre/login', { returnTo: '/pre/amps/assistant?filter=laptop#results' }), '/pre/amps/assistant?filter=laptop#results');
  assert.equal(loginDestination('/login', { returnTo: '/amps/assistant' }), '/amps/assistant');
});

test('direct login or malformed state uses the dashboard matching login mode', () => {
  assert.equal(loginDestination('/pre/login', null), '/pre/dashboard');
  assert.equal(loginDestination('/login', {}), '/dashboard');
  assert.equal(loginDestination('/login', { returnTo: { pathname: '/amps' } }), '/dashboard');
});

test('external, protocol-relative, encoded separators and login loops are rejected', () => {
  for (const returnTo of ['https://evil.example/', '//evil.example/', '/\\evil.example/', '/%2f%2fevil.example', '/%5cevil.example', '/\nevil.example', '/login', '/login?next=/amps', '/pre/login/', '/foo/../login', '/pre/%6cogin', '/%zz']) {
    assert.equal(loginDestination('/pre/login', { returnTo }), '/pre/dashboard', returnTo);
  }
});
