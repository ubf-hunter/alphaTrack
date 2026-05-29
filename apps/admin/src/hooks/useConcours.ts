import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@alphatrack/shared';
import { supabase } from '../lib/supabase';

type ConcoursRow = Database['public']['Tables']['concours']['Row'];
type ConcoursInsert = Database['public']['Tables']['concours']['Insert'];
type ConcoursUpdate = Database['public']['Tables']['concours']['Update'];

const KEY = ['concours'] as const;

export type Concours = ConcoursRow;

export function useConcoursList() {
  return useQuery({
    queryKey: [...KEY, 'list'],
    queryFn: async (): Promise<Concours[]> => {
      const { data, error } = await supabase
        .from('concours')
        .select('*')
        .order('actif', { ascending: false })
        .order('sigle');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateConcours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ConcoursInsert): Promise<Concours> => {
      const { data, error } = await supabase
        .from('concours')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateConcours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: ConcoursUpdate;
    }): Promise<Concours> => {
      const { data, error } = await supabase
        .from('concours')
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

export function useDeleteConcours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('concours').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
