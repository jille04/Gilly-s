import { auth, SupabaseError } from './supabase.mjs';
import { HttpError } from './http.mjs';

const names = {
  access: '__Host-gillys_customer',
  refresh: '__Host-gillys_refresh',
  verifier: '__Host-gillys_recovery_verifier',
  recovery: '__Host-gillys_recovery',
};

export function cookieValue(request, name) {
  const prefix = names[name] + '=';
  return (request.headers.get('Cookie') || '').split(/;\s*/).find(part => part.startsWith(prefix))?.slice(prefix.length);
}

function cookie(name, value, age = null) {
  const duration = age === null ? '' : '; Max-Age=' + age;
  return names[name] + '=' + value + duration + '; Path=/; Secure; HttpOnly; SameSite=Lax';
}

export const clearSession = () => [cookie('access', '', 0), cookie('refresh', '', 0)];
export const clearRecovery = () => cookie('recovery', '', 0);
export const clearVerifier = () => cookie('verifier', '', 0);
export const recoveryCookie = (tokens) => cookie('recovery', tokens.access_token, Math.min(600, tokens.expires_in));
export const verifierCookie = (verifier) => cookie('verifier', verifier, 3600);

export function sessionCookies(tokens) {
  return [cookie('access', tokens.access_token, tokens.expires_in), cookie('refresh', tokens.refresh_token)];
}

export async function currentCustomer(request, env, cookies) {
  const token = cookieValue(request, 'access');
  const refresh = cookieValue(request, 'refresh');
  if (token) {
    try {
      const user = await auth(env, 'user', { token });
      if (user?.id && user.email && !user.is_anonymous) return { user, token };
    } catch (error) {
      if (!(error instanceof SupabaseError) || ![401, 403].includes(error.status)) throw error;
    }
  }
  if (refresh) {
    try {
      const tokens = await auth(env, 'token?grant_type=refresh_token', {
        method: 'POST', body: { refresh_token: refresh },
      });
      if (tokens.user?.id && tokens.user.email && !tokens.user.is_anonymous) {
        cookies.push(...sessionCookies(tokens));
        return { user: tokens.user, token: tokens.access_token };
      }
    } catch (error) {
      if (!(error instanceof SupabaseError) || ![400, 401, 403].includes(error.status)) throw error;
    }
  }
  if (token || refresh) cookies.push(...clearSession());
  throw new HttpError(401, 'Please sign in to your Gilly’s account.');
}

export async function revokeSession(request, env) {
  try {
    const session = await currentCustomer(request, env, []);
    await auth(env, 'logout?scope=local', { method: 'POST', token: session.token });
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== 401) throw error;
  }
}

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export async function pkce() {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, params: { code_challenge: base64url(new Uint8Array(challenge)), code_challenge_method: 's256' } };
}

export function authMessage(error, kind) {
  if (!(error instanceof SupabaseError)) throw error;
  if (error.status === 429) throw new HttpError(429, 'Too many attempts. Please try again later.');
  if (error.code === 'email_not_confirmed') throw new HttpError(400, 'Confirm your email before signing in.');
  if (error.code === 'weak_password' || error.code === 'same_password') {
    throw new HttpError(400, 'Choose a different, stronger password.');
  }
  if (kind === 'signin' && [400, 401, 403, 422].includes(error.status)) {
    throw new HttpError(401, 'Email or password does not match our records.');
  }
  if (kind === 'signup' && ['email_exists', 'user_already_exists'].includes(error.code)) return;
  if (kind === 'recover' && error.code === 'user_not_found') return;
  if (error.status === 400 || error.status === 422) throw new HttpError(400, 'Check your details and try again.');
  throw error;
}
