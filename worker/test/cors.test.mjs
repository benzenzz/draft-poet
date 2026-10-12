import { it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveCors } from '../src/http.js';

const req = (origin) => new Request('https://w.example/api/x', { headers: { Origin: origin } });
const url = new URL('https://w.example/api/x');

it('rejects localhost origins in prod config', () => {
  const r = resolveCors(req('http://localhost:8000'), { ALLOWED_ORIGIN: 'https://maiphh.github.io' }, url);
  assert.equal(r.corsOrigin, '');
});
it('allows localhost when ALLOWED_ORIGIN is localhost', () => {
  const r = resolveCors(req('http://127.0.0.1:5500'), { ALLOWED_ORIGIN: 'http://localhost:8000' }, url);
  assert.equal(r.corsOrigin, 'http://127.0.0.1:5500');
});
it('allows localhost with ALLOW_LOCALHOST_ORIGINS=1', () => {
  const r = resolveCors(req('http://localhost:3000'), { ALLOWED_ORIGIN: 'https://maiphh.github.io', ALLOW_LOCALHOST_ORIGINS: '1' }, url);
  assert.equal(r.corsOrigin, 'http://localhost:3000');
});
it('allows the configured prod origin', () => {
  const r = resolveCors(req('https://maiphh.github.io'), { ALLOWED_ORIGIN: 'https://maiphh.github.io' }, url);
  assert.equal(r.corsOrigin, 'https://maiphh.github.io');
});
