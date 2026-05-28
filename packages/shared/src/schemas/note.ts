import { z } from 'zod';
import { NOTE_MAX, NOTE_MIN } from '../constants';

export const noteValueSchema = z
  .number()
  .min(NOTE_MIN)
  .max(NOTE_MAX)
  .multipleOf(0.01);

export const noteUpsertSchema = z
  .object({
    inscription_id: z.string().uuid(),
    evaluation_id: z.string().uuid(),
    matiere_id: z.string().uuid(),
    note: noteValueSchema.nullable(),
    absent: z.boolean(),
  })
  .refine((d) => d.absent || d.note !== null, {
    message: 'Note requise si non absent',
    path: ['note'],
  });

export type NoteUpsert = z.infer<typeof noteUpsertSchema>;

export const noteImportRowSchema = z.object({
  matricule: z.string().min(1),
  matiere_code: z.string().min(1),
  note: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v))
    .pipe(noteValueSchema),
});

export type NoteImportRow = z.infer<typeof noteImportRowSchema>;
