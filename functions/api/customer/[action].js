import { auth } from '../../../server/supabase.mjs';
import { json, redirect, readBody, requireMethod, HttpError, errorResponse } from '../../../server/http.mjs';
import {
  cookieValue, clearSession, clearRecovery, clearVerifier, currentCustomer, sessionCookies,
  recoveryCookie, verifierCookie, revokeSession, pkce, authMessage,
} from '../../../server/customer-auth.mjs';
import { profile, saveProfile } from '../../../server/profiles.mjs';
import { orderPage, submitOrder, transitionOrder, taxTreatment } from '../../../server/orders.mjs';

const methods = {
  session: 'GET', signin: 'POST', signup: 'POST', logout: 'POST',
  recover: 'POST', reset: 'POST', recovery: 'GET', confirmed: 'GET',
  profile: 'POST', orders: 'GET', order: 'POST', pickup: 'POST', settings: 'GET',
};

function credentials(body, needsPassword = true, minimum = 1) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.');
  if (!needsPassword) return { email };
  const password = body.password;
  if (typeof password !== 'string' || password.length < minimum || password.length > 72) {
    throw new HttpError(400, minimum > 1 ? 'Enter a password of 8–72 characters.' : 'Enter your password.');
  }
  return { email, password };
}

async function signin(env, body) {
  try {
    return await auth(env, 'token?grant_type=password', { method: 'POST', body: credentials(body) });
  } catch (error) {
    authMessage(error, 'signin');
  }
}

async function register(env, url, body) {
  const { email, password } = credentials(body, true, 8);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.replace(/[\s-]/g, '') : '';
  if (name.length < 2 || name.length > 100 || !/^(?:09[0-9]{9})?$/.test(phone)) {
    throw new HttpError(400, 'Check your name and mobile number.');
  }
  const { params } = await pkce();
  const target = new URL('/api/customer/confirmed', url);
  try {
    const result = await auth(env, 'signup?redirect_to=' + encodeURIComponent(target.href), {
      method: 'POST', body: { email, password, data: { name, phone }, ...params },
    });
    if (result.access_token) await auth(env, 'logout?scope=local', { method: 'POST', token: result.access_token });
  } catch (error) {
    authMessage(error, 'signup');
  }
}

async function recover(env, url, body) {
  const { email } = credentials(body, false);
  const { verifier, params } = await pkce();
  const target = new URL('/api/customer/recovery', url);
  try {
    await auth(env, 'recover?redirect_to=' + encodeURIComponent(target.href), {
      method: 'POST', body: { email, ...params },
    });
  } catch (error) {
    authMessage(error, 'recover');
  }
  return verifierCookie(verifier);
}

async function recoveryCallback(request, env, url) {
  const code = url.searchParams.get('code');
  const verifier = cookieValue(request, 'verifier');
  const cookies = [clearVerifier(), clearRecovery()];
  if (code && verifier && code.length < 256) {
    try {
      const tokens = await auth(env, 'token?grant_type=pkce', {
        method: 'POST', body: { auth_code: code, code_verifier: verifier },
      });
      return redirect('/?auth=reset', [...cookies, recoveryCookie(tokens)]);
    } catch { /* Expired or already-used recovery links can be requested again. */ }
  }
  return redirect('/?auth=expired', cookies);
}

async function reset(request, env, body) {
  const token = cookieValue(request, 'recovery');
  if (!token) throw new HttpError(400, 'This reset link has expired. Request a new one.');
  const password = body.password;
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    throw new HttpError(400, 'Enter a password of 8–72 characters.');
  }
  try {
    await auth(env, 'user', { method: 'PUT', token, body: { password } });
    await auth(env, 'logout?scope=global', { method: 'POST', token });
  } catch (error) {
    authMessage(error, 'reset');
  }
}

export async function onRequest({ request, env, params }) {
  const { action } = params;
  const url = new URL(request.url);
  const cookies = [];
  try {
    if (!Object.hasOwn(methods, action)) throw new HttpError(404, 'Unknown endpoint.');
    requireMethod(request, methods[action]);

    if (action === 'confirmed') {
      return redirect(url.searchParams.has('code') ? '/?auth=confirmed' : '/?auth=confirmation-error');
    }
    if (action === 'recovery') return await recoveryCallback(request, env, url);
    if (action === 'settings') return json({ taxTreatment: await taxTreatment(env) });
    if (action === 'logout') {
      try { await revokeSession(request, env); }
      catch { /* Local sign-out still clears every customer cookie during an upstream outage. */ }
      cookies.push(...clearSession(), clearRecovery(), clearVerifier());
      return json(null, 200, cookies);
    }

    const body = request.method === 'POST' ? await readBody(request, action === 'order' ? 65_536 : 32_768) : null;
    if (action === 'signup') {
      await register(env, url, body);
      return json(null, 200);
    }
    if (action === 'signin') {
      const tokens = await signin(env, body);
      const account = await profile(env, { user: tokens.user, token: tokens.access_token });
      return json(account, 200, [...sessionCookies(tokens), clearRecovery(), clearVerifier()]);
    }
    if (action === 'recover') return json(null, 200, [clearRecovery(), await recover(env, url, body)]);
    if (action === 'reset') {
      await reset(request, env, body);
      return json(null, 200, [...clearSession(), clearRecovery()]);
    }

    const customer = await currentCustomer(request, env, cookies);
    if (action === 'session') return json(await profile(env, customer), 200, cookies);
    if (action === 'profile') return json(await saveProfile(env, customer, body), 200, cookies);
    if (action === 'orders') return json(await orderPage(env, url.searchParams, customer), 200, cookies);
    if (action === 'order') return json(await submitOrder(env, customer.user, body), 201, cookies);
    return json(await transitionOrder(env, body, 'Customer', customer.user.id), 200, cookies);
  } catch (error) {
    return errorResponse(error, cookies);
  }
}
