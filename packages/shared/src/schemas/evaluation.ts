import { z } from 'zod';
import { EVALUATION_STATUTS } from '../constants';

export const evaluationCreateSchema = z
  .object({
    libelle: z.string().min(3).max(120),
    numero: z.number().int().positive(),
    session: z.string().regex(/^\d{4}-\d{4}$/, 'Format : YYYY-YYYY (ex. 2025-2026)'),
    date_yaounde: z.string().date(),
    date_dschang: z.string().date(),
  })
  .refine(
    (d) => new Date(d.date_dschang).getTime() >= new Date(d.date_yaounde).getTime(),
    { message: 'Dschang doit composer après Yaoundé', path: ['date_dschang'] },
  );

export type EvaluationCreate = z.infer<typeof evaluationCreateSchema>;

export const evaluationStatutSchema = z.enum(EVALUATION_STATUTS);

export const publishEvaluationSchema = z.object({
  evaluation_id: z.string().uuid(),
  libelle_confirmation: z.string().min(1),
});

export type PublishEvaluation = z.infer<typeof publishEvaluationSchema>;
