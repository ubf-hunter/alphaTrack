-- ============================================================================
-- Alpha Center / alphaTrack — Migration 004
-- Auth élève : helpers pour le code d'accès (bcrypt) et vérification login.
-- D6 du plan : matricule + code 6 chiffres. Stocké haché (jamais en clair).
-- ============================================================================

-- ---------- Helper : (re)définir le code d'accès d'un élève -----------------
create or replace function public.set_eleve_code_acces(
  p_eleve_id uuid,
  p_code text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_code !~ '^\d{6}$' then
    raise exception 'Le code d''accès doit être 6 chiffres';
  end if;

  update public.eleves
    set code_acces_hash = extensions.crypt(p_code, extensions.gen_salt('bf', 12))
    where id = p_eleve_id;

  if not found then
    raise exception 'Élève % introuvable', p_eleve_id;
  end if;
end $$;

comment on function public.set_eleve_code_acces is
  'Définit ou remplace le code d''accès d''un élève (stocké bcrypt cost 12)';

-- ---------- Helper : vérifier matricule + code ------------------------------
create or replace function public.verify_eleve_code(
  p_matricule text,
  p_code text
)
returns table (
  id uuid,
  matricule text,
  nom text,
  prenom text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_eleve record;
begin
  select e.id, e.matricule, e.nom, e.prenom, e.code_acces_hash
    into v_eleve
    from public.eleves e
    where e.matricule = p_matricule
    limit 1;

  if v_eleve is null or v_eleve.code_acces_hash is null then
    return;
  end if;

  if v_eleve.code_acces_hash <> extensions.crypt(p_code, v_eleve.code_acces_hash) then
    return;
  end if;

  return query select v_eleve.id, v_eleve.matricule, v_eleve.nom, v_eleve.prenom;
end $$;

comment on function public.verify_eleve_code is
  'Vérifie matricule + code d''accès. Retourne 0 ou 1 ligne.';
