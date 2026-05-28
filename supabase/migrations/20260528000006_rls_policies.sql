-- ============================================================================
-- Alpha Center / alphaTrack — Migration 006
-- Row-Level Security : politiques pour les 3 rôles (admin, saisie, eleve).
--
-- Modèle d'accès :
--   - JWT custom claim "role"          ∈ {'admin', 'saisie', 'eleve'}
--   - JWT custom claim "sous_centre_id"  (si role = 'saisie')
--   - JWT sub                          = eleves.auth_user_id (si role = 'eleve')
--                                      = admins.id           (si role admin/saisie)
--   - Le service_role bypass tout (réservé aux Edge Functions)
--
-- Principe (cahier §12, RG8) : les élèves ne voient leurs résultats que sur
-- les évaluations en statut 'publie'. Les responsables saisie ne voient que
-- leur sous-centre. Seul l'admin voit tout et publie.
-- ============================================================================

-- ---------- Helpers JWT pour la lisibilité ----------------------------------
create or replace function public.jwt_role() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'role', ''),
    nullif(current_setting('request.jwt.claim.role', true), ''),
    'anon'
  );
$$;

create or replace function public.jwt_sous_centre_id() returns uuid
language sql stable as $$
  select nullif(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sous_centre_id',
    ''
  )::uuid;
$$;

create or replace function public.jwt_eleve_id() returns uuid
language sql stable as $$
  -- L'élève authentifié : son auth_user_id (sub du JWT) mappe sur eleves.auth_user_id
  select e.id from public.eleves e
  where e.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.jwt_admin_id() returns uuid
language sql stable as $$
  -- Pour les admins, on stocke admin.id directement dans le sub du JWT custom
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', ''),
    ''
  )::uuid;
$$;

-- ---------- Activer RLS sur toutes les tables -------------------------------
alter table public.regions enable row level security;
alter table public.sous_centres enable row level security;
alter table public.concours enable row level security;
alter table public.matieres enable row level security;
alter table public.concours_matieres enable row level security;
alter table public.eleves enable row level security;
alter table public.inscriptions enable row level security;
alter table public.evaluations enable row level security;
alter table public.evaluations_concours_coefficients enable row level security;
alter table public.notes enable row level security;
alter table public.admins enable row level security;
alter table public.login_attempts enable row level security;
alter table public.audit_log enable row level security;

-- ----------------------------------------------------------------------------
-- Référentiel (regions, sous_centres, concours, matieres, concours_matieres)
-- ----------------------------------------------------------------------------
-- Lecture : ouverte à tous les rôles authentifiés (besoin du référentiel pour
-- afficher les noms, les coefficients, etc.). Écriture : admin uniquement.

create policy ref_select_authenticated_regions on public.regions
  for select using (jwt_role() in ('admin', 'saisie', 'eleve'));
create policy ref_all_admin_regions on public.regions
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');

create policy ref_select_authenticated_sc on public.sous_centres
  for select using (jwt_role() in ('admin', 'saisie', 'eleve'));
create policy ref_all_admin_sc on public.sous_centres
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');

create policy ref_select_authenticated_concours on public.concours
  for select using (jwt_role() in ('admin', 'saisie', 'eleve'));
create policy ref_all_admin_concours on public.concours
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');

create policy ref_select_authenticated_matieres on public.matieres
  for select using (jwt_role() in ('admin', 'saisie', 'eleve'));
create policy ref_all_admin_matieres on public.matieres
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');

create policy ref_select_authenticated_cm on public.concours_matieres
  for select using (jwt_role() in ('admin', 'saisie', 'eleve'));
create policy ref_all_admin_cm on public.concours_matieres
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');

-- ----------------------------------------------------------------------------
-- Élèves
-- ----------------------------------------------------------------------------
-- - admin : tout
-- - saisie : peut lire les élèves de son sous-centre (via leurs inscriptions)
-- - eleve : ne peut lire QUE sa propre fiche

create policy eleves_admin_all on public.eleves
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');

create policy eleves_saisie_select on public.eleves
  for select using (
    jwt_role() = 'saisie'
    and exists (
      select 1 from public.inscriptions i
      where i.eleve_id = eleves.id
        and i.sous_centre_id = jwt_sous_centre_id()
    )
  );

create policy eleves_self_select on public.eleves
  for select using (
    jwt_role() = 'eleve' and id = jwt_eleve_id()
  );

-- ----------------------------------------------------------------------------
-- Inscriptions
-- ----------------------------------------------------------------------------

create policy inscriptions_admin_all on public.inscriptions
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');

create policy inscriptions_saisie_select on public.inscriptions
  for select using (
    jwt_role() = 'saisie' and sous_centre_id = jwt_sous_centre_id()
  );

create policy inscriptions_self_select on public.inscriptions
  for select using (
    jwt_role() = 'eleve' and eleve_id = jwt_eleve_id()
  );

-- ----------------------------------------------------------------------------
-- Évaluations
-- ----------------------------------------------------------------------------
-- - admin : tout
-- - saisie : lecture (besoin de voir les évals à saisir)
-- - eleve : lecture UNIQUEMENT des évaluations publiées (RG8 anti-fuite)

create policy evaluations_admin_all on public.evaluations
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');

create policy evaluations_saisie_select on public.evaluations
  for select using (jwt_role() = 'saisie');

create policy evaluations_eleve_select_publie on public.evaluations
  for select using (jwt_role() = 'eleve' and statut = 'publie');

-- Snapshot des coefficients : lecture seule pour tous (utile pour bulletins)
create policy ecc_admin_all on public.evaluations_concours_coefficients
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');
create policy ecc_select_authenticated on public.evaluations_concours_coefficients
  for select using (jwt_role() in ('saisie', 'eleve'));

-- ----------------------------------------------------------------------------
-- Notes — le cœur de la sécurité
-- ----------------------------------------------------------------------------
-- - admin : tout
-- - saisie : peut INSERT/UPDATE sur son sous-centre uniquement, et uniquement
--           tant que l'évaluation est en statut 'saisie' (pas après calcul/publi)
-- - eleve : peut lire SES notes UNIQUEMENT si l'évaluation est 'publie' (RG8)

create policy notes_admin_all on public.notes
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');

create policy notes_saisie_select on public.notes
  for select using (
    jwt_role() = 'saisie'
    and exists (
      select 1 from public.inscriptions i
      where i.id = notes.inscription_id
        and i.sous_centre_id = jwt_sous_centre_id()
    )
  );

create policy notes_saisie_insert on public.notes
  for insert with check (
    jwt_role() = 'saisie'
    and exists (
      select 1 from public.inscriptions i
      join public.evaluations e on e.id = notes.evaluation_id
      where i.id = notes.inscription_id
        and i.sous_centre_id = jwt_sous_centre_id()
        and e.statut = 'saisie'
    )
  );

create policy notes_saisie_update on public.notes
  for update using (
    jwt_role() = 'saisie'
    and exists (
      select 1 from public.inscriptions i
      join public.evaluations e on e.id = notes.evaluation_id
      where i.id = notes.inscription_id
        and i.sous_centre_id = jwt_sous_centre_id()
        and e.statut = 'saisie'
    )
  ) with check (
    jwt_role() = 'saisie'
    and exists (
      select 1 from public.inscriptions i
      join public.evaluations e on e.id = notes.evaluation_id
      where i.id = notes.inscription_id
        and i.sous_centre_id = jwt_sous_centre_id()
        and e.statut = 'saisie'
    )
  );

create policy notes_eleve_select_publie on public.notes
  for select using (
    jwt_role() = 'eleve'
    and exists (
      select 1
      from public.inscriptions i
      join public.evaluations e on e.id = notes.evaluation_id
      where i.id = notes.inscription_id
        and i.eleve_id = jwt_eleve_id()
        and e.statut = 'publie'
    )
  );

-- ----------------------------------------------------------------------------
-- Admins (la table elle-même)
-- ----------------------------------------------------------------------------
-- Seul un admin peut tout voir. Un saisie ne voit que sa propre fiche.

create policy admins_admin_all on public.admins
  for all using (jwt_role() = 'admin') with check (jwt_role() = 'admin');

create policy admins_self_select on public.admins
  for select using (jwt_role() = 'saisie' and id = jwt_admin_id());

-- ----------------------------------------------------------------------------
-- Login attempts
-- ----------------------------------------------------------------------------
-- Aucun accès direct depuis le front. Seules les Edge Functions (service_role)
-- y écrivent. On laisse une politique de lecture admin pour le debug.

create policy login_attempts_admin_select on public.login_attempts
  for select using (jwt_role() = 'admin');

-- ----------------------------------------------------------------------------
-- Audit log
-- ----------------------------------------------------------------------------
-- Lecture admin uniquement. Écriture uniquement par triggers (sécurity definer).

create policy audit_log_admin_select on public.audit_log
  for select using (jwt_role() = 'admin');
