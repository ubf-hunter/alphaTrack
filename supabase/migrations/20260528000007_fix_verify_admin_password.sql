-- ============================================================================
-- Alpha Center / alphaTrack — Migration 007
-- Correctif : verify_admin_password — qualifier la colonne `id` dans l'UPDATE
-- pour lever l'ambiguïté avec le champ id du record v_admin.
-- Bug rencontré : ERROR 42702 "column reference id is ambiguous".
-- ============================================================================

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

  -- Colonne admins.id explicitement qualifiée — sinon ambiguïté avec v_admin.id
  update public.admins as a
     set dernier_login = now()
   where a.id = v_admin.id;

  return query select v_admin.id, v_admin.matricule, v_admin.role,
                      v_admin.sous_centre_id, v_admin.must_change_password;
end $$;

comment on function public.verify_admin_password is
  'Vérifie matricule+password (bcrypt). Retourne 0 ou 1 ligne. Met à jour dernier_login si succès.';
