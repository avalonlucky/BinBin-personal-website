import { json, readSmallJson } from '../../_lib/ops-http.js';

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';
const GITHUB_LOGIN = 'avalonlucky';
const CONTRIBUTIONS_QUERY = `
  query($from: DateTime!, $to: DateTime!) {
    user(login: "${GITHUB_LOGIN}") {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

function validDate(value) {
  if (typeof value !== 'string' || value.length > 40) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export async function onRequestPost({ request, env }) {
  if (!env.GITHUB_TOKEN) return json(503, { error: 'github_not_configured' });
  const input = await readSmallJson(request, 16384);
  const from = validDate(input && input.variables && input.variables.from);
  const to = validDate(input && input.variables && input.variables.to);
  if (!from || !to || to < from || to.getTime() - from.getTime() > 370 * 86400000) {
    return json(400, { error: 'invalid_date_range' });
  }

  const upstream = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'maridian-space'
    },
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { from: from.toISOString(), to: to.toISOString() } })
  });
  const body = await upstream.json().catch(() => ({ errors: [{ message: 'GitHub response was not JSON' }] }));
  return json(upstream.ok ? 200 : upstream.status, body);
}
