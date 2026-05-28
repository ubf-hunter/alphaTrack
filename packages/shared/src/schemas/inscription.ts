import { z } from 'zod';
import { STATUT_PAIEMENT } from '../constants';

export const inscriptionCreateSchema = z.object({
  eleve_id: z.string().uuid(),
  concours_id: z.string().uuid(),
  sous_centre_id: z.string().uuid(),
  session: z.string().regex(/^\d{4}-\d{4}$/),
  statut_paiement: z.enum(STATUT_PAIEMENT).default('non_paye'),
});

export type InscriptionCreate = z.infer<typeof inscriptionCreateSchema>;
