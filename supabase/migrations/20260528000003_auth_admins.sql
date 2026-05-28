-- ============================================================================
-- Alpha Center / alphaTrack — Migration 003
-- Auth admin/saisie : table admins (matricule + password bcrypt + rôle).
-- D10 du plan : pas d'email. Matricule format ADM-NNN. Lockout 5/15min.
-- ============================================================================

-- ---------- Type rôle admin -------------------------------------------------
do $$ begin
  create type public.admin_role as enum ('admin', 'saisie');
exception when duplicate_object then null; end $$;

-- ---------- Table admins ----------------------------------------------------
create table public.admins (
  id uuid primary key default extensions.uuid_generate_v4(),
  matricule text not null unique,
  password_hash text not null,
  role public.admin_role not null,
  sous_centre_id uuid references public.sous_centres(id) on delete restrict,
  nom text not null,
  prenom text not null,
  actif boolean not null default true,
  must_change_password boolean not null default true,
  dernier_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admins_matricule_format check (matricule ~ '^ADM-\d{3}$'),
  -- Un super-admin n'a pas de sous_centre_id ; un saisie en a obligatoirement un.
  constraint admins_role_sous_centre_coherence check (
    (role = 'admin' and sous_centre_id is null) or
    (role = 'saisie' and sous_centre_id is not null)
  )
);

create index idx_admins_role on public.admins(role);
create index idx_admins_sous_centre on public.admins(sous_centre_id) where sous_centre_id is not null;

create trigger trg_admins_updated_at
  before update on public.admins
  for each row execute function public.set_updated_at();

comment on table public.admins is
  'Comptes administratifs (super-admin + responsables saisie). Auth par matricule + password bcrypt. Pas d''email.';

-- ---------- Login attempts (lockout 5/15min) --------------------------------
create table public.login_attempts (
  id bigserial primary key,
  identifier text not null,          -- matricule (admin ou élève)
  identifier_type text not null check (identifier_type in ('admin', 'eleve')),
  success boolean not null,
  ip inet,
  user_agent text,
  attempted_at timestamptz not null default now()
);

create index idx_login_attempts_identifier_time
  on public.login_attempts(identifier, identifier_type, attempted_at desc);

comment on table public.login_attempts is
  'Journal des tentatives de connexion (admin et élève). Sert au lockout 5 essais / 15 min.';

-- ---------- Helper : vérifier un password admin -----------------------------
create or replace function public.verify_admin_password(
  p_matricule text,
  p_password text
)
returns table (
  id uuid,
  matricule text,
  role public.admin_role,
  sous_centre_id uuid,
  must_change_password boolean
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_admin record;
begin
  select a.id, a.matricule, a.role, a.sous_centre_id, a.password_hash,
         a.actif, a.must_change_password
    into v_admin
    from public.admins a
    where a.matricule = p_matricule and a.actif = true
    limit 1;

  if v_admin is null then
    return;
  end if;

  if v_admin.password_hash <> extensions.crypt(p_password, v_admin.password_hash) then
    return;
  end if;

  update public.admins set dernier_login = now() where id = v_admin.id;

  return query select v_admin.id, v_admin.matricule, v_admin.role,
                      v_admin.sous_centre_id, v_admin.must_change_password;
end $$;

comment on function public.verify_admin_password is
  'Vérifie matricule+password (bcrypt). Retourne 0 ou 1 ligne. Met à jour dernier_login si succès.';

-- ---------- Helper : changer le password admin ------------------------------
create or replace function public.change_admin_password(
  p_admin_id uuid,
  p_ancien text,
  p_nouveau text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_current_hash text;
begin
  select password_hash into v_current_hash
    from public.admins where id = p_admin_id and actif = true;

  if v_current_hash is null then
    raise exception 'Admin introuvable ou inactif';
  end if;

  if v_current_hash <> extensions.crypt(p_ancien, v_current_hash) then
    return false;
  end if;

  -- Politique de complexité : min 10 car., 1 maj, 1 chiffre, 1 spécial
  if length(p_nouveau) < 10
    or p_nouveau !~ '[A-Z]'
    or p_nouveau !~ '\d'
    or p_nouveau !~ '[^A-Za-z0-9]' then
    raise exception 'Le nouveau mot de passe ne respecte pas la politique de complexité';
  end if;

  update public.admins
    set password_hash = extensions.crypt(p_nouveau, extensions.gen_salt('bf', 12)),
        must_change_password = false
    where id = p_admin_id;

  return true;
end $$;

comment on function public.change_admin_password is
  'Change le password admin (exige l''ancien) et applique la politique de complexité';

-- ---------- Helper : compter les tentatives ratées récentes -----------------
create or replace function public.recent_failed_attempts(
  p_identifier text,
  p_type text,
  p_window_minutes integer default 15
)
returns integer
language sql
stable
as $$
  select count(*)::integer
  from public.login_attempts
  where identifier = p_identifier
    and identifier_type = p_type
    and success = false
    and attempted_at > now() - (p_window_minutes || ' minutes')::interval;
$$;

comment on function public.recent_failed_attempts is
  'Compte les tentatives ratées dans la fenêtre glissante (défaut 15 min)';
