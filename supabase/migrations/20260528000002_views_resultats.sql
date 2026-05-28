-- ============================================================================
-- Alpha Center / alphaTrack — Migration 002
-- Vue des résultats (moyennes + 3 rangs + effectifs) et fonction de calcul.
--
-- Principe (cf. cahier §7.3) : tous les classements sont partitionnés par
-- (évaluation, concours). On ne compare jamais ENSPY avec FMSB.
-- ============================================================================

-- ---------- Fonction de calcul ----------------------------------------------
-- Fige les coefficients en vigueur dans evaluations_concours_coefficients,
-- puis passe l'évaluation en statut 'calcule'.
create or replace function public.calculer_evaluation(p_evaluation_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_statut public.evaluation_statut;
  v_nb_snapshots integer;
begin
  select statut into v_statut from public.evaluations where id = p_evaluation_id;
  if v_statut is null then
    raise exception 'Évaluation % introuvable', p_evaluation_id;
  end if;

  if v_statut not in ('saisie', 'calcule') then
    raise exception 'L''évaluation doit être en statut "saisie" ou "calcule" (actuel : %)', v_statut;
  end if;

  -- Snapshot des coefficients pour tous les concours qui ont au moins une inscription
  -- avec une note sur cette évaluation.
  delete from public.evaluations_concours_coefficients
  where evaluation_id = p_evaluation_id;

  insert into public.evaluations_concours_coefficients
    (evaluation_id, concours_id, matiere_id, coefficient)
  select distinct
    p_evaluation_id,
    cm.concours_id,
    cm.matiere_id,
    cm.coefficient
  from public.concours_matieres cm
  where exists (
    select 1
    from public.inscriptions i
    join public.notes n on n.inscription_id = i.id
    where n.evaluation_id = p_evaluation_id
      and i.concours_id = cm.concours_id
      and n.matiere_id = cm.matiere_id
  );

  get diagnostics v_nb_snapshots = row_count;

  update public.evaluations
    set statut = 'calcule'
    where id = p_evaluation_id;

  raise notice 'Évaluation % calculée : % lignes de coefficients figées', p_evaluation_id, v_nb_snapshots;
end $$;

comment on function public.calculer_evaluation is
  'Fige les coefficients (snapshot) pour l''évaluation et passe son statut à "calcule"';

-- ---------- Vue v_resultats -------------------------------------------------
-- Étape 1 : pour chaque inscription/évaluation, on identifie si non_classe
-- et on calcule la moyenne pondérée (en utilisant le snapshot si disponible,
-- sinon les coefs courants).
-- Étape 2 : on calcule les trois rangs (national/régional/sous-centre) + effectifs.
create or replace view public.v_resultats as
with base as (
  select
    i.id as inscription_id,
    e.id as evaluation_id,
    i.concours_id,
    i.eleve_id,
    i.sous_centre_id,
    sc.region_id,
    e.statut as evaluation_statut,
    e.session
  from public.inscriptions i
  join public.sous_centres sc on sc.id = i.sous_centre_id
  cross join public.evaluations e
  where i.actif = true
    and i.session = e.session
),
notes_eval as (
  select
    b.inscription_id,
    b.evaluation_id,
    b.concours_id,
    b.eleve_id,
    b.sous_centre_id,
    b.region_id,
    b.evaluation_statut,
    n.matiere_id,
    n.note,
    n.absent,
    coalesce(ecc.coefficient, cm.coefficient) as coefficient
  from base b
  left join public.notes n
    on n.inscription_id = b.inscription_id and n.evaluation_id = b.evaluation_id
  left join public.evaluations_concours_coefficients ecc
    on ecc.evaluation_id = b.evaluation_id
   and ecc.concours_id  = b.concours_id
   and ecc.matiere_id   = n.matiere_id
  left join public.concours_matieres cm
    on cm.concours_id = b.concours_id and cm.matiere_id = n.matiere_id
),
moyennes as (
  select
    inscription_id,
    evaluation_id,
    concours_id,
    eleve_id,
    sous_centre_id,
    region_id,
    evaluation_statut,
    count(matiere_id) filter (where matiere_id is not null) as nb_notes,
    count(*) filter (where absent = true) as nb_absents,
    -- Non classé : aucune note OU toutes les notes sont absent=true
    (count(matiere_id) filter (where matiere_id is not null) = 0
     or count(*) filter (where absent = true) = count(matiere_id) filter (where matiere_id is not null)
    ) as non_classe,
    sum(case when absent then 0 else note end * coefficient) as somme_ponderee,
    sum(coefficient) filter (where matiere_id is not null) as somme_coefs,
    case
      when sum(coefficient) filter (where matiere_id is not null) is null
        or sum(coefficient) filter (where matiere_id is not null) = 0 then null
      else round(
        (sum(case when absent then 0 else note end * coefficient)
         / sum(coefficient) filter (where matiere_id is not null))::numeric,
        2
      )
    end as moyenne
  from notes_eval
  group by inscription_id, evaluation_id, concours_id, eleve_id,
           sous_centre_id, region_id, evaluation_statut
)
select
  m.*,
  case
    when m.non_classe then null
    else rank() over (
      partition by m.evaluation_id, m.concours_id
      order by m.moyenne desc nulls last
    )
  end as rang_national,
  case
    when m.non_classe then null
    else rank() over (
      partition by m.evaluation_id, m.concours_id, m.region_id
      order by m.moyenne desc nulls last
    )
  end as rang_regional,
  case
    when m.non_classe then null
    else rank() over (
      partition by m.evaluation_id, m.concours_id, m.sous_centre_id
      order by m.moyenne desc nulls last
    )
  end as rang_sous_centre,
  count(*) filter (where not m.non_classe) over (
    partition by m.evaluation_id, m.concours_id
  ) as effectif_national,
  count(*) filter (where not m.non_classe) over (
    partition by m.evaluation_id, m.concours_id, m.region_id
  ) as effectif_regional,
  count(*) filter (where not m.non_classe) over (
    partition by m.evaluation_id, m.concours_id, m.sous_centre_id
  ) as effectif_sous_centre
from moyennes m;

comment on view public.v_resultats is
  'Résultats agrégés par (inscription, évaluation) : moyenne pondérée, 3 rangs, effectifs. Recalculée à la volée. Le drapeau non_classe exclut des rangs.';
