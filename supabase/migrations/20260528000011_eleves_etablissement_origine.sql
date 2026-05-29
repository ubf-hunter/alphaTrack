-- ============================================================================
-- Alpha Center / alphaTrack — Migration 011
-- Ajoute la colonne etablissement_origine à eleves (lycée/collège d'origine).
--
-- Nullable au niveau DB pour ne pas casser les 30 élèves du seed déjà créés.
-- Le formulaire d'inscription côté admin marquera le champ comme requis
-- visuellement, mais l'import CSV peut le laisser vide (et l'admin pourra le
-- compléter plus tard depuis l'édition).
--
-- Index trigramme (extension pg_trgm) pour autocomplétion / recherche typo-
-- tolérante côté front. Si pg_trgm n'est pas dispo, on retombe sur l'index
-- btree classique.
-- ============================================================================

alter table public.eleves
  add column if not exists etablissement_origine text;

comment on column public.eleves.etablissement_origine is
  'Lycée ou collège d''origine de l''élève (texte libre, normalisable plus tard si volume justifie une table dédiée).';

-- Extension pour suggestion / recherche tolérante aux fautes
create extension if not exists pg_trgm with schema extensions;

create index if not exists idx_eleves_etablissement_trgm
  on public.eleves using gin (etablissement_origine extensions.gin_trgm_ops)
  where etablissement_origine is not null;
