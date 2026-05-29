import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Utils } from '@alphatrack/shared';
import { supabase } from '../lib/supabase';

// ------- Schéma de validation par ligne --------------------------------------

const rowSchema = z.object({
  prenom: z.string().min(1, 'Prénom requis').max(80),
  nom: z.string().min(1, 'Nom requis').max(80),
  sexe: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .pipe(z.enum(['M', 'F'], { message: 'Sexe : M ou F' })),
  date_naissance: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format YYYY-MM-DD'),
  telephone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(
      z
        .string()
        .regex(/^\+?\d{6,15}$/, 'Téléphone invalide')
        .optional(),
    ),
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(z.string().email('Email invalide').optional()),
  concours_sigle: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v.toUpperCase() : undefined)),
  sous_centre_code: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v.toUpperCase() : undefined)),
  etablissement_origine: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(z.string().max(160, 'Établissement trop long (max 160)').optional()),
});

export type RawCsvRow = Record<string, string>;

export interface ValidatedRow {
  lineNumber: number;
  raw: RawCsvRow;
  status: 'valid' | 'invalid';
  errors: string[];
  parsed?: z.infer<typeof rowSchema>;
}

export interface BulkImportSummary {
  /** Lignes effectivement importées (avec leur matricule et code clair généré). */
  imported: Array<{
    matricule: string;
    code_acces_clair: string;
    prenom: string;
    nom: string;
    telephone: string | null;
    etablissement_origine: string | null;
    concours_sigle: string | null;
    sous_centre_code: string | null;
  }>;
  /** Lignes qui ont planté pendant l'insert (rare — RLS, contrainte unique, etc.) */
  failed: Array<{ lineNumber: number; reason: string }>;
}

const REQUIRED_HEADERS = [
  'prenom',
  'nom',
  'sexe',
  'date_naissance',
  'telephone',
  'email',
  'etablissement_origine',
  'concours_sigle',
  'sous_centre_code',
] as const;

// ------- Mapping headers (tolérance de casse / variantes) --------------------

const HEADER_ALIASES: Record<string, string> = {
  prénom: 'prenom',
  prenom: 'prenom',
  nom: 'nom',
  sexe: 'sexe',
  genre: 'sexe',
  date_naissance: 'date_naissance',
  'date de naissance': 'date_naissance',
  date_de_naissance: 'date_naissance',
  dob: 'date_naissance',
  téléphone: 'telephone',
  telephone: 'telephone',
  tel: 'telephone',
  phone: 'telephone',
  email: 'email',
  e_mail: 'email',
  etablissement: 'etablissement_origine',
  etablissement_origine: 'etablissement_origine',
  etablissement_d_origine: 'etablissement_origine',
  lycee: 'etablissement_origine',
  ecole: 'etablissement_origine',
  ecole_origine: 'etablissement_origine',
  college: 'etablissement_origine',
  concours: 'concours_sigle',
  concours_sigle: 'concours_sigle',
  sigle: 'concours_sigle',
  sous_centre: 'sous_centre_code',
  sous_centre_code: 'sous_centre_code',
  sous_centre_sigle: 'sous_centre_code',
  centre: 'sous_centre_code',
};

function normalizeHeader(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents → base
    .replace(/[\s-]+/g, '_');
}

// ------- Validation des lignes -----------------------------------------------

export function validateRows(rawRows: string[][]): {
  rows: ValidatedRow[];
  headerErrors: string[];
} {
  const headerErrors: string[] = [];
  if (rawRows.length === 0) {
    return { rows: [], headerErrors: ['Fichier vide.'] };
  }

  const rawHeaders = rawRows[0]!;
  const headers = rawHeaders.map(normalizeHeader);
  const headerMap: Record<string, number> = {};

  for (let i = 0; i < headers.length; i++) {
    const canonical = HEADER_ALIASES[headers[i]!];
    if (canonical) headerMap[canonical] = i;
  }

  for (const required of REQUIRED_HEADERS) {
    if (!(required in headerMap)) {
      headerErrors.push(`Colonne manquante : ${required}`);
    }
  }

  if (headerErrors.length > 0) {
    return { rows: [], headerErrors };
  }

  const validated: ValidatedRow[] = [];
  for (let i = 1; i < rawRows.length; i++) {
    const cells = rawRows[i]!;
    const raw: RawCsvRow = {};
    for (const col of REQUIRED_HEADERS) {
      raw[col] = cells[headerMap[col]!] ?? '';
    }

    const parseResult = rowSchema.safeParse(raw);
    if (parseResult.success) {
      const data = parseResult.data;
      // Cohérence concours/sous_centre : les deux ou aucun
      const hasConcours = !!data.concours_sigle;
      const hasSousCentre = !!data.sous_centre_code;
      if (hasConcours !== hasSousCentre) {
        validated.push({
          lineNumber: i + 1,
          raw,
          status: 'invalid',
          errors: ['Concours et sous-centre doivent être renseignés ensemble (ou tous les deux vides).'],
        });
        continue;
      }
      validated.push({
        lineNumber: i + 1,
        raw,
        status: 'valid',
        errors: [],
        parsed: data,
      });
    } else {
      const errors = parseResult.error.issues.map((iss) => {
        const path = iss.path.join('.');
        return path ? `${path} : ${iss.message}` : iss.message;
      });
      validated.push({ lineNumber: i + 1, raw, status: 'invalid', errors });
    }
  }

  return { rows: validated, headerErrors: [] };
}

// ------- Mutation d'import en batch -----------------------------------------

export function useBulkImportEleves() {
  const qc = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (validRows: ValidatedRow[]): Promise<BulkImportSummary> => {
      const session = Utils.sessionAnneeCourante();
      const yy = session.slice(2, 4);

      // 1. Pré-charge les référentiels pour résoudre concours_sigle / sous_centre_code
      const [concoursRes, sousCentresRes, matriculeRes] = await Promise.all([
        supabase.from('concours').select('id, sigle, actif'),
        supabase.from('sous_centres').select('id, code'),
        supabase
          .from('eleves')
          .select('matricule')
          .like('matricule', `AC-${yy}-%`)
          .order('matricule', { ascending: false })
          .limit(1),
      ]);

      if (concoursRes.error) throw concoursRes.error;
      if (sousCentresRes.error) throw sousCentresRes.error;
      if (matriculeRes.error) throw matriculeRes.error;

      const concoursMap = new Map<string, { id: string; actif: boolean }>();
      for (const c of concoursRes.data ?? []) {
        concoursMap.set(c.sigle.toUpperCase(), { id: c.id, actif: c.actif });
      }
      const sousCentresMap = new Map<string, string>();
      for (const sc of sousCentresRes.data ?? []) {
        sousCentresMap.set(sc.code.toUpperCase(), sc.id);
      }

      let nextNum =
        matriculeRes.data && matriculeRes.data.length > 0
          ? parseInt(matriculeRes.data[0]!.matricule.split('-')[2] ?? '0', 10)
          : 0;

      const imported: BulkImportSummary['imported'] = [];
      const failed: BulkImportSummary['failed'] = [];

      // 2. Boucle séquentielle — simple, fiable, et facile à interrompre
      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i]!;
        if (!row.parsed) continue;
        const data = row.parsed;

        // Résolution concours / sous-centre si présents
        let resolvedConcoursId: string | null = null;
        let resolvedSousCentreId: string | null = null;
        if (data.concours_sigle) {
          const concours = concoursMap.get(data.concours_sigle);
          if (!concours) {
            failed.push({
              lineNumber: row.lineNumber,
              reason: `Concours inconnu : ${data.concours_sigle}`,
            });
            setProgress(((i + 1) / validRows.length) * 100);
            continue;
          }
          if (!concours.actif) {
            failed.push({
              lineNumber: row.lineNumber,
              reason: `Concours inactif : ${data.concours_sigle}`,
            });
            setProgress(((i + 1) / validRows.length) * 100);
            continue;
          }
          resolvedConcoursId = concours.id;
        }
        if (data.sous_centre_code) {
          const id = sousCentresMap.get(data.sous_centre_code);
          if (!id) {
            failed.push({
              lineNumber: row.lineNumber,
              reason: `Sous-centre inconnu : ${data.sous_centre_code}`,
            });
            setProgress(((i + 1) / validRows.length) * 100);
            continue;
          }
          resolvedSousCentreId = id;
        }

        nextNum += 1;
        const matricule = Utils.genererMatriculeEleve(session, nextNum);
        const codeClair = Utils.genererCodeAcces();

        try {
          const { data: eleve, error: insertErr } = await supabase
            .from('eleves')
            .insert({
              matricule,
              nom: data.nom,
              prenom: data.prenom,
              sexe: data.sexe,
              date_naissance: data.date_naissance,
              telephone: data.telephone ?? null,
              email: data.email ?? null,
              etablissement_origine: data.etablissement_origine ?? null,
            })
            .select()
            .single();
          if (insertErr) throw insertErr;

          const { error: codeErr } = await supabase.rpc('set_eleve_code_acces', {
            p_eleve_id: eleve.id,
            p_code: codeClair,
          });
          if (codeErr) {
            // Rollback partiel : on supprime l'élève créé sans code valide
            await supabase.from('eleves').delete().eq('id', eleve.id);
            throw codeErr;
          }

          if (resolvedConcoursId && resolvedSousCentreId) {
            const { error: inscErr } = await supabase.from('inscriptions').insert({
              eleve_id: eleve.id,
              concours_id: resolvedConcoursId,
              sous_centre_id: resolvedSousCentreId,
              session,
              statut_paiement: 'non_paye',
            });
            if (inscErr) {
              // Inscription échouée : on garde l'élève (l'admin pourra l'inscrire à la main)
              failed.push({
                lineNumber: row.lineNumber,
                reason: `Élève créé mais inscription échouée : ${inscErr.message}`,
              });
            }
          }

          imported.push({
            matricule,
            code_acces_clair: codeClair,
            prenom: data.prenom,
            nom: data.nom,
            telephone: data.telephone ?? null,
            etablissement_origine: data.etablissement_origine ?? null,
            concours_sigle: data.concours_sigle ?? null,
            sous_centre_code: data.sous_centre_code ?? null,
          });
        } catch (err) {
          // Décrément du compteur pour récupérer le matricule
          nextNum -= 1;
          failed.push({
            lineNumber: row.lineNumber,
            reason: (err as Error).message,
          });
        }

        setProgress(((i + 1) / validRows.length) * 100);
      }

      return { imported, failed };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['eleves'] }),
  });

  return { ...mutation, progress, resetProgress: () => setProgress(0) };
}
