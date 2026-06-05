import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@alphatrack/shared';
import { supabase } from '../lib/supabase';

type NoteInsert = Database['public']['Tables']['notes']['Insert'];

const KEY = ['notes'] as const;

export interface NoteGridRow {
  inscription_id: string;
  matricule: string;
  nom: string;
  prenom: string;
  sous_centre_code: string;
  note_id: string | null;
  note: number | null;
  absent: boolean;
}

export interface NotesGridParams {
  evaluationId: string;
  concoursId: string;
  matiereId: string;
  session: string;
  sousCentreId?: string;
}

export function useNotesGrid(params: NotesGridParams | undefined) {
  return useQuery({
    queryKey: [...KEY, 'grid', params],
    enabled: !!params?.evaluationId && !!params?.concoursId && !!params?.matiereId,
    queryFn: async (): Promise<NoteGridRow[]> => {
      const p = params!;
      let insQuery = supabase
        .from('inscriptions')
        .select(
          `id,
           eleve:eleve_id(matricule, nom, prenom),
           sous_centre:sous_centre_id(code)`,
        )
        .eq('actif', true)
        .eq('session', p.session)
        .eq('concours_id', p.concoursId)
        .order('id');

      if (p.sousCentreId) {
        insQuery = insQuery.eq('sous_centre_id', p.sousCentreId);
      }

      const [insRes, notesRes] = await Promise.all([
        insQuery,
        supabase
          .from('notes')
          .select('id, inscription_id, note, absent')
          .eq('evaluation_id', p.evaluationId)
          .eq('matiere_id', p.matiereId),
      ]);

      if (insRes.error) throw insRes.error;
      if (notesRes.error) throw notesRes.error;

      type InsRow = {
        id: string;
        eleve: { matricule: string; nom: string; prenom: string } | null;
        sous_centre: { code: string } | null;
      };

      const noteMap = new Map(
        (notesRes.data ?? []).map((n) => [n.inscription_id, n]),
      );

      return ((insRes.data ?? []) as unknown as InsRow[]).map((ins) => {
        const existing = noteMap.get(ins.id);
        return {
          inscription_id: ins.id,
          matricule: ins.eleve?.matricule ?? '—',
          nom: ins.eleve?.nom ?? '—',
          prenom: ins.eleve?.prenom ?? '',
          sous_centre_code: ins.sous_centre?.code ?? '—',
          note_id: existing?.id ?? null,
          note: existing?.note ?? null,
          absent: existing?.absent ?? false,
        };
      });
    },
  });
}

export function useUpsertNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NoteInsert): Promise<void> => {
      const { error } = await supabase.from('notes').upsert(payload, {
        onConflict: 'inscription_id,evaluation_id,matiere_id',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEY });
      void qc.invalidateQueries({ queryKey: ['evaluations'] });
      void qc.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export interface NoteBatchItem {
  inscription_id: string;
  evaluation_id: string;
  matiere_id: string;
  note: number | null;
  absent: boolean;
  saisie_par?: string | null;
}

export function useUpsertNotesBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: NoteBatchItem[]): Promise<void> => {
      if (items.length === 0) return;
      const { error } = await supabase.from('notes').upsert(items, {
        onConflict: 'inscription_id,evaluation_id,matiere_id',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEY });
      void qc.invalidateQueries({ queryKey: ['evaluations'] });
      void qc.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}
