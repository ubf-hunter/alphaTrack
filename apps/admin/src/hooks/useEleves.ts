import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@alphatrack/shared';
import { Utils } from '@alphatrack/shared';
import { supabase } from '../lib/supabase';

type EleveRow = Database['public']['Tables']['eleves']['Row'];
type EleveInsert = Database['public']['Tables']['eleves']['Insert'];
type EleveUpdate = Database['public']['Tables']['eleves']['Update'];

export type Eleve = EleveRow;

export interface EleveFilters {
  search?: string | undefined;
  sousCentreId?: string | undefined;
  concoursId?: string | undefined;
}

export interface EleveListItem extends Eleve {
  inscriptions: Array<{
    id: string;
    concours_id: string;
    sous_centre_id: string;
    statut_paiement: 'paye' | 'partiel' | 'non_paye';
    actif: boolean;
    concours: { sigle: string; nom: string } | null;
    sous_centre: { code: string; nom: string } | null;
  }>;
}

const KEY = ['eleves'] as const;

export function useElevesList(filters: EleveFilters = {}) {
  return useQuery({
    queryKey: [...KEY, 'list', filters],
    queryFn: async (): Promise<EleveListItem[]> => {
      let query = supabase
        .from('eleves')
        .select(
          `*,
           inscriptions(
             id, concours_id, sous_centre_id, statut_paiement, actif,
             concours:concours_id(sigle, nom),
             sous_centre:sous_centre_id(code, nom)
           )`,
        )
        .order('matricule');

      // Filtres côté serveur quand possible
      if (filters.search && filters.search.trim().length > 0) {
        const s = filters.search.trim();
        // matricule ou nom/prenom (OR via ilike)
        query = query.or(
          `matricule.ilike.%${s}%,nom.ilike.%${s}%,prenom.ilike.%${s}%`,
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = (data ?? []) as unknown as EleveListItem[];

      // Filtres dérivés des inscriptions — appliqués côté client
      if (filters.sousCentreId) {
        result = result.filter((e) =>
          e.inscriptions.some((i) => i.sous_centre_id === filters.sousCentreId),
        );
      }
      if (filters.concoursId) {
        result = result.filter((e) =>
          e.inscriptions.some((i) => i.concours_id === filters.concoursId),
        );
      }

      return result;
    },
  });
}

export interface CreateElevePayload {
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  date_naissance: string;
  telephone?: string | undefined;
  email?: string | undefined;
  photo_url?: string | undefined;
  /** Lycée ou collège d'origine — facultatif en DB, encouragé en UI */
  etablissement_origine?: string | undefined;
  /** Session courante pour le matricule (ex. 2025-2026) */
  session: string;
}

export interface CreateEleveResult {
  eleve: Eleve;
  /** Code d'accès en clair — affiché UNE SEULE FOIS à l'admin */
  code_acces_clair: string;
}

/**
 * Crée un élève : génère matricule auto (next AC-YY-NNNN dans la session),
 * crée la fiche, puis assigne un code d'accès aléatoire via RPC bcrypt.
 * Retourne le code en clair pour qu'il soit révélé une seule fois au super-admin.
 */
export function useCreateEleve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateElevePayload): Promise<CreateEleveResult> => {
      const yy = payload.session.slice(2, 4);

      // 1. Trouver le dernier matricule de la session pour incrémenter
      const { data: lastList, error: lastErr } = await supabase
        .from('eleves')
        .select('matricule')
        .like('matricule', `AC-${yy}-%`)
        .order('matricule', { ascending: false })
        .limit(1);
      if (lastErr) throw lastErr;

      const lastNum =
        lastList && lastList.length > 0
          ? parseInt(lastList[0]!.matricule.split('-')[2] ?? '0', 10)
          : 0;
      const matricule = Utils.genererMatriculeEleve(payload.session, lastNum + 1);
      const codeClair = Utils.genererCodeAcces();

      // 2. Insert eleve (sans code_acces_hash — set via RPC après)
      const insert: EleveInsert = {
        matricule,
        nom: payload.nom,
        prenom: payload.prenom,
        sexe: payload.sexe,
        date_naissance: payload.date_naissance,
        telephone: payload.telephone ?? null,
        email: payload.email ?? null,
        photo_url: payload.photo_url ?? null,
        etablissement_origine: payload.etablissement_origine ?? null,
      };

      const { data: eleve, error: insertErr } = await supabase
        .from('eleves')
        .insert(insert)
        .select()
        .single();
      if (insertErr) throw insertErr;

      // 3. Hash le code via la fonction PLPGSQL (bcrypt côté DB)
      const { error: codeErr } = await supabase.rpc('set_eleve_code_acces', {
        p_eleve_id: eleve.id,
        p_code: codeClair,
      });
      if (codeErr) {
        // Rollback côté client en cas d'échec du hash (sinon on a un élève sans code)
        await supabase.from('eleves').delete().eq('id', eleve.id);
        throw codeErr;
      }

      return { eleve, code_acces_clair: codeClair };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateEleve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: EleveUpdate;
    }): Promise<Eleve> => {
      const { data, error } = await supabase
        .from('eleves')
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

export function useDeleteEleve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('eleves').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Liste des établissements d'origine déjà saisis — pour autocomplétion datalist. */
export function useEtablissementsList() {
  return useQuery({
    queryKey: ['eleves', 'etablissements', 'distinct'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('eleves')
        .select('etablissement_origine')
        .not('etablissement_origine', 'is', null)
        .order('etablissement_origine');
      if (error) throw error;
      const set = new Set<string>();
      for (const row of data ?? []) {
        if (row.etablissement_origine) set.add(row.etablissement_origine);
      }
      return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
    },
    staleTime: 5 * 60_000,
  });
}

/** Régénère un code d'accès pour un élève qui l'a perdu. Retourne le nouveau code en clair. */
export function useResetEleveCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (eleveId: string): Promise<string> => {
      const newCode = Utils.genererCodeAcces();
      const { error } = await supabase.rpc('set_eleve_code_acces', {
        p_eleve_id: eleveId,
        p_code: newCode,
      });
      if (error) throw error;
      return newCode;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
