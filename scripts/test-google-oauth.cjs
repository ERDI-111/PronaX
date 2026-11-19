/**
 * PronaX Test Suite — Google sign-in / sign-up (end to end, no Google account needed)
 *
 * Usage:
 *   npm run build
 *   node scripts/test-google-oauth.cjs
 *
 * The script starts the production server on a free port and walks through the
 * whole "Vazhdo me Google" flow over HTTP. Google itself is replaced by a
 * stand-in: this same file is preloaded into the server process (NODE_OPTIONS
 * --require) and answers the two server-to-server calls (token + profile) the
 * way Google does, including its PKCE, redirect URI and client secret checks.
 * The application code is not changed for the test.
 *
 * Two checks run outside that server: the session cookie is verified inside
 * the runtime middleware.ts uses, and the Google addresses in the code are
 * compared with the ones Google publishes (skipped when offline).
 *
 * data/users.json is put back exactly as it was when the run ends, so do not
 * run this while you are using the site locally.
 */

const crypto = require('crypto');
const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

const TEST_CLIENT_ID = '1234567890-pronaxtest.apps.googleusercontent.com';
const TEST_CLIENT_SECRET = 'pronax-test-secret';

const encode = (value) => Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
const decode = (text) => JSON.parse(Buffer.from(text, 'base64url').toString('utf8'));

// ---------------------------------------------------------------------------
// Part 1 — stand-in for Google, active only inside the server under test
// ---------------------------------------------------------------------------

function installFakeGoogle() {
  const realFetch = globalThis.fetch;
  const usedCodes = new Set();

  const json = (status, body) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  async function token(request) {
    const form = new URLSearchParams(await request.text());
    const fail = (status, error, description) => json(status, { error, error_description: description });

    if (form.get('client_id') !== TEST_CLIENT_ID) return fail(401, 'invalid_client', 'The OAuth client was not found.');
    if (form.get('client_secret') !== TEST_CLIENT_SECRET) return fail(401, 'invalid_client', 'Unauthorized');
    if (form.get('grant_type') !== 'authorization_code') return fail(400, 'unsupported_grant_type', 'Invalid grant_type');

    const code = form.get('code') || '';
    let grant;
    try {
      grant = decode(code);
    } catch {
      return fail(400, 'invalid_grant', 'Malformed auth code.');
    }
    if (usedCodes.has(code)) return fail(400, 'invalid_grant', 'Bad Request');
    usedCodes.add(code);

    if (form.get('redirect_uri') !== grant.redirectUri) return fail(400, 'redirect_uri_mismatch', 'Bad Request');
    const challenge = crypto.createHash('sha256').update(form.get('code_verifier') || '').digest('base64url');
    if (challenge !== grant.challenge) return fail(400, 'invalid_grant', 'Invalid code verifier.');

    return json(200, {
      access_token: `fake-access-token.${encode(grant.profile)}`,
      expires_in: 3599,
      scope: 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      token_type: 'Bearer',
    });
  }

  function userinfo(request) {
    const match = /^Bearer fake-access-token\.(.+)$/.exec(request.headers.get('authorization') || '');
    if (!match) return json(401, { error: 'invalid_request', error_description: 'Invalid Credentials' });
    return json(200, decode(match[1]));
  }

  globalThis.fetch = async function fakeGoogleFetch(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url === TOKEN_URL) return token(new Request(input, init));
    if (url === USERINFO_URL) return userinfo(new Request(input, init));
    return realFetch.call(this, input, init);
  };
}

if (require.main !== module) {
  if (process.env.PRONAX_FAKE_GOOGLE === '1') installFakeGoogle();
  return;
}

// ---------------------------------------------------------------------------
// Part 2 — the test run
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ADMIN_EMAIL = 'pronaxestate@outlook.com';

let passedTests = 0;
let failedTests = 0;
/** Session cookies issued by the server during the run, re-checked in section [11]. */
const issuedSessions = { user: '', admin: '' };

function assert(condition, testName, details = '') {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
  }
}

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      // Port 10000 is treated by the app as Render's internal port
      probe.close(() => (port === 10000 ? freePort().then(resolve, reject) : resolve(port)));
    });
  });
}

async function withServer(extraEnv, run) {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const preload = `--require "${__filename.replace(/\\/g, '/')}"`;
  const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', String(port)], {
    cwd: ROOT,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      PRONAX_FAKE_GOOGLE: '1',
      AUTH_SECRET: '', // set here so that a value in .env.local cannot change the signing key during the run
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} ${preload}`.trim(),
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let log = '';
  child.stdout.on('data', (chunk) => (log += chunk));
  child.stderr.on('data', (chunk) => (log += chunk));
  const exited = new Promise((resolve) => child.once('exit', resolve));

  try {
    const deadline = Date.now() + 60_000;
    for (;;) {
      if (child.exitCode !== null) throw new Error(`The server stopped during startup:\n${log}`);
      try {
        const res = await fetch(`${base}/api/auth/google/status`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) break;
      } catch {}
      if (Date.now() > deadline) throw new Error(`The server did not start within 60 seconds:\n${log}`);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    await run(base);
  } finally {
    child.kill();
    await exited;
  }
}

/** A minimal browser: follows nothing automatically and remembers cookies. */
function createBrowser(base) {
  const cookies = new Map();
  return {
    cookies,
    async get(target, headers = {}) {
      const url = target.startsWith('http') ? target : base + target;
      const cookieHeader = [...cookies].map(([name, value]) => `${name}=${value}`).join('; ');
      const res = await fetch(url, {
        redirect: 'manual',
        headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}), ...headers },
      });
      const setCookies = res.headers.getSetCookie();
      for (const line of setCookies) {
        const [pair] = line.split(';');
        const name = pair.slice(0, pair.indexOf('=')).trim();
        const value = pair.slice(pair.indexOf('=') + 1).trim();
        if (!value || /max-age=0/i.test(line)) cookies.delete(name);
        else cookies.set(name, value);
      }
      return { status: res.status, location: res.headers.get('location') || '', setCookies, body: await res.text() };
    },
  };
}

/** What Google does after the person picks an account: send them back with a code. */
function approveAtGoogle(authUrl, profile) {
  const query = new URL(authUrl).searchParams;
  const code = encode({
    challenge: query.get('code_challenge'),
    redirectUri: query.get('redirect_uri'),
    profile,
    nonce: crypto.randomUUID(),
  });
  const back = new URL(query.get('redirect_uri'));
  back.searchParams.set('state', query.get('state'));
  back.searchParams.set('code', code);
  back.searchParams.set('scope', 'email profile openid');
  back.searchParams.set('authuser', '0');
  back.searchParams.set('prompt', 'consent');
  return back.toString();
}

function googleProfile(email, overrides = {}) {
  return {
    sub: crypto.createHash('sha1').update(email).digest('hex').slice(0, 21),
    name: 'Arta Krasniqi',
    given_name: 'Arta',
    family_name: 'Krasniqi',
    picture: 'https://lh3.googleusercontent.com/a/test-photo=s96-c',
    email,
    email_verified: true,
    ...overrides,
  };
}

async function signIn(base, profile, startPath = '/api/auth/google') {
  const browser = createBrowser(base);
  const start = await browser.get(startPath);
  const callback = await browser.get(approveAtGoogle(start.location, profile));
  return { browser, start, callback };
}

const hasCookie = (response, name) => response.setCookies.some((line) => line.startsWith(`${name}=`) && !/max-age=0/i.test(line));
const errorOf = (response) => {
  try {
    const url = new URL(response.location);
    return url.pathname === '/kycu' ? url.searchParams.get('error') : null;
  } catch {
    return null;
  }
};

async function testConfigured(base) {
  console.log('\n[1] Starting the sign-in');
  const visitor = createBrowser(base);
  const start = await visitor.get('/api/auth/google?redirectTo=%2Fpubliko');
  const auth = new URL(start.location || 'http://invalid.invalid');
  const flowCookie = start.setCookies.find((line) => line.startsWith('pronax_google_oauth=')) || '';

  assert(start.status === 307 || start.status === 302, 'The button redirects the browser', `status ${start.status}`);
  assert(auth.origin + auth.pathname === AUTH_URL, 'The redirect goes to Google', start.location);
  assert(auth.searchParams.get('client_id') === TEST_CLIENT_ID, 'client_id is sent');
  assert(auth.searchParams.get('redirect_uri') === `${base}/api/auth/callback/google`, 'redirect_uri is this site\'s callback', auth.searchParams.get('redirect_uri'));
  assert(auth.searchParams.get('response_type') === 'code', 'response_type is code');
  assert(['openid', 'email', 'profile'].every((scope) => (auth.searchParams.get('scope') || '').split(' ').includes(scope)), 'scope asks for openid, email and profile');
  assert((auth.searchParams.get('state') || '').length >= 32, 'A random state value is sent');
  assert((auth.searchParams.get('code_challenge') || '').length === 43 && auth.searchParams.get('code_challenge_method') === 'S256', 'A PKCE challenge (S256) is sent');
  assert(/httponly/i.test(flowCookie) && /path=\/api\/auth/i.test(flowCookie), 'The pending sign-in is kept in an httpOnly cookie', flowCookie);
  assert(!start.location.includes(TEST_CLIENT_SECRET), 'The client secret never reaches the browser');
  assert(!hasCookie(start, 'pronax_verified_login'), 'Starting the flow does not log anyone in');

  const second = await createBrowser(base).get('/api/auth/google');
  assert(new URL(second.location).searchParams.get('state') !== auth.searchParams.get('state'), 'Every attempt gets a new state value');

  console.log('\n[2] Coming back from Google');
  const callback = await visitor.get(approveAtGoogle(start.location, googleProfile('arta.test@gmail.com')));
  const session = callback.setCookies.find((line) => line.startsWith('pronax_session=')) || '';
  assert(callback.status === 200, 'The callback succeeds', `status ${callback.status} ${callback.location}`);
  assert(visitor.cookies.get('pronax_verified_login') === encodeURIComponent('arta.test@gmail.com'), 'The login cookie holds the Google email', visitor.cookies.get('pronax_verified_login'));
  assert(/httponly/i.test(session), 'A signed httpOnly session cookie is issued');
  assert(!visitor.cookies.has('pronax_google_oauth'), 'The pending sign-in cookie is removed');
  assert(callback.body.includes('"email":"arta.test@gmail.com"') && callback.body.includes('"authProvider":"google"'), 'The page stores the user for the header');
  assert(callback.body.includes('window.location.replace("/publiko")'), 'The visitor continues to the page they wanted');

  const replay = await visitor.get(approveAtGoogle(start.location, googleProfile('arta.test@gmail.com')));
  assert(errorOf(replay) === 'google_session_expired', 'A callback link cannot be used twice', replay.location);

  const again = await signIn(base, googleProfile('arta.test@gmail.com'));
  assert(again.callback.status === 200 && again.callback.body.includes('window.location.replace("/dashboard/pronat")'), 'Signing in again reuses the account and opens the dashboard');

  const admin = await signIn(base, googleProfile(ADMIN_EMAIL, { name: 'Admin' }));
  assert(admin.callback.body.includes('"role":"admin"') && admin.callback.body.includes('window.location.replace("/admin/dashboard")'), 'The administrator lands on the admin panel');

  console.log('\n[3] Things that must be refused');
  const forged = createBrowser(base);
  const forgedStart = await forged.get('/api/auth/google');
  const forgedUrl = new URL(approveAtGoogle(forgedStart.location, googleProfile('victim@gmail.com')));
  forgedUrl.searchParams.set('state', 'attacker-chosen-state');
  const forgedCallback = await forged.get(forgedUrl.toString());
  assert(errorOf(forgedCallback) === 'google_session_expired' && !hasCookie(forgedCallback, 'pronax_verified_login'), 'A wrong state value is rejected');

  const stranger = await createBrowser(base).get(approveAtGoogle(start.location, googleProfile('victim@gmail.com')));
  assert(errorOf(stranger) === 'google_session_expired' && !hasCookie(stranger, 'pronax_verified_login'), 'A callback without a started sign-in is rejected');

  const cancel = createBrowser(base);
  const cancelStart = await cancel.get('/api/auth/google?redirectTo=%2Fpubliko');
  const cancelState = new URL(cancelStart.location).searchParams.get('state');
  const cancelled = await cancel.get(`/api/auth/callback/google?error=access_denied&state=${cancelState}`);
  assert(errorOf(cancelled) === 'google_cancelled' && new URL(cancelled.location).searchParams.get('redirectTo') === '/publiko', 'Cancelling at Google returns to the login page with a message', cancelled.location);

  const unverified = await signIn(base, googleProfile('unverified.test@example.com', { email_verified: false }));
  assert(errorOf(unverified.callback) === 'google_email_unverified' && !hasCookie(unverified.callback, 'pronax_verified_login'), 'An unverified Google email is refused', unverified.callback.location);

  const tampered = createBrowser(base);
  const tamperedStart = await tampered.get('/api/auth/google');
  const tamperedUrl = new URL(approveAtGoogle(tamperedStart.location, googleProfile('victim@gmail.com')));
  tamperedUrl.searchParams.set('code', 'not-a-real-code');
  const tamperedCallback = await tampered.get(tamperedUrl.toString());
  assert(errorOf(tamperedCallback) === 'google_failed' && !hasCookie(tamperedCallback, 'pronax_verified_login'), 'A code Google does not accept is refused', tamperedCallback.location);

  const pkce = createBrowser(base);
  const pkceStart = await pkce.get('/api/auth/google');
  const pkceAuth = new URL(pkceStart.location);
  pkceAuth.searchParams.set('code_challenge', 'A'.repeat(43)); // a code issued for a different verifier
  const pkceCallback = await pkce.get(approveAtGoogle(pkceAuth.toString(), googleProfile('victim@gmail.com')));
  assert(errorOf(pkceCallback) === 'google_failed' && !hasCookie(pkceCallback, 'pronax_verified_login'), 'A code issued for another browser (PKCE mismatch) is refused', pkceCallback.location);

  const oldTrick = await createBrowser(base).get('/api/auth/google?email=victim%40gmail.com');
  assert(!hasCookie(oldTrick, 'pronax_verified_login') && new URL(oldTrick.location).origin === 'https://accounts.google.com', 'An email in the link can no longer log anyone in');

  const fastTest = await fetch(`${base}/api/auth/google/fast-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL }),
  });
  assert(fastTest.status === 404 || fastTest.status === 405, 'The instant test login is gone', `status ${fastTest.status}`);

  for (const headers of [{ 'Next-Router-Prefetch': '1' }, { Purpose: 'prefetch' }, { 'Sec-Purpose': 'prefetch;prerender' }]) {
    const prefetch = await createBrowser(base).get('/api/auth/google', headers);
    assert(prefetch.status === 400 && prefetch.setCookies.length === 0 && !prefetch.location, `A prefetch (${Object.keys(headers)[0]}) starts nothing`, `status ${prefetch.status}`);
  }

  console.log('\n[4] Safe redirects and safe output');
  for (const target of ['//evil.example/x', 'https://evil.example/x', '/\\evil.example', '/api/auth/logout', 'javascript:alert(1)']) {
    const attempt = await signIn(base, googleProfile('arta.test@gmail.com'), `/api/auth/google?redirectTo=${encodeURIComponent(target)}`);
    assert(attempt.callback.body.includes('window.location.replace("/dashboard/pronat")'), `redirectTo=${target} falls back to the dashboard`);
  }

  const hostile = await signIn(base, googleProfile('hostile.test@example.com', { name: '</script><script>alert(1)</script>' }));
  assert(hostile.callback.status === 200 && !hostile.callback.body.includes('<script>alert(1)') && hostile.callback.body.includes('\\u003c/script\\u003e'), 'A name with HTML in it cannot inject a script');

  console.log('\n[5] Behind a reverse proxy (Render)');
  const proxied = await createBrowser(base).get('/api/auth/google', { 'X-Forwarded-Host': 'pronax.onrender.com', 'X-Forwarded-Proto': 'https' });
  const proxiedCookie = proxied.setCookies.find((line) => line.startsWith('pronax_google_oauth=')) || '';
  assert(new URL(proxied.location).searchParams.get('redirect_uri') === 'https://pronax.onrender.com/api/auth/callback/google', 'redirect_uri uses the public https address');
  assert(/;\s*secure/i.test(proxiedCookie), 'Cookies are marked Secure on https');

  console.log('\n[6] Status and logout');
  const statusText = await (await fetch(`${base}/api/auth/google/status`)).text();
  const status = JSON.parse(statusText);
  assert(status.configured === true && status.authorizedRedirectUri === `${base}/api/auth/callback/google`, 'The status page reports the redirect URI to register');
  assert(!statusText.includes(TEST_CLIENT_SECRET) && !statusText.includes(TEST_CLIENT_ID), 'The status page shows no credentials');

  const logout = await fetch(`${base}/api/auth/logout`, { method: 'POST' });
  const cleared = logout.headers.getSetCookie();
  assert(logout.ok && ['pronax_session', 'pronax_verified_login'].every((name) => cleared.some((line) => line.startsWith(`${name}=;`) && /max-age=0/i.test(line))), 'Logout clears both login cookies');

  console.log('\n[7] Pages behind the login');
  // The middleware only enforces logins when the build has the Supabase variables; otherwise every page is open.
  const enforced = (await createBrowser(base).get('/dashboard/pronat')).status !== 200;
  console.log(`  (middleware ${enforced ? 'enforces logins in this build' : 'is in open demo mode in this build: no Supabase variables'})`);
  const dashboard = await visitor.get('/dashboard/pronat');
  assert(dashboard.status === 200, 'The dashboard opens after a Google sign-in', `status ${dashboard.status} ${dashboard.location}`);
  const adminPanel = await admin.browser.get('/admin/dashboard');
  assert(adminPanel.status === 200, 'The admin panel opens for the administrator', `status ${adminPanel.status} ${adminPanel.location}`);
  if (enforced) {
    const blocked = await visitor.get('/admin/dashboard');
    assert(blocked.status === 307 && blocked.location.endsWith('/dashboard/pronat'), 'The admin panel stays closed to other Google users', `status ${blocked.status} ${blocked.location}`);
  }
  issuedSessions.user = visitor.cookies.get('pronax_session') || '';
  issuedSessions.admin = admin.browser.cookies.get('pronax_session') || '';
}

async function testNotConfigured(base) {
  console.log('\n[8] Without Google credentials');
  const start = await createBrowser(base).get('/api/auth/google?redirectTo=%2Fpubliko');
  assert(errorOf(start) === 'google_not_configured' && start.setCookies.length === 0, 'The button explains that Google sign-in is not set up', start.location);
  assert(new URL(start.location).searchParams.get('redirectTo') === '/publiko', 'The page the visitor wanted is remembered');
  const status = await (await fetch(`${base}/api/auth/google/status`)).json();
  assert(status.configured === false && status.problems.length === 2, 'The status page lists what is missing');
}

async function testWrongCredentials(base) {
  console.log('\n[9] With a wrong client secret');
  const attempt = await signIn(base, googleProfile('arta.test@gmail.com'));
  assert(errorOf(attempt.callback) === 'google_credentials_rejected' && !hasCookie(attempt.callback, 'pronax_verified_login'), 'A rejected secret is reported as a configuration problem', attempt.callback.location);
}

async function testInvalidClientId(base) {
  console.log('\n[10] With something that is not a client ID');
  const start = await createBrowser(base).get('/api/auth/google');
  assert(errorOf(start) === 'google_config_invalid', 'A malformed GOOGLE_CLIENT_ID is reported', start.location);
}

/**
 * middleware.ts runs in Next's Edge sandbox, a separate JavaScript realm with
 * stricter Web Crypto rules than route handlers. Run the real session code in
 * that sandbox against the cookies the server issued above.
 */
async function testSessionInMiddlewareRuntime() {
  console.log('\n[11] Session cookie inside the middleware runtime');
  let result = {};
  try {
    const { EdgeRuntime } = require('next/dist/compiled/edge-runtime');
    const ts = require('typescript');
    const source = fs.readFileSync(path.join(ROOT, 'lib', 'auth', 'session.ts'), 'utf8');
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const [payload, signature] = issuedSessions.user.split('.');
    const edited = `${encode({ ...decode(payload), role: 'admin' })}.${signature}`;
    const runtime = new EdgeRuntime({
      extend: (context) => Object.assign(context, { process: { env: { GOOGLE_CLIENT_SECRET: TEST_CLIENT_SECRET } } }),
    });
    result = await runtime.evaluate(`(async () => {
      const exports = {};
      ${compiled}
      return {
        user: await exports.verifySessionToken(${JSON.stringify(issuedSessions.user)}),
        admin: await exports.verifySessionToken(${JSON.stringify(issuedSessions.admin)}),
        edited: await exports.verifySessionToken(${JSON.stringify(edited)}),
        fresh: await exports.verifySessionToken(await exports.createSessionToken({ email: 'Edge.Test@Gmail.com', role: 'user' })),
      };
    })()`);
  } catch (err) {
    result = { error: String(err && err.message ? err.message : err) };
  }
  assert(result.user?.email === 'arta.test@gmail.com' && result.user?.role === 'user', 'The middleware accepts the session cookie issued at sign-in', result.error || JSON.stringify(result.user));
  assert(result.admin?.email === ADMIN_EMAIL && result.admin?.role === 'admin', 'The middleware sees the administrator role', result.error || JSON.stringify(result.admin));
  assert(result.edited === null, 'Editing the role inside the cookie does not make anyone an administrator', result.error || JSON.stringify(result.edited));
  assert(result.fresh?.email === 'edge.test@gmail.com', 'A cookie can also be issued inside the middleware runtime', result.error || JSON.stringify(result.fresh));
}

/** The one check that contacts the real Google: the addresses used above must be the ones Google publishes. */
async function testPublishedGoogleAddresses() {
  console.log('\n[12] Addresses published by Google');
  let published;
  try {
    const res = await fetch('https://accounts.google.com/.well-known/openid-configuration', { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    published = await res.json();
  } catch (err) {
    console.log(`  (skipped: accounts.google.com could not be reached from this computer: ${err.message})`);
    return;
  }
  assert(published.authorization_endpoint === AUTH_URL, 'The sign-in address is the one Google publishes', published.authorization_endpoint);
  assert(published.token_endpoint === TOKEN_URL, 'The token address is the one Google publishes', published.token_endpoint);
  assert(published.userinfo_endpoint === USERINFO_URL, 'The profile address is the one Google publishes', published.userinfo_endpoint);
  assert((published.code_challenge_methods_supported || []).includes('S256'), 'Google accepts the PKCE method in use (S256)');
  assert((published.token_endpoint_auth_methods_supported || []).includes('client_secret_post'), 'Google accepts the client secret the way it is sent');
}

async function main() {
  console.log('PronaX — Google sign-in test');
  if (!fs.existsSync(path.join(ROOT, '.next', 'BUILD_ID'))) {
    console.error('No production build found. Run "npm run build" first.');
    process.exit(1);
  }

  const hadDataDir = fs.existsSync(DATA_DIR);
  const usersBefore = fs.existsSync(USERS_FILE) ? fs.readFileSync(USERS_FILE) : null;

  try {
    const good = { GOOGLE_CLIENT_ID: TEST_CLIENT_ID, GOOGLE_CLIENT_SECRET: TEST_CLIENT_SECRET };
    await withServer(good, testConfigured);
    await withServer({ GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '' }, testNotConfigured);
    await withServer({ ...good, GOOGLE_CLIENT_SECRET: 'some-other-secret' }, testWrongCredentials);
    await withServer({ ...good, GOOGLE_CLIENT_ID: 'my-google-project' }, testInvalidClientId);
    await testSessionInMiddlewareRuntime();
    await testPublishedGoogleAddresses();
  } finally {
    if (usersBefore) fs.writeFileSync(USERS_FILE, usersBefore);
    else fs.rmSync(USERS_FILE, { force: true });
    if (!hadDataDir && fs.existsSync(DATA_DIR) && fs.readdirSync(DATA_DIR).length === 0) fs.rmdirSync(DATA_DIR);
  }

  console.log(`\nResult: ${passedTests} passed, ${failedTests} failed`);
  process.exit(failedTests === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
