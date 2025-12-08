export async function fetchNews({ q = 'positive OR uplifting OR inspiring OR inspiration OR "feel good" OR "good news" OR Heartwarming OR "Acts of kindness" OR Hopeful', language = 'en', page = 1, pageSize = 20 } = {}) {
  if (!process.env.NEWSAPI_KEY) throw new Error('NEWSAPI_KEY not set in environment (set in .env)');

  const params = new URLSearchParams({ q, language, page: String(page), pageSize: String(pageSize) });
  const url = `https://newsapi.org/v2/everything?${params.toString()}`;

  const res = await fetch(url, { headers: { 'X-Api-Key': process.env.NEWSAPI_KEY } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NewsAPI error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data;
}
