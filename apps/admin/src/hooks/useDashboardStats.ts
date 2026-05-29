import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalEleves: number;
  totalInscriptions: number;
  evaluationsEnCours: number;
  evaluationsPubliees: number;
  derniereEvalLibelle: string | null;
  derniereEvalStatut: string | null;
  tauxSaisie: number | null;
  /** Erreurs partielles par table (pour debug — n'arrête pas le rendu) */
  errors: Record<string, string>;
}

async function fetchStats(): Promise<DashboardStats> {
  const errors: Record<string, string> = {};

  // 1. Comptages en parallèle — chaque erreur est isolée pour ne pas casser les autres
  const [elevesRes, inscriptionsRes, enCoursRes, publieesRes, derniereRes] = await Promise.all([
    supabase.from('eleves').select('*', { count: 'exact', head: true }),
    supabase
      .from('inscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('actif', true),
    supabase
      .from('evaluations')
      .select('*', { count: 'exact', head: true })
      .in('statut', ['brouillon', 'composition', 'saisie', 'calcule']),
    supabase
      .from('evaluations')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'publie'),
    supabase
      .from('evaluations')
      .select('id, libelle, statut, session')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (elevesRes.error) errors['eleves'] = elevesRes.error.message;
  if (inscriptionsRes.error) errors['inscriptions'] = inscriptionsRes.error.message;
  if (enCoursRes.error) errors['evaluations_en_cours'] = enCoursRes.error.message;
  if (publieesRes.error) errors['evaluations_publiees'] = publieesRes.error.message;
  if (derniereRes.error) errors['derniere_eval'] = derniereRes.error.message;

  // Log structuré pour debug — visible dans la console F12 du navigateur
  console.info('[dashboard:stats]', {
    eleves: { count: elevesRes.count, status: elevesRes.status, error: elevesRes.error?.message },
    inscriptions: {
      count: inscriptionsRes.count,
      status: inscriptionsRes.status,
      error: inscriptionsRes.error?.message,
    },
    evalsEnCours: {
      count: enCoursRes.count,
      status: enCoursRes.status,
      error: enCoursRes.error?.message,
    },
    evalsPubliees: {
      count: publieesRes.count,
      status: publieesRes.status,
      error: publieesRes.error?.message,
    },
    derniereEval: derniereRes.data ?? null,
  });

  const derniere = derniereRes.data;

  // 2. Taux de saisie sur la dernière évaluation
  let tauxSaisie: number | null = null;
  if (derniere) {
    const [notesRes, attenduesRes] = await Promise.all([
      supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('evaluation_id', derniere.id),
      supabase
        .from('inscriptions')
        .select(
          'concours:concours_id!inner(concours_matieres(coefficient))',
          { count: 'exact' },
        )
        .eq('actif', true)
        .eq('session', derniere.session),
    ]);

    if (notesRes.error) errors['notes'] = notesRes.error.message;
    if (attenduesRes.error) errors['attendues'] = attenduesRes.error.message;

    const notesSaisies = notesRes.count ?? 0;
    type InscriptionRow = {
      concours: { concours_matieres: { coefficient: number }[] } | null;
    };
    const inscriptions = (attenduesRes.data as InscriptionRow[] | null) ?? [];
    const totalNotesAttendues = inscriptions.reduce(
      (acc, row) => acc + (row.concours?.concours_matieres.length ?? 0),
      0,
    );
    if (totalNotesAttendues > 0) {
      tauxSaisie = Math.round((notesSaisies / totalNotesAttendues) * 100);
    }
  }

  return {
    totalEleves: elevesRes.count ?? 0,
    totalInscriptions: inscriptionsRes.count ?? 0,
    evaluationsEnCours: enCoursRes.count ?? 0,
    evaluationsPubliees: publieesRes.count ?? 0,
    derniereEvalLibelle: derniere?.libelle ?? null,
    derniereEvalStatut: derniere?.statut ?? null,
    tauxSaisie,
    errors,
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchStats,
    staleTime: 60_000,
  });
}
