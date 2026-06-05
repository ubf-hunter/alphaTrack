import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database, EvaluationStatut } from '@alphatrack/shared';
import { supabase } from '../lib/supabase';

type EvaluationRow = Database['public']['Tables']['evaluations']['Row'];
type EvaluationInsert = Database['public']['Tables']['evaluations']['Insert'];
type EvaluationUpdate = Database['public']['Tables']['evaluations']['Update'];

const KEY = ['evaluations'] as const;

export type Evaluation = EvaluationRow;

export interface EvaluationListFilters {
  session?: string;
  statut?: EvaluationStatut;
}

export interface SaisieStats {
  notesSaisies: number;
  notesAttendues: number;
  tauxPct: number | null;
  parSousCentre: Array<{
    sous_centre_id: string;
    code: string;
    nom: string;
    saisies: number;
    attendues: number;
  }>;
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>): void {
  void qc.invalidateQueries({ queryKey: KEY });
  void qc.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
  void qc.invalidateQueries({ queryKey: ['notes'] });
  void qc.invalidateQueries({ queryKey: ['resultats'] });
}

export function useEvaluationsList(filters?: EvaluationListFilters) {
  return useQuery({
    queryKey: [...KEY, 'list', filters ?? {}],
    queryFn: async (): Promise<Evaluation[]> => {
      let q = supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false });
      if (filters?.session) q = q.eq('session', filters.session);
      if (filters?.statut) q = q.eq('statut', filters.statut);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEvaluation(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    enabled: !!id,
    queryFn: async (): Promise<Evaluation> => {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEvaluation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EvaluationInsert): Promise<Evaluation> => {
      const { data, error } = await supabase
        .from('evaluations')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateEvaluation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: EvaluationUpdate;
    }): Promise<Evaluation> => {
      const { data, error } = await supabase
        .from('evaluations')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteEvaluation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('evaluations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useChangeEvaluationStatut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      statut,
      publie_par,
    }: {
      id: string;
      statut: EvaluationStatut;
      publie_par?: string | null;
    }): Promise<Evaluation> => {
      const patch: EvaluationUpdate = { statut };
      if (statut === 'publie' && publie_par) {
        patch.publie_par = publie_par;
      }
      const { data, error } = await supabase
        .from('evaluations')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCalculerEvaluation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (evaluationId: string): Promise<void> => {
      const { error } = await supabase.rpc('calculer_evaluation', {
        p_evaluation_id: evaluationId,
      });
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useEvaluationSaisieStats(evaluationId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, 'saisie-stats', evaluationId],
    enabled: !!evaluationId,
    queryFn: async (): Promise<SaisieStats> => {
      const evalRes = await supabase
        .from('evaluations')
        .select('session')
        .eq('id', evaluationId!)
        .single();
      if (evalRes.error) throw evalRes.error;

      const [notesRes, inscriptionsRes, sousCentresRes] = await Promise.all([
        supabase
          .from('notes')
          .select('id, inscription_id')
          .eq('evaluation_id', evaluationId!),
        supabase
          .from('inscriptions')
          .select(
            `id, sous_centre_id,
             concours:concours_id!inner(concours_matieres(matiere_id)),
             sous_centre:sous_centre_id(id, code, nom)`,
          )
          .eq('actif', true)
          .eq('session', evalRes.data.session),
        supabase.from('sous_centres').select('id, code, nom').order('code'),
      ]);

      if (notesRes.error) throw notesRes.error;
      if (inscriptionsRes.error) throw inscriptionsRes.error;
      if (sousCentresRes.error) throw sousCentresRes.error;

      type InscriptionRow = {
        id: string;
        sous_centre_id: string;
        concours: { concours_matieres: { matiere_id: string }[] } | null;
        sous_centre: { id: string; code: string; nom: string } | null;
      };

      const inscriptions = (inscriptionsRes.data ?? []) as unknown as InscriptionRow[];
      const notes = notesRes.data ?? [];
      const notesByInscription = new Map<string, number>();
      for (const n of notes) {
        notesByInscription.set(n.inscription_id, (notesByInscription.get(n.inscription_id) ?? 0) + 1);
      }

      let notesAttendues = 0;
      const attenduesParSc = new Map<string, number>();
      const saisiesParSc = new Map<string, number>();

      for (const ins of inscriptions) {
        const nbMatieres = ins.concours?.concours_matieres.length ?? 0;
        notesAttendues += nbMatieres;
        const scId = ins.sous_centre_id;
        attenduesParSc.set(scId, (attenduesParSc.get(scId) ?? 0) + nbMatieres);
        saisiesParSc.set(scId, (saisiesParSc.get(scId) ?? 0) + (notesByInscription.get(ins.id) ?? 0));
      }

      const parSousCentre = (sousCentresRes.data ?? [])
        .map((sc) => ({
          sous_centre_id: sc.id,
          code: sc.code,
          nom: sc.nom,
          saisies: saisiesParSc.get(sc.id) ?? 0,
          attendues: attenduesParSc.get(sc.id) ?? 0,
        }))
        .filter((row) => row.attendues > 0);

      const notesSaisies = notes.length;
      const tauxPct =
        notesAttendues > 0 ? Math.round((notesSaisies / notesAttendues) * 100) : null;

      return { notesSaisies, notesAttendues, tauxPct, parSousCentre };
    },
  });
}
