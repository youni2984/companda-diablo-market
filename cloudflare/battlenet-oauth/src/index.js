const OAUTH_HOST = 'https://apac.battle.net';

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

async function exchangeCode(code, request, env) {
  const credentials = btoa(`${env.BATTLE_NET_CLIENT_ID}:${env.BATTLE_NET_CLIENT_SECRET}`);
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: callbackUrl(request, env),
  });
  const response = await fetch(`${OAUTH_HOST}/oauth/token`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${credentials}`,
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    },
    body,
  });
  if (!response.ok) throw new Error(`token exchange failed: ${response.status}`);
  return response.json();
}

async function fetchUser(accessToken) {
  const response = await fetch(`${OAUTH_HOST}/oauth/userinfo`, {
    headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`userinfo failed: ${response.status}`);
  return response.json();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json({ ok: true, service: 'companda-battlenet-oauth', region: 'apac' });
    }

    if (url.pathname === '/login') {
      if (!env.BATTLE_NET_CLIENT_ID || !env.BATTLE_NET_CLIENT_SECRET) {
        return json({ error: 'Battle.net OAuth secrets are not configured.' }, 500);
      }
      const state = randomState();
      const authorize = new URL(`${OAUTH_HOST}/oauth/authorize`);
      authorize.searchParams.set('client_id', env.BATTLE_NET_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', callbackUrl(request, env));
      authorize.searchParams.set('response_type', 'code');
      authorize.searchParams.set('scope', 'openid');
      authorize.searchParams.set('state', state);
      return new Response(null, {
        status: 302,
        headers: {
          location: authorize.toString(),
          'set-cookie': cookie('companda_bnet_state', state),
          'cache-control': 'no-store',
        },
      });
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
        return new Response(null, {
          status: 302,
          headers: {
            location: frontend.toString(),
            'set-cookie': cookie('companda_bnet_state', '', 0),
            'cache-control': 'no-store',
          },
        });
      } catch (error) {
        console.error(error);
        frontend.searchParams.set('bnet_error', 'oauth');
        return new Response(null, {
          status: 302,
          headers: {
            location: frontend.toString(),
            'set-cookie': cookie('companda_bnet_state', '', 0),
            'cache-control': 'no-store',
          },
        });
      }
    }

    return json({
      service: 'Companda Battle.net OAuth',
      login: '/login',
      callback: '/callback',
      note: 'D2R character equipment is not exposed by the public Battle.net profile API.',
    });
  },
};
