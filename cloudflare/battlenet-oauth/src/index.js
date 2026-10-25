const OAUTH_HOST = 'https://apac.battle.net';
const DEFAULT_ADMIN_USER = 'youni2984';
const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 8;
const ADMIN_PASSWORD_MIN_LENGTH = 12;
const ADMIN_SPECIALS = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?`~";
const textEncoder = new TextEncoder();

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extra },
  });
}

function cookie(name, value, maxAge = 600) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function randomState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

function safeFrontend(env) {
  return env.FRONTEND_URL || 'https://youni2984.github.io/companda-diablo-market/';
}

function callbackUrl(request, env) {
  return env.BATTLE_NET_REDIRECT_URI || `${new URL(request.url).origin}/callback`;
}

function allowedOrigins(env) {
  const values = new Set([
    new URL(safeFrontend(env)).origin,
    'https://youni2984.github.io',
    'https://companda-diablo-market.youni2984.chatgpt.site',
  ]);
  for (const item of String(env.ADMIN_ALLOWED_ORIGINS || '').split(',')) {
    const origin = item.trim();
    if (origin) values.add(origin);
  }
  return values;
}

function corsHeaders(request, env) {
  const origin = request.headers.get('origin');
  if (!origin || !allowedOrigins(env).has(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

function base64UrlBytes(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlText(value) {
  return base64UrlBytes(textEncoder.encode(value));
}

function decodeBase64UrlText(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function validAdminPassword(value = '') {
  const password = String(value);
  return password.length >= ADMIN_PASSWORD_MIN_LENGTH
    && /[A-Za-z]/.test(password)
    && [...password].some((char) => ADMIN_SPECIALS.includes(char));
}

async function hmac(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, textEncoder.encode(message)));
}

async function secureEqualText(a, b) {
  const [left, right] = await Promise.all([
    crypto.subtle.digest('SHA-256', textEncoder.encode(String(a))),
    crypto.subtle.digest('SHA-256', textEncoder.encode(String(b))),
  ]);
  const x = new Uint8Array(left);
  const y = new Uint8Array(right);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.min(x.length, y.length); i += 1) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function issueAdminToken(username, env) {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlText(JSON.stringify({ sub: username, role: 'admin', iat: now, exp: now + ADMIN_TOKEN_TTL_SECONDS }));
  const signature = base64UrlBytes(await hmac(`admin-session:${payload}`, env.ADMIN_PASSWORD));
  return `${payload}.${signature}`;
}

async function verifyAdminToken(token, env) {
  if (!env.ADMIN_PASSWORD || !token || !token.includes('.')) return null;
  const [payloadPart, signature] = token.split('.', 2);
  const expected = base64UrlBytes(await hmac(`admin-session:${payloadPart}`, env.ADMIN_PASSWORD));
  if (!(await secureEqualText(signature, expected))) return null;
  try {
    const payload = JSON.parse(decodeBase64UrlText(payloadPart));
    if (payload.role !== 'admin' || !payload.sub || Number(payload.exp) <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function bearerToken(request) {
  const header = request.headers.get('authorization') || '';
  return header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
}

async function handleAdmin(request, env, url) {
  const headers = { ...corsHeaders(request, env), 'cache-control': 'no-store' };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  if (url.pathname === '/admin/login' && request.method === 'POST') {
    if (!env.ADMIN_PASSWORD) return json({ error: '관리자 비밀번호 Secret이 설정되지 않았습니다.' }, 503, headers);
    if (!validAdminPassword(env.ADMIN_PASSWORD)) return json({ error: '서버의 관리자 비밀번호가 보안 규칙을 충족하지 않습니다.' }, 503, headers);
    let body;
    try { body = await request.json(); } catch { return json({ error: '잘못된 요청입니다.' }, 400, headers); }
    if (!validAdminPassword(body?.password || '')) {
      return json({ error: '비밀번호는 영문 포함 12자리 이상이며 특수기호를 1개 이상 포함해야 합니다.' }, 400, headers);
    }
    const expectedUser = env.ADMIN_USERNAME || DEFAULT_ADMIN_USER;
    const userOk = await secureEqualText(body?.username || '', expectedUser);
    const passwordOk = await secureEqualText(body?.password || '', env.ADMIN_PASSWORD);
    if (!userOk || !passwordOk) return json({ error: '관리자 계정 정보가 일치하지 않습니다.' }, 401, headers);
    const token = await issueAdminToken(expectedUser, env);
    return json({ ok: true, username: expectedUser, role: 'admin', token, expiresIn: ADMIN_TOKEN_TTL_SECONDS }, 200, headers);
  }

  if (url.pathname === '/admin/session' && request.method === 'GET') {
    const session = await verifyAdminToken(bearerToken(request), env);
    if (!session) return json({ authenticated: false }, 401, headers);
    return json({ authenticated: true, username: session.sub, role: session.role, expiresAt: session.exp }, 200, headers);
  }

  if (url.pathname === '/admin/logout' && request.method === 'POST') return json({ ok: true }, 200, headers);
  return null;
}

async function exchangeCode(code, request, env) {
  const credentials = btoa(`${env.BATTLE_NET_CLIENT_ID}:${env.BATTLE_NET_CLIENT_SECRET}`);
  const body = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: callbackUrl(request, env) });
  const response = await fetch(`${OAUTH_HOST}/oauth/token`, {
    method: 'POST',
    headers: { authorization: `Basic ${credentials}`, 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body,
  });
  if (!response.ok) throw new Error(`token exchange failed: ${response.status}`);
  return response.json();
}

async function fetchUser(accessToken) {
  const response = await fetch(`${OAUTH_HOST}/oauth/userinfo`, { headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' } });
  if (!response.ok) throw new Error(`userinfo failed: ${response.status}`);
  return response.json();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/admin/')) {
      const response = await handleAdmin(request, env, url);
      if (response) return response;
    }

    if (url.pathname === '/health') {
      const configured = Boolean(env.ADMIN_PASSWORD);
      return json({
        ok: true,
        service: 'companda-battlenet-oauth',
        region: 'apac',
        adminAuthConfigured: configured,
        adminPasswordPolicyValid: configured ? validAdminPassword(env.ADMIN_PASSWORD) : false,
        adminPasswordPolicy: { minLength: ADMIN_PASSWORD_MIN_LENGTH, requiresEnglish: true, requiresSpecial: true },
      }, 200, corsHeaders(request, env));
    }

    if (url.pathname === '/login') {
      if (!env.BATTLE_NET_CLIENT_ID || !env.BATTLE_NET_CLIENT_SECRET) return json({ error: 'Battle.net OAuth secrets are not configured.' }, 500);
      const state = randomState();
      const authorize = new URL(`${OAUTH_HOST}/oauth/authorize`);
      authorize.searchParams.set('client_id', env.BATTLE_NET_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', callbackUrl(request, env));
      authorize.searchParams.set('response_type', 'code');
      authorize.searchParams.set('scope', 'openid');
      authorize.searchParams.set('state', state);
      return new Response(null, { status: 302, headers: { location: authorize.toString(), 'set-cookie': cookie('companda_bnet_state', state), 'cache-control': 'no-store' } });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code') || '';
      const state = url.searchParams.get('state') || '';
      const expected = readCookie(request, 'companda_bnet_state');
      const frontend = new URL(safeFrontend(env));
      if (!code || !state || !expected || state !== expected) {
        frontend.searchParams.set('bnet_error', 'state');
        return Response.redirect(frontend.toString(), 302);
      }
      try {
        const token = await exchangeCode(code, request, env);
        const user = await fetchUser(token.access_token);
        frontend.searchParams.set('bnet_connected', '1');
        if (user.battletag) frontend.searchParams.set('battletag', user.battletag);
        if (user.id !== undefined && user.id !== null) frontend.searchParams.set('bnet_id', String(user.id));
        return new Response(null, { status: 302, headers: { location: frontend.toString(), 'set-cookie': cookie('companda_bnet_state', '', 0), 'cache-control': 'no-store' } });
      } catch (error) {
        console.error(error);
        frontend.searchParams.set('bnet_error', 'oauth');
        return new Response(null, { status: 302, headers: { location: frontend.toString(), 'set-cookie': cookie('companda_bnet_state', '', 0), 'cache-control': 'no-store' } });
      }
    }

    return json({ service: 'Companda Battle.net OAuth + Admin Auth', login: '/login', callback: '/callback', admin: ['/admin/login', '/admin/session', '/admin/logout'], note: 'D2R character equipment is not exposed by the public Battle.net profile API.' });
  },
};
