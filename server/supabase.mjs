import { HttpError } from './http.mjs';

export class SupabaseError extends Error {
  constructor(status, body) {
    super('Supabase rejected the request.');
    this.status = status;
    this.code = body?.error_code ?? body?.code;
  }
}

function settings(env, admin) {
  const base = String(env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = admin ? env.SUPABASE_SECRET_KEY : env.SUPABASE_PUBLISHABLE_KEY;
  const prefix = admin ? 'sb_secret_' : 'sb_publishable_';
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base) || !key?.startsWith(prefix)) {
    throw new HttpError(503, 'The Supabase connection is not configured.');
  }
  return { base, key };
}

async function request(env, path, { method = 'GET', body, token, admin = false, prefer } = {}) {
  const { base, key } = settings(env, admin);
  const headers = new Headers({ apikey: key });
  if (token) headers.set('Authorization', 'Bearer ' + token);
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (prefer) headers.set('Prefer', prefer);
  const response = await fetch(base + path, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual', signal: AbortSignal.timeout(10_000),
  });
  // Workers supports manual redirects. Never forward a key to a new URL.
  if (response.status >= 300 && response.status < 400) throw new Error('Unexpected Supabase redirect.');
  const data = await response.text();
  const parsed = data ? JSON.parse(data) : null;
  if (!response.ok) throw new SupabaseError(response.status, parsed);
  return parsed;
}

export const auth = (env, path, options) => request(env, '/auth/v1/' + path, options);

export function data(env, resource, { query, ...options } = {}) {
  const search = query ? '?' + new URLSearchParams(query) : '';
  return request(env, '/rest/v1/' + resource + search, options);
}
