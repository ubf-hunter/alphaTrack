-- ============================================================================
-- Alpha Center / alphaTrack — Migration 005
-- Journal d'audit : traçabilité des actions sensibles (publication, modif
-- d'une note publiée, suppression, changement de coefficient).
-- ============================================================================

create table public.audit_log (
  id bigserial primary key,
  acteur_id uuid,                       -- admin.id ou eleve.id selon contexte
  acteur_type text not null check (acteur_type in ('admin', 'eleve', 'system')),
  action text not null,                 -- 'publier_evaluation', 'modifier_note_publiee', ...
  entite text not null,                 -- 'evaluation', 'note', 'concours_matieres', ...
  entite_id uuid,
  details jsonb not null default '{}'::jsonb,
  ip inet,
  at timestamptz not null default now()
);

create index idx_audit_log_acteur on public.audit_log(acteur_id, acteur_type);
create index idx_audit_log_entite on public.audit_log(entite, entite_id);
create index idx_audit_log_at on public.audit_log(at desc);

comment on table public.audit_log is
  'Journal append-only des actions sensibles (publication, modifications post-publication, etc.)';

-- ---------- Trigger : journaliser les changements de statut d'évaluation ----
create or replace function public.trg_audit_evaluation_statut()
returns trigger language plpgsql as $$
begin
  if old.statut is distinct from new.statut then
    insert into public.audit_log (acteur_id, acteur_type, action, entite, entite_id, details)
    values (
      new.publie_par,
      'admin',
      case when new.statut = 'publie' then 'publier_evaluation'
           when old.statut = 'publie' and new.statut <> 'publie' then 'depublier_evaluation'
           else 'changer_statut_evaluation' end,
      'evaluation',
      new.id,
      jsonb_build_object(
        'ancien_statut', old.statut,
        'nouveau_statut', new.statut,
        'libelle', new.libelle,
        'session', new.session
      )
    );
  end if;
  return new;
end $$;

create trigger trg_audit_evaluation_statut
  after update on public.evaluations
  for each row execute function public.trg_audit_evaluation_statut();

-- ---------- Trigger : journaliser modif d'une note d'une éval publiée ------
create or replace function public.trg_audit_note_post_publication()
returns trigger language plpgsql as $$
declare
  v_statut public.evaluation_statut;
begin
  select statut into v_statut from public.evaluations where id = new.evaluation_id;

  if v_statut = 'publie' then
    insert into public.audit_log (acteur_id, acteur_type, action, entite, entite_id, details)
    values (
      new.saisie_par,
      'admin',
      'modifier_note_publiee',
      'note',
      new.id,
      jsonb_build_object(
        'inscription_id', new.inscription_id,
        'evaluation_id', new.evaluation_id,
        'matiere_id', new.matiere_id,
        'ancienne_note', old.note,
        'nouvelle_note', new.note,
        'absent', new.absent
      )
    );
  end if;
  return new;
end $$;

create trigger trg_audit_note_post_publication
  after update on public.notes
  for each row execute function public.trg_audit_note_post_publication();
