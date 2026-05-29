import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@alphatrack/shared';
import { supabase } from '../lib/supabase';

type InscriptionInsert = Database['public']['Tables']['inscriptions']['Insert'];
type InscriptionUpdate = Database['public']['Tables']['inscriptions']['Update'];

const KEY = ['inscriptions'] as const;

export interface InscriptionDetail {
  id: string;
  eleve_id: string;
  concours_id: string;
  sous_centre_id: string;
  session: string;
  statut_paiement: 'paye' | 'partiel' | 'non_paye';
  actif: boolean;
  date_inscription: string;
  concours: { id: string; sigle: string; nom: string } | null;
  sous_centre: {
    id: string;
    code: string;
    nom: string;
    region: { id: string; nom: string } | null;
  } | null;
}

export function useInscriptionsByEleve(eleveId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, 'by-eleve', eleveId],
    enabled: !!eleveId,
    queryFn: async (): Promise<InscriptionDetail[]> => {
      const { data, error } = await supabase
        .from('inscriptions')
        .select(
          `*,
           concours:concours_id(id, sigle, nom),
           sous_centre:sous_centre_id(id, code, nom, region:region_id(id, nom))`,
        )
        .eq('eleve_id', eleveId!)
        .order('date_inscription', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as InscriptionDetail[];
    },
  });
}

export function useCreateInscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: InscriptionInsert) => {
      const { data, error } = await supabase
        .from('inscriptions')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['eleves'] });
    },
  });
}

export function useUpdateInscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: InscriptionUpdate }) => {
      const { data, error } = await supabase
        .from('inscriptions')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['eleves'] });
    },
  });
}

export function useDeleteInscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inscriptions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['eleves'] });
    },
  });
}
