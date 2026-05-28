// ============================================================================
// Edge Function : login-eleve
// Auth élève par matricule + code d'accès 6 chiffres (D6).
// Vérifie bcrypt côté DB, lockout, JWT custom.
// ============================================================================

import { adminClient } from '../_shared/supabase.ts';
import { signJwt } from '../_shared/jwt.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

interface LoginBody {
  matricule?: unknown;
  code?: unknown;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Méthode non autorisée' }, 405, origin);
  }

  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return jsonResponse({ error: 'JSON invalide' }, 400, origin);
  }

  const matricule = typeof body.matricule === 'string' ? body.matricule.trim() : '';
  const code = typeof body.code === 'string' ? body.code : '';

  if (!/^AC-\d{2}-\d{4}$/.test(matricule) || !/^\d{6}$/.test(code)) {
    return jsonResponse({ error: 'Identifiants invalides' }, 400, origin);
  }

  const supabase = adminClient();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  const { data: attemptsCount, error: countErr } = await supabase.rpc('recent_failed_attempts', {
    p_identifier: matricule,
    p_type: 'eleve',
    p_window_minutes: WINDOW_MINUTES,
  });
  if (countErr) {
    console.error('recent_failed_attempts error', countErr);
    return jsonResponse({ error: 'Erreur serveur' }, 500, origin);
  }
  if ((attemptsCount ?? 0) >= MAX_ATTEMPTS) {
    return jsonResponse(
      { error: `Trop d'essais. Réessaie dans ${WINDOW_MINUTES} minutes.` },
      429,
      origin,
    );
  }

  const { data: verifyData, error: verifyErr } = await supabase.rpc('verify_eleve_code', {
    p_matricule: matricule,
    p_code: code,
  });
  if (verifyErr) {
    console.error('verify_eleve_code error', verifyErr);
    return jsonResponse({ error: 'Erreur serveur' }, 500, origin);
  }

  const row = Array.isArray(verifyData) && verifyData.length > 0 ? verifyData[0] : null;

  await supabase.from('login_attempts').insert({
    identifier: matricule,
    identifier_type: 'eleve',
    success: row !== null,
    ip,
    user_agent: req.headers.get('user-agent'),
  });

  if (!row) {
    return jsonResponse({ error: 'Matricule ou code incorrect' }, 401, origin);
  }

  const token = await signJwt({
    sub: row.id,
    role: 'eleve',
  });

  return jsonResponse(
    {
      token,
      eleve: {
        id: row.id,
        matricule: row.matricule,
        nom: row.nom,
        prenom: row.prenom,
      },
    },
    200,
    origin,
  );
});
