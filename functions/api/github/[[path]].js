import { json } from '../../_lib/ops-http.js';

const GITHUB_LOGIN = 'avalonlucky';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/github\/users\/([^/]+)\/events\/public\/?$/i);
  if (!match || match[1].toLowerCase() !== GITHUB_LOGIN) return json(404, { error: 'not_found' });
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page')) || 30));
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'maridian-space',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  const upstream = await fetch(`https://api.github.com/users/${GITHUB_LOGIN}/events/public?per_page=${perPage}`, { headers });
  const body = await upstream.json().catch(() => ({ error: 'github_upstream_error' }));
  return json(upstream.ok ? 200 : upstream.status, body);
}
