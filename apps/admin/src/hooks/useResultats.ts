import { useQuery } from '@tanstack/react-query';
import type { Database } from '@alphatrack/shared';
import { supabase } from '../lib/supabase';

type ResultatRow = Database['public']['Views']['v_resultats']['Row'];

const KEY = ['resultats'] as const;

export interface ResultatDetail extends ResultatRow {
  eleve: {
    id: string;
    matricule: string;
    nom: string;
    prenom: string;
  } | null;
}

export interface ResultatsFilters {
  evaluationId: string;
  concoursId: string;
  nonClasseOnly?: boolean;
}

export function useResultats(filters: ResultatsFilters | undefined) {
  return useQuery({
    queryKey: [...KEY, filters],
    enabled: !!filters?.evaluationId && !!filters?.concoursId,
    queryFn: async (): Promise<ResultatDetail[]> => {
      let q = supabase
        .from('v_resultats')
        .select(
          `*,
           eleve:eleve_id(id, matricule, nom, prenom)`,
        )
        .eq('evaluation_id', filters!.evaluationId)
        .eq('concours_id', filters!.concoursId)
        .order('rang_national', { ascending: true, nullsFirst: false });

      if (filters!.nonClasseOnly) {
        q = q.eq('non_classe', true);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as ResultatDetail[];
    },
  });
}
