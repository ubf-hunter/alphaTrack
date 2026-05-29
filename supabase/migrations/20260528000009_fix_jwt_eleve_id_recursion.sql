-- ============================================================================
-- Alpha Center / alphaTrack — Migration 009
-- Correctif : jwt_eleve_id() interrogeait public.eleves, ce qui causait une
-- récursion lorsqu'elle était appelée depuis une policy RLS sur eleves elle-
-- même (et a déclenché des 500 sur eleves, inscriptions, notes).
--
-- Solution : lire l'eleve_id directement depuis le claim JWT 'sub'. Notre
-- Edge Function login-eleve définit déjà sub = eleves.id, donc équivalent
-- fonctionnel, mais sans requête DB → pas de récursion.
--
-- Note : pour les JWT admin/saisie, sub vaut admins.id (UUID valide mais
-- d'un autre référentiel). C'est sans effet car la policy contient toujours
-- la garde `jwt_role() = 'eleve' AND id = jwt_eleve_id()` — short-circuit
-- avant d'appeler jwt_eleve_id() pour un non-élève.
-- ============================================================================

create or replace function public.jwt_eleve_id() returns uuid
language sql
stable
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    ''
  )::uuid;
$$;

comment on function public.jwt_eleve_id is
  'Retourne l''eleve_id depuis le claim JWT sub (set par login-eleve). Pas de requête DB pour éviter la récursion dans les policies RLS sur eleves.';
