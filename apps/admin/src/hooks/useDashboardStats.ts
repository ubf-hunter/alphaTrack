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
}

async function fetchStats(): Promise<DashboardStats> {
  // 1. Compteurs basiques — head=true ne retourne pas les lignes, juste le count
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

  const derniere = derniereRes.data;

  // 2. Taux de saisie sur la dernière évaluation : nb notes saisies / (nb inscriptions × nb matières attendues)
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
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchStats,
    staleTime: 60_000,
  });
}
