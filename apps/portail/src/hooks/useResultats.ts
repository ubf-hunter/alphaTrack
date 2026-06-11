// apps/portail/src/hooks/useResultats.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useMesResultats() {
  return useQuery({
    queryKey: ['mes-resultats'],
    queryFn: async () => {
      // Récupère le résumé (moyenne, rangs) depuis la vue
      const { data, error } = await supabase
        .from('v_resultats_eleves')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useMesNotes(evaluationId: string) {
  return useQuery({
    queryKey: ['mes-notes', evaluationId],
    queryFn: async () => {
      // Récupère le détail des notes par matière
      const { data, error } = await supabase
        .from('notes')
        .select(`
          valeur,
          absent,
          matiere:matieres (
            nom,
            code,
            coefficient
          )
        `)
        .eq('evaluation_id', evaluationId);

      if (error) throw error;
      return data;
    },
    enabled: !!evaluationId,
  });
}