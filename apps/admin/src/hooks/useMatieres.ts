import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@alphatrack/shared';
import { supabase } from '../lib/supabase';

type MatiereRow = Database['public']['Tables']['matieres']['Row'];
type MatiereInsert = Database['public']['Tables']['matieres']['Insert'];
type MatiereUpdate = Database['public']['Tables']['matieres']['Update'];

const KEY = ['matieres'] as const;

export type Matiere = MatiereRow;

export function useMatieresList() {
  return useQuery({
    queryKey: [...KEY, 'list'],
    queryFn: async (): Promise<Matiere[]> => {
      const { data, error } = await supabase
        .from('matieres')
        .select('*')
        .order('nom');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateMatiere() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MatiereInsert): Promise<Matiere> => {
      const { data, error } = await supabase
        .from('matieres')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateMatiere() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: MatiereUpdate;
    }): Promise<Matiere> => {
      const { data, error } = await supabase
        .from('matieres')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteMatiere() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('matieres').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
