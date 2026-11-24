import { json as apiJson, readBody, requireMethod, HttpError, errorResponse } from '../../../server/http.mjs';
import { orderPage, transitionOrder, saveTaxTreatment } from '../../../server/orders.mjs';

const encoder = new TextEncoder();
const cookieName = '__Host-gillys_admin';
const lifetime = 8 * 60 * 60;

function json(body, status = 200, cookie) {
  const headers = { 'Cache-Control': 'no-store' };
  if (cookie) headers['Set-Cookie'] = cookie;
  return Response.json(body, { status, headers });
}

function sessionCookie(value, age) {
  return `${cookieName}=${value}; Max-Age=${age}; Path=/; Secure; HttpOnly; SameSite=Strict`;
}

async function equalCredentials(actual, expected) {
  const [a, b] = await Promise.all(
    [actual, expected].map(value => crypto.subtle.digest('SHA-256', encoder.encode(value)))
  );
  let difference = 0;
  const left = new Uint8Array(a);
  const right = new Uint8Array(b);
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}

async function sessionKey(env) {
  const material = encoder.encode(JSON.stringify([
    env.ADMIN_SESSION_SECRET, env.ADMIN_USERNAME, env.ADMIN_PASSWORD,
  ]));
  return crypto.subtle.importKey('raw', material, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
const now = () => Math.floor(Date.now() / 1000);

async function issueSession(env) {
  const nonce = hex(crypto.getRandomValues(new Uint8Array(16)));
  const payload = `${now() + lifetime}.${nonce}`;
  const signature = await crypto.subtle.sign('HMAC', await sessionKey(env), encoder.encode(payload));
  return `${payload}.${hex(new Uint8Array(signature))}`;
}

async function validSession(request, env) {
  const token = (request.headers.get('Cookie') || '').split(';')
    .map(part => part.trim()).find(part => part.startsWith(cookieName + '='))
    ?.slice(cookieName.length + 1);
  const match = token?.match(/^(\d{10,12}\.[a-f0-9]{32})\.([a-f0-9]{64})$/);
  if (!match || Number(match[1].split('.')[0]) <= now()) return false;
  const signature = Uint8Array.from(match[2].match(/../g), pair => parseInt(pair, 16));
  return crypto.subtle.verify('HMAC', await sessionKey(env), signature, encoder.encode(match[1]));
}

async function manageStore(request, env, action) {
  try {
    requireMethod(request, action === 'orders' ? 'GET' : 'POST');
    if (!adminConfigured(env)) throw new HttpError(503, 'Administrator sign-in is not configured.');
    if (!await validSession(request, env)) throw new HttpError(401, 'Your administrator session expired. Sign in again.');
    if (action === 'orders') return apiJson(await orderPage(env, new URL(request.url).searchParams));
    const body = await readBody(request);
    if (action === 'settings') return apiJson({ taxTreatment: await saveTaxTreatment(env, body.taxTreatment) });
    return apiJson(await transitionOrder(env, body, env.ADMIN_USERNAME));
  } catch (error) {
    return errorResponse(error, []);
  }
}

function adminConfigured(env) {
  return /^[a-z0-9._-]{3,24}$/.test(env.ADMIN_USERNAME || '') &&
    (env.ADMIN_PASSWORD?.length || 0) >= 16 && (env.ADMIN_SESSION_SECRET?.length || 0) >= 32;
}

export async function onRequest({ request, env, params }) {
  const { action } = params;
  if (['orders', 'status', 'settings'].includes(action)) return manageStore(request, env, action);
  if (!['login', 'logout', 'session'].includes(action)) return json(null, 404);
  const method = action === 'session' ? 'GET' : 'POST';
  if (request.method !== method) return json(null, 405);
  if (method === 'POST' && request.headers.get('Origin') !== new URL(request.url).origin) return json(null, 403);
  if (action === 'logout') return json(null, 200, sessionCookie('', 0));
  if (!adminConfigured(env)) {
    return json(null, 503);
  }

  if (action === 'session') {
    if (!await validSession(request, env)) return json(null, 401);
    return json({ username: env.ADMIN_USERNAME, name: "Gilly's Administrator", role: 'admin', active: true });
  }

  let credentials;
  try {
    credentials = await readBody(request, 4096);
  } catch (error) {
    return json(null, error instanceof HttpError ? error.status : 400);
  }
  if (typeof credentials?.username !== 'string' || typeof credentials?.password !== 'string') return json(null, 400);
  const matches = await equalCredentials(
    JSON.stringify([credentials.username, credentials.password]),
    JSON.stringify([env.ADMIN_USERNAME, env.ADMIN_PASSWORD])
  );
  if (!matches) return json(null, 401);
  return json(null, 200, sessionCookie(await issueSession(env), lifetime));
}
