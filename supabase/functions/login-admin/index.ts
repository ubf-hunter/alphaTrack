// ============================================================================
// Edge Function : login-admin
// Auth admin/saisie par matricule + password (D10).
// Vérifie le password bcrypt côté DB, applique le lockout 5/15min, signe un JWT.
// ============================================================================

import { adminClient } from '../_shared/supabase.ts';
import { signJwt } from '../_shared/jwt.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

interface LoginBody {
  matricule?: unknown;
  password?: unknown;
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
  const password = typeof body.password === 'string' ? body.password : '';

  if (!/^ADM-\d{3}$/.test(matricule) || password.length === 0) {
    return jsonResponse({ error: 'Identifiants invalides' }, 400, origin);
  }

  const supabase = adminClient();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  // Lockout check
  const { data: attemptsCount, error: countErr } = await supabase.rpc('recent_failed_attempts', {
    p_identifier: matricule,
    p_type: 'admin',
    p_window_minutes: WINDOW_MINUTES,
  });
  if (countErr) {
    console.error('recent_failed_attempts error', countErr);
    return jsonResponse({ error: 'Erreur serveur' }, 500, origin);
  }
  if ((attemptsCount ?? 0) >= MAX_ATTEMPTS) {
    return jsonResponse(
      { error: `Compte temporairement bloqué (${MAX_ATTEMPTS} essais ratés). Réessaie dans ${WINDOW_MINUTES} minutes.` },
      429,
      origin,
    );
  }

  // Verify password
  const { data: verifyData, error: verifyErr } = await supabase.rpc('verify_admin_password', {
    p_matricule: matricule,
    p_password: password,
  });
  if (verifyErr) {
    console.error('verify_admin_password error', verifyErr);
    return jsonResponse({ error: 'Erreur serveur' }, 500, origin);
  }

  const row = Array.isArray(verifyData) && verifyData.length > 0 ? verifyData[0] : null;

  // Log attempt (success or fail)
  await supabase.from('login_attempts').insert({
    identifier: matricule,
    identifier_type: 'admin',
    success: row !== null,
    ip,
    user_agent: req.headers.get('user-agent'),
  });

  if (!row) {
    return jsonResponse({ error: 'Matricule ou mot de passe incorrect' }, 401, origin);
  }

  const token = await signJwt({
    sub: row.id,
    role: row.role,
    ...(row.sous_centre_id ? { sous_centre_id: row.sous_centre_id } : {}),
  });

  return jsonResponse(
    {
      token,
      admin: {
        id: row.id,
        matricule: row.matricule,
        role: row.role,
        sous_centre_id: row.sous_centre_id,
        must_change_password: row.must_change_password,
      },
    },
    200,
    origin,
  );
});
