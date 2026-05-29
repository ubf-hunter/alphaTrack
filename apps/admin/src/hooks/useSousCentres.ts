import { useQuery } from '@tanstack/react-query';
import type { Database } from '@alphatrack/shared';
import { supabase } from '../lib/supabase';

type SousCentreRow = Database['public']['Tables']['sous_centres']['Row'];
type RegionRow = Database['public']['Tables']['regions']['Row'];

export interface SousCentreWithRegion extends SousCentreRow {
  region: RegionRow | null;
}

export interface RegionWithSousCentres extends RegionRow {
  sous_centres: SousCentreRow[];
}

export function useSousCentresList() {
  return useQuery({
    queryKey: ['sous_centres', 'list'],
    queryFn: async (): Promise<SousCentreWithRegion[]> => {
      const { data, error } = await supabase
        .from('sous_centres')
        .select('*, region:region_id(*)')
        .order('code');
      if (error) throw error;
      return (data ?? []) as SousCentreWithRegion[];
    },
  });
}

export function useRegionsWithSousCentres() {
  return useQuery({
    queryKey: ['regions', 'with-sous-centres'],
    queryFn: async (): Promise<RegionWithSousCentres[]> => {
      const { data, error } = await supabase
        .from('regions')
        .select('*, sous_centres(*)')
        .order('nom');
      if (error) throw error;
      return (data ?? []) as RegionWithSousCentres[];
    },
  });
}
