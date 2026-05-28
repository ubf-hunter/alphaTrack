// Placeholder — sera régénéré automatiquement après `pnpm db:types`
// (commande : supabase gen types typescript --local > packages/shared/src/db.types.ts)
//
// Ne pas éditer manuellement ce fichier. Si la commande n'a pas encore été exécutée,
// ce stub minimal évite les erreurs d'import dans les autres packages.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
