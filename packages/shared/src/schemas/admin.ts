import { z } from 'zod';
import { ADMIN_ROLES, PASSWORD_POLICY } from '../constants';

export const matriculeAdminSchema = z
  .string()
  .regex(/^ADM-\d{3}$/, 'Format attendu : ADM-NNN (ex. ADM-001)');

export const passwordSchema = z
  .string()
  .min(PASSWORD_POLICY.minLength, `Au moins ${PASSWORD_POLICY.minLength} caractères`)
  .refine((p) => /[A-Z]/.test(p), 'Au moins une majuscule')
  .refine((p) => /\d/.test(p), 'Au moins un chiffre')
  .refine((p) => /[^A-Za-z0-9]/.test(p), 'Au moins un caractère spécial');

export const adminLoginSchema = z.object({
  matricule: matriculeAdminSchema,
  password: z.string().min(1),
});

export type AdminLogin = z.infer<typeof adminLoginSchema>;

export const adminCreateSchema = z.object({
  matricule: matriculeAdminSchema.optional(),
  nom: z.string().min(1).max(80),
  prenom: z.string().min(1).max(80),
  role: z.enum(ADMIN_ROLES),
  sous_centre_id: z.string().uuid().nullable(),
  password: passwordSchema,
});

export type AdminCreate = z.infer<typeof adminCreateSchema>;

export const changePasswordSchema = z
  .object({
    ancien: z.string().min(1),
    nouveau: passwordSchema,
    confirmation: z.string().min(1),
  })
  .refine((d) => d.nouveau === d.confirmation, {
    message: 'La confirmation ne correspond pas',
    path: ['confirmation'],
  });

export type ChangePassword = z.infer<typeof changePasswordSchema>;
