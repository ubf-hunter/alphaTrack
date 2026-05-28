import { z } from 'zod';
import { SEXE, ACCES_CODE_LENGTH } from '../constants';

export const matriculeEleveSchema = z
  .string()
  .regex(/^AC-\d{2}-\d{4}$/, 'Format attendu : AC-YY-NNNN (ex. AC-26-0042)');

export const codeAccesSchema = z
  .string()
  .length(ACCES_CODE_LENGTH)
  .regex(/^\d+$/, 'Code numérique uniquement');

export const eleveCreateSchema = z.object({
  matricule: matriculeEleveSchema.optional(),
  nom: z.string().min(1).max(80),
  prenom: z.string().min(1).max(80),
  sexe: z.enum(SEXE),
  date_naissance: z.string().date(),
  telephone: z
    .string()
    .regex(/^\+?\d{6,15}$/, 'Numéro invalide')
    .optional(),
  email: z.string().email().optional().or(z.literal('')),
  photo_url: z.string().url().optional().or(z.literal('')),
});

export type EleveCreate = z.infer<typeof eleveCreateSchema>;

export const eleveLoginSchema = z.object({
  matricule: matriculeEleveSchema,
  code: codeAccesSchema,
});

export type EleveLogin = z.infer<typeof eleveLoginSchema>;
