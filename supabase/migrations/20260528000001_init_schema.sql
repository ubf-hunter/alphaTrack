-- ============================================================================
-- Alpha Center / alphaTrack — Migration 001
-- Schéma initial : régions, sous-centres, concours, matières, élèves,
-- inscriptions, évaluations, notes. Contraintes, indexes, types.
-- ============================================================================

-- ---------- Extensions ------------------------------------------------------
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "citext" with schema extensions;

-- ---------- Types énumérés --------------------------------------------------
do $$ begin
  create type public.evaluation_statut as enum (
    'brouillon', 'composition', 'saisie', 'calcule', 'publie', 'archive'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.statut_paiement as enum ('paye', 'partiel', 'non_paye');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sexe as enum ('M', 'F');
exception when duplicate_object then null; end $$;

-- ---------- Helpers ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Régions ---------------------------------------------------------
create table public.regions (
  id uuid primary key default extensions.uuid_generate_v4(),
  nom text not null unique,
  jour_composition text not null check (jour_composition in (
    'lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_regions_updated_at
  before update on public.regions
  for each row execute function public.set_updated_at();

-- ---------- Sous-centres ----------------------------------------------------
create table public.sous_centres (
  id uuid primary key default extensions.uuid_generate_v4(),
  region_id uuid not null references public.regions(id) on delete restrict,
  nom text not null,
  code text not null unique,
  ville text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sous_centres_nom_region_unique unique (region_id, nom)
);

create index idx_sous_centres_region on public.sous_centres(region_id);

create trigger trg_sous_centres_updated_at
  before update on public.sous_centres
  for each row execute function public.set_updated_at();

-- ---------- Concours --------------------------------------------------------
create table public.concours (
  id uuid primary key default extensions.uuid_generate_v4(),
  nom text not null unique,
  sigle text not null unique,
  description text,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_concours_actif on public.concours(actif) where actif = true;

create trigger trg_concours_updated_at
  before update on public.concours
  for each row execute function public.set_updated_at();

-- ---------- Matières --------------------------------------------------------
create table public.matieres (
  id uuid primary key default extensions.uuid_generate_v4(),
  nom text not null unique,
  code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_matieres_updated_at
  before update on public.matieres
  for each row execute function public.set_updated_at();

-- ---------- Concours × matières (coefficients) ------------------------------
create table public.concours_matieres (
  id uuid primary key default extensions.uuid_generate_v4(),
  concours_id uuid not null references public.concours(id) on delete cascade,
  matiere_id uuid not null references public.matieres(id) on delete restrict,
  coefficient numeric(4,2) not null check (coefficient > 0 and coefficient <= 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint concours_matieres_unique unique (concours_id, matiere_id)
);

create index idx_concours_matieres_concours on public.concours_matieres(concours_id);
create index idx_concours_matieres_matiere on public.concours_matieres(matiere_id);

create trigger trg_concours_matieres_updated_at
  before update on public.concours_matieres
  for each row execute function public.set_updated_at();

-- ---------- Élèves ----------------------------------------------------------
create table public.eleves (
  id uuid primary key default extensions.uuid_generate_v4(),
  matricule text not null unique,
  nom text not null,
  prenom text not null,
  sexe public.sexe not null,
  date_naissance date not null,
  telephone text,
  email extensions.citext,
  photo_url text,
  code_acces_hash text,
  auth_user_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint eleves_matricule_format check (matricule ~ '^AC-\d{2}-\d{4}$'),
  constraint eleves_email_format check (
    email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

create index idx_eleves_nom on public.eleves(nom);
create index idx_eleves_auth_user on public.eleves(auth_user_id) where auth_user_id is not null;

create trigger trg_eleves_updated_at
  before update on public.eleves
  for each row execute function public.set_updated_at();

-- ---------- Inscriptions (élève × concours × sous-centre) -------------------
create table public.inscriptions (
  id uuid primary key default extensions.uuid_generate_v4(),
  eleve_id uuid not null references public.eleves(id) on delete restrict,
  concours_id uuid not null references public.concours(id) on delete restrict,
  sous_centre_id uuid not null references public.sous_centres(id) on delete restrict,
  session text not null check (session ~ '^\d{4}-\d{4}$'),
  statut_paiement public.statut_paiement not null default 'non_paye',
  actif boolean not null default true,
  date_inscription date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inscriptions_unique unique (eleve_id, concours_id, session)
);

create index idx_inscriptions_eleve on public.inscriptions(eleve_id);
create index idx_inscriptions_concours on public.inscriptions(concours_id);
create index idx_inscriptions_sous_centre on public.inscriptions(sous_centre_id);
create index idx_inscriptions_session on public.inscriptions(session);

create trigger trg_inscriptions_updated_at
  before update on public.inscriptions
  for each row execute function public.set_updated_at();

-- ---------- Évaluations -----------------------------------------------------
create table public.evaluations (
  id uuid primary key default extensions.uuid_generate_v4(),
  libelle text not null,
  numero integer not null check (numero > 0),
  session text not null check (session ~ '^\d{4}-\d{4}$'),
  date_yaounde date not null,
  date_dschang date not null check (date_dschang >= date_yaounde),
  statut public.evaluation_statut not null default 'brouillon',
  publie_le timestamptz,
  publie_par uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evaluations_libelle_session_unique unique (libelle, session)
);

create index idx_evaluations_statut on public.evaluations(statut);
create index idx_evaluations_session on public.evaluations(session);

create trigger trg_evaluations_updated_at
  before update on public.evaluations
  for each row execute function public.set_updated_at();

-- Trigger : horodate publie_le au passage en statut 'publie'
create or replace function public.trg_evaluations_publie_le()
returns trigger language plpgsql as $$
begin
  if new.statut = 'publie' and (old.statut is distinct from 'publie') then
    new.publie_le = now();
  end if;
  if new.statut <> 'publie' then
    new.publie_le = null;
    new.publie_par = null;
  end if;
  return new;
end $$;

create trigger trg_evaluations_publie_le
  before update on public.evaluations
  for each row execute function public.trg_evaluations_publie_le();

-- ---------- Snapshot des coefficients au moment du calcul -------------------
create table public.evaluations_concours_coefficients (
  evaluation_id uuid not null references public.evaluations(id) on delete cascade,
  concours_id uuid not null references public.concours(id) on delete restrict,
  matiere_id uuid not null references public.matieres(id) on delete restrict,
  coefficient numeric(4,2) not null check (coefficient > 0),
  snapshot_at timestamptz not null default now(),
  primary key (evaluation_id, concours_id, matiere_id)
);

-- ---------- Notes -----------------------------------------------------------
create table public.notes (
  id uuid primary key default extensions.uuid_generate_v4(),
  inscription_id uuid not null references public.inscriptions(id) on delete cascade,
  evaluation_id uuid not null references public.evaluations(id) on delete cascade,
  matiere_id uuid not null references public.matieres(id) on delete restrict,
  note numeric(5,2),
  absent boolean not null default false,
  saisie_par uuid,
  saisie_le timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_value_check check (
    (absent = true and note is null) or
    (absent = false and note is not null and note >= 0 and note <= 20)
  ),
  constraint notes_unique unique (inscription_id, evaluation_id, matiere_id)
);

create index idx_notes_inscription on public.notes(inscription_id);
create index idx_notes_evaluation on public.notes(evaluation_id);
create index idx_notes_matiere on public.notes(matiere_id);
create index idx_notes_eval_inscr on public.notes(evaluation_id, inscription_id);

create trigger trg_notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- Trigger : la matière doit appartenir au concours de l'inscription (RG6)
create or replace function public.trg_notes_check_matiere_concours()
returns trigger language plpgsql as $$
declare
  v_concours_id uuid;
begin
  select i.concours_id into v_concours_id
  from public.inscriptions i where i.id = new.inscription_id;

  if not exists (
    select 1 from public.concours_matieres cm
    where cm.concours_id = v_concours_id and cm.matiere_id = new.matiere_id
  ) then
    raise exception 'La matière % n''appartient pas au concours de l''inscription %',
      new.matiere_id, new.inscription_id
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger trg_notes_check_matiere_concours
  before insert or update on public.notes
  for each row execute function public.trg_notes_check_matiere_concours();

-- ---------- Commentaires ----------------------------------------------------
comment on table public.regions is 'Régions de composition (Yaoundé, Dschang)';
comment on table public.sous_centres is 'Sous-centres de composition (1 Yaoundé + 5 Dschang)';
comment on table public.concours is 'Concours préparés (ENSPY, FMSB, ...)';
comment on table public.matieres is 'Catalogue global des matières';
comment on table public.concours_matieres is 'Coefficients courants par couple (concours, matière)';
comment on table public.eleves is 'Élèves inscrits au centre';
comment on table public.inscriptions is 'Une inscription = (élève, concours, sous-centre). Les notes s''y rattachent.';
comment on table public.evaluations is 'Évaluation blanche datée (Yaoundé vendredi, Dschang samedi)';
comment on table public.evaluations_concours_coefficients is 'Snapshot des coefficients au passage en statut calculé (figement RG7)';
comment on table public.notes is 'Notes saisies par les responsables de sous-centre';
