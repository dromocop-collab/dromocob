// Runs existing route handlers against in-memory dependencies. No credentials/network.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '../..');
const dep = createRequire(path.join(process.env.PACK_TEST_DEPENDENCIES || root, 'package.json'));
const ts = dep('typescript');
let auth = false, limited = false, writes = [];
const query = { where() { return this; }, orderBy() { return this; }, limit() { return this; },
  async get() { return { size: 1, docs: [{ id: 'fixture', data: () => ({ title: 'Existing request', status: 'new' }) }] }; },
  doc(id) { return { id: id || 'fixture' }; } };
const db = { collection(name) { assert(['ultra_requests', 'ultra_request_rate_limits'].includes(name)); return query; },
  async runTransaction(fn) { await fn({ get: async () => ({ data: () => limited ? { lastSubmittedAt: { toMillis: () => Date.now() } } : {} }), set: (...args) => writes.push(args) }); } };
class Timestamp { static now() { return new Timestamp(); } }
function load(file) {
  const output = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, Response, Request, URL, Buffer, Error, console,
    process: { env: {} }, require(name) {
      if (name === '@/lib/firebase-admin') return { adminDb: db };
      if (name === 'firebase-admin/firestore') return { Timestamp, FieldValue: { serverTimestamp: () => 'mock-time' } };
      if (name === '@/lib/admin-guard') return { requireAdminRole: async () => { if (!auth) throw new Error('UNAUTHORIZED'); } };
      return require(name);
    } });
  return exports;
}
(async () => {
  const admin = load('app/api/admin/ultra/requests/route.ts');
  assert.equal((await admin.GET(new Request('https://test/api/admin/ultra/requests'))).status, 401);
  auth = true;
  const inbox = await admin.GET(new Request('https://test/api/admin/ultra/requests?status=new'));
  assert.equal(inbox.status, 200); assert.equal((await inbox.json()).requests[0].id, 'fixture');
  const invalidPatch = await admin.PATCH(new Request('https://test/api/admin/ultra/requests', { method: 'PATCH', body: '{}' }));
  assert.equal(invalidPatch.status, 400);
  const publicRoute = load('app/api/ultra/requests/route.ts');
  assert.equal((await publicRoute.OPTIONS()).status, 204);
  assert.equal((await publicRoute.POST(new Request('https://test/api/ultra/requests', { method: 'POST', body: '{}' }))).status, 400);
  const request = () => new Request('https://test/api/ultra/requests', { method: 'POST', body: JSON.stringify({ title: 'Test request', description: 'Regression fixture' }) });
  assert.equal((await publicRoute.POST(request())).status, 201);
  assert.equal(writes.length, 2); assert.equal(writes[1][1].productId, 'dromocob-ultra-ae');
  limited = true;
  assert.equal((await publicRoute.POST(request())).status, 429);
  const finalcut = JSON.parse(fs.readFileSync(path.join(root, 'public/downloads/finalcut/manifest.json')));
  assert.equal(finalcut.productId, 'dromocob-ultra-finalcut');
  assert.match(finalcut.version, /^\d+\.\d+\.\d+$/); assert.match(finalcut.sha256, /^[a-f0-9]{64}$/);
  assert.match(finalcut.downloadURL, /^https:\/\/dromocob\.tr\/downloads\/finalcut\//);
  const packs = JSON.parse(fs.readFileSync(path.join(root, 'public/downloads/ultra/packs/manifest.json')));
  assert.equal(packs.schemaVersion, 1); assert.deepEqual(packs.packs, []);
  console.log('PASS: Request Center auth/list/create/validation/rate limit (mock DB); Final Cut manifest; new empty pack manifest');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
