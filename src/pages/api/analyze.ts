import type { APIRoute } from 'astro';

export const prerender = false; // CRITICAL: opts route into Cloudflare Worker on-demand mode

const ALLOWED_LOCALES = ['de', 'en', 'es'] as const;
type Locale = typeof ALLOWED_LOCALES[number];

interface AnalyzeRequest { url: string; locale: Locale }
interface Scores { performance: number; seo: number; accessibility: number; bestPractices: number }

function isValidUrl(input: string): boolean {
  try { const u = new URL(input); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
}

function mockScores(): Scores {
  // Stable-ish randomization band per RESEARCH.md pattern
  return {
    performance: Math.floor(Math.random() * 40) + 50,
    seo: Math.floor(Math.random() * 30) + 60,
    accessibility: Math.floor(Math.random() * 25) + 65,
    bestPractices: Math.floor(Math.random() * 20) + 70,
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // tighten to site origin in production via env if desired
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const POST: APIRoute = async ({ request }) => {
  let body: AnalyzeRequest;
  try { body = await request.json() as AnalyzeRequest; }
  catch { return json({ error: 'Invalid JSON body' }, 400); }

  if (!body?.url || !isValidUrl(body.url)) return json({ error: 'Invalid url' }, 400);
  if (!body.locale || !ALLOWED_LOCALES.includes(body.locale)) return json({ error: 'Invalid locale' }, 400);

  // TODO LEAD-V2-01: replace with real PageSpeed Insights API call
  const scores = mockScores();

  return json({ url: body.url, locale: body.locale, scores }, 200);
};

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
