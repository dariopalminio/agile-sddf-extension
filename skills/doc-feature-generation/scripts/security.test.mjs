#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtempSync, mkdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, sep } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { safeOutput } from './safe-output.mjs';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { authenticate } = require('../examples/input/order-desk/src/middleware/authenticate.js');

function workspace(t) {
  const tempRoot = join(realpathSync(process.cwd()), '.tmp');
  mkdirSync(tempRoot, { recursive: true });
  const dir = mkdtempSync(join(tempRoot, 'doc-feature-security-'));
  t.after(() => {
    const resolved = realpathSync(dir);
    const rel = relative(tempRoot, resolved);
    assert.ok(rel && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
    rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  return dir;
}

function run(script, cwd, args) {
  return spawnSync(process.execPath, [join(scriptsDir, script), ...args], { cwd, encoding: 'utf8' });
}

test('output redacts credentials and absolute host paths', () => {
  const token = `sk-${'a'.repeat(24)}`;
  const output = safeOutput({ detail: `Authorization: Bearer ${token} at C:\\Users\\private\\file.txt` });
  assert.doesNotMatch(output.detail, /sk-a|C:\\Users|Bearer sk-/);
  assert.match(output.detail, /\[redacted/);
});

test('validator rejects an inventory outside its root', (t) => {
  const dir = workspace(t);
  mkdirSync(join(dir, 'features'));
  writeFileSync(join(dir, 'outside.md'), '# Private inventory\n');
  const result = run('validate-feature-tree.mjs', dir, ['--root', 'features', '--inventory', '../outside.md']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /inventory must stay inside the root/);
  assert.doesNotMatch(result.stderr, /Private inventory|outside\.md/);
});

test('validator rejects a linked default inventory', (t) => {
  const dir = workspace(t);
  const root = join(dir, 'features');
  mkdirSync(root);
  writeFileSync(join(dir, 'outside.md'), '# Private inventory\n');
  try {
    symlinkSync(join(dir, 'outside.md'), join(root, 'feature-inventory.md'), 'file');
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'ENOTSUP') return t.skip('file symlinks are unavailable');
    throw error;
  }
  const result = run('validate-feature-tree.mjs', dir, ['--root', 'features']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /inventory must be a regular file inside the root/);
  assert.doesNotMatch(result.stderr, /Private inventory|outside\.md/);
});

test('validator does not echo an invalid feature line or raw arguments', (t) => {
  const dir = workspace(t);
  const root = join(dir, 'features');
  const featureDir = join(root, 'ordering', 'manage-orders');
  mkdirSync(featureDir, { recursive: true });
  const token = `sk-${'b'.repeat(24)}`;
  writeFileSync(join(featureDir, 'cancel-order.feature'), `${token}\n@proposed\nFeature: Cancel an order\n  Scenario: Cancel\n    Given an order\n`);
  writeFileSync(join(root, 'feature-inventory.md'), 'ordering/manage-orders/cancel-order.feature\n');
  const result = run('validate-feature-tree.mjs', dir, ['--root', 'features']);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /not a keyword, step, table, tag or comment/);
  assert.doesNotMatch(result.stdout, /sk-b/);
  const invalid = run('validate-feature-tree.mjs', dir, ['--root', 'features', token]);
  assert.equal(invalid.status, 2);
  assert.doesNotMatch(invalid.stderr, /sk-b/);
});

test('scanner redacts tokens found in source evidence', (t) => {
  const dir = workspace(t);
  mkdirSync(join(dir, 'src'));
  const token = `sk-${'c'.repeat(24)}`;
  writeFileSync(join(dir, 'src', 'routes.js'), `router.get('/${token}', handler);\n`);
  const result = run('scan-entry-points.mjs', dir, ['--root', '.']);
  assert.equal(result.status, 0);
  assert.doesNotMatch(result.stdout, /sk-c/);
  assert.match(result.stdout, /\[redacted token\]/);
});

test('identity headers require a valid gateway signature', (t) => {
  const previous = process.env.ORDER_DESK_GATEWAY_SECRET;
  const secret = 'a'.repeat(32);
  process.env.ORDER_DESK_GATEWAY_SECRET = secret;
  t.after(() => {
    if (previous === undefined) delete process.env.ORDER_DESK_GATEWAY_SECRET;
    else process.env.ORDER_DESK_GATEWAY_SECRET = previous;
  });

  function request(headers) {
    const req = { get: (name) => headers[name], user: null };
    const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    let nextCalled = false;
    authenticate(req, res, () => { nextCalled = true; });
    return { req, res, nextCalled };
  }

  const timestamp = String(Date.now());
  const headers = { 'x-user-id': 'c-1', 'x-user-role': 'warehouse', 'x-gateway-timestamp': timestamp };
  const unsigned = request(headers);
  assert.equal(unsigned.res.code, 401);
  assert.equal(unsigned.nextCalled, false);

  headers['x-gateway-signature'] = createHmac('sha256', secret).update(`${timestamp}\nc-1\nwarehouse`).digest('hex');
  const signed = request(headers);
  assert.equal(signed.nextCalled, true);
  assert.deepEqual(signed.req.user, { id: 'c-1', role: 'warehouse' });

  const forged = request({ ...headers, 'x-user-role': 'support' });
  assert.equal(forged.res.code, 401);
  assert.equal(forged.nextCalled, false);
});
