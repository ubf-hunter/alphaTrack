import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@alphatrack/shared';
import { supabase } from '../lib/supabase';

type ConcoursMatiereRow = Database['public']['Tables']['concours_matieres']['Row'];

export interface CoefficientCell {
  concours_id: string;
  matiere_id: string;
  coefficient: number | null;
  /** id de la ligne concours_matieres si elle existe déjà */
  id?: string;
}

const KEY = ['coefficients'] as const;

export function useCoefficientsList() {
  return useQuery({
    queryKey: [...KEY, 'list'],
    queryFn: async (): Promise<ConcoursMatiereRow[]> => {
      const { data, error } = await supabase
        .from('concours_matieres')
        .select('*');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export interface UpsertCoeffPayload {
  concours_id: string;
  matiere_id: string;
  coefficient: number;
}

export function useUpsertCoefficient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertCoeffPayload): Promise<ConcoursMatiereRow> => {
      // upsert sur (concours_id, matiere_id) — la contrainte UNIQUE est définie
      const { data, error } = await supabase
        .from('concours_matieres')
        .upsert(payload, { onConflict: 'concours_id,matiere_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCoefficient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      concours_id,
      matiere_id,
    }: {
      concours_id: string;
      matiere_id: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from('concours_matieres')
        .delete()
        .eq('concours_id', concours_id)
        .eq('matiere_id', matiere_id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
