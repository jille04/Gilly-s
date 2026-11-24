export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function json(value, status = 200, cookies = []) {
  const headers = new Headers({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return Response.json(value, { status, headers });
}

export function redirect(path, cookies = []) {
  const headers = new Headers({ Location: path, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 303, headers });
}

export function requireMethod(request, method) {
  if (request.method !== method) throw new HttpError(405, 'Method not allowed.');
  if (method !== 'GET' && request.headers.get('Origin') !== new URL(request.url).origin) {
    throw new HttpError(403, 'Request origin is not allowed.');
  }
}

export async function readBody(request, limit = 16_384) {
  if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') {
    throw new HttpError(415, 'Expected a JSON request.');
  }
  if (!request.body) throw new HttpError(400, 'Request is empty.');
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new HttpError(413, 'The request is too large.');
      }
      text += decoder.decode(value, { stream: true });
    }
    const data = JSON.parse(text + decoder.decode());
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error();
    return data;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'The request is not valid JSON.');
  } finally {
    reader.releaseLock();
  }
}

export function errorResponse(error, cookies) {
  return error instanceof HttpError
    ? json({ error: error.message }, error.status, cookies)
    : json({ error: 'Gilly’s service is temporarily unavailable. Try again shortly.' }, 502, cookies);
}
