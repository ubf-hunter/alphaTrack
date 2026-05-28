-- ============================================================================
-- Alpha Center / alphaTrack — Migration 008
-- Alignement RLS sur le claim JWT `app_role`.
--
-- Contexte : pour que PostgREST accepte nos JWT custom, le claim standard
-- `role` doit valoir 'authenticated' (rôle Postgres). On expose donc notre
-- rôle métier ('admin'|'saisie'|'eleve') via le claim custom `app_role`.
-- Les politiques RLS continuent d'appeler jwt_role() — on met juste à jour
-- son implémentation. Pas besoin de toucher aux policies.
-- ============================================================================

create or replace function public.jwt_role() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'app_role', ''),
    'anon'
  );
$$;

comment on function public.jwt_role is
  'Retourne le rôle métier (app_role) extrait du JWT custom. anon par défaut.';
