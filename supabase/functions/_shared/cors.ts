// CORS headers partagés par les Edge Functions
// Les origines autorisées sont passées via la variable d'env ALLOWED_ORIGINS
// (séparées par des virgules). En dev, on autorise localhost:5173/5174.

const DEFAULT_ALLOWED = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

export function corsHeaders(origin: string | null): HeadersInit {
  const allowedEnv = Deno.env.get('ALLOWED_ORIGINS') ?? '';
  const allowed = allowedEnv ? allowedEnv.split(',').map((s) => s.trim()) : DEFAULT_ALLOWED;

  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0]!;

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}
