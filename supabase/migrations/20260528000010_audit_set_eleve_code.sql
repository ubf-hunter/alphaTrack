-- ============================================================================
-- Alpha Center / alphaTrack — Migration 010
-- Audit : journalisation de chaque régénération de code d'accès élève.
--
-- Pour chaque appel à set_eleve_code_acces, on insère une ligne dans
-- audit_log avec :
--   - acteur_id  = sub du JWT courant (ID de l'admin)
--   - acteur_type = 'admin'
--   - action     = 'regenerer_code_eleve' OU 'definir_code_eleve' (1ère fois)
--   - entite     = 'eleve'
--   - entite_id  = ID de l'élève
--   - details    = matricule + flag premiere_definition
--
-- La fonction reste SECURITY DEFINER : elle s'exécute avec les droits du
-- propriétaire (postgres), donc INSERT dans audit_log passe sans RLS bloquante.
-- ============================================================================

create or replace function public.set_eleve_code_acces(
  p_eleve_id uuid,
  p_code text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_admin_id uuid;
  v_existait boolean;
  v_matricule text;
begin
  if p_code !~ '^\d{6}$' then
    raise exception 'Le code d''accès doit être 6 chiffres';
  end if;

  -- État avant l'update : est-ce une première définition ou une régénération ?
  select code_acces_hash is not null, matricule
    into v_existait, v_matricule
    from public.eleves
   where id = p_eleve_id;

  if not found then
    raise exception 'Élève % introuvable', p_eleve_id;
  end if;

  update public.eleves
    set code_acces_hash = extensions.crypt(p_code, extensions.gen_salt('bf', 12))
    where id = p_eleve_id;

  -- Récupération de l'admin courant depuis le JWT (claim sub)
  begin
    v_admin_id := nullif(
      current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
      ''
    )::uuid;
  exception when others then
    v_admin_id := null;
  end;

  insert into public.audit_log (acteur_id, acteur_type, action, entite, entite_id, details)
  values (
    v_admin_id,
    'admin',
    case when v_existait then 'regenerer_code_eleve' else 'definir_code_eleve' end,
    'eleve',
    p_eleve_id,
    jsonb_build_object(
      'matricule', v_matricule,
      'premiere_definition', not v_existait
    )
  );
end $$;

comment on function public.set_eleve_code_acces is
  'Définit ou régénère le code d''accès d''un élève (bcrypt cost 12) et journalise l''action dans audit_log.';
