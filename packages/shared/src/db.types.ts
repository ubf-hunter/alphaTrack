export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          actif: boolean
          created_at: string
          dernier_login: string | null
          id: string
          matricule: string
          must_change_password: boolean
          nom: string
          password_hash: string
          prenom: string
          role: Database["public"]["Enums"]["admin_role"]
          sous_centre_id: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          dernier_login?: string | null
          id?: string
          matricule: string
          must_change_password?: boolean
          nom: string
          password_hash: string
          prenom: string
          role: Database["public"]["Enums"]["admin_role"]
          sous_centre_id?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          dernier_login?: string | null
          id?: string
          matricule?: string
          must_change_password?: boolean
          nom?: string
          password_hash?: string
          prenom?: string
          role?: Database["public"]["Enums"]["admin_role"]
          sous_centre_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_sous_centre_id_fkey"
            columns: ["sous_centre_id"]
            isOneToOne: false
            referencedRelation: "sous_centres"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          acteur_id: string | null
          acteur_type: string
          action: string
          at: string
          details: Json
          entite: string
          entite_id: string | null
          id: number
          ip: unknown
        }
        Insert: {
          acteur_id?: string | null
          acteur_type: string
          action: string
          at?: string
          details?: Json
          entite: string
          entite_id?: string | null
          id?: number
          ip?: unknown
        }
        Update: {
          acteur_id?: string | null
          acteur_type?: string
          action?: string
          at?: string
          details?: Json
          entite?: string
          entite_id?: string | null
          id?: number
          ip?: unknown
        }
        Relationships: []
      }
      concours: {
        Row: {
          actif: boolean
          created_at: string
          description: string | null
          id: string
          nom: string
          sigle: string
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          sigle: string
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          sigle?: string
          updated_at?: string
        }
        Relationships: []
      }
      concours_matieres: {
        Row: {
          coefficient: number
          concours_id: string
          created_at: string
          id: string
          matiere_id: string
          updated_at: string
        }
        Insert: {
          coefficient: number
          concours_id: string
          created_at?: string
          id?: string
          matiere_id: string
          updated_at?: string
        }
        Update: {
          coefficient?: number
          concours_id?: string
          created_at?: string
          id?: string
          matiere_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "concours_matieres_concours_id_fkey"
            columns: ["concours_id"]
            isOneToOne: false
            referencedRelation: "concours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concours_matieres_matiere_id_fkey"
            columns: ["matiere_id"]
            isOneToOne: false
            referencedRelation: "matieres"
            referencedColumns: ["id"]
          },
        ]
      }
      eleves: {
        Row: {
          auth_user_id: string | null
          code_acces_hash: string | null
          created_at: string
          date_naissance: string
          email: string | null
          etablissement_origine: string | null
          id: string
          matricule: string
          nom: string
          photo_url: string | null
          prenom: string
          sexe: Database["public"]["Enums"]["sexe"]
          telephone: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          code_acces_hash?: string | null
          created_at?: string
          date_naissance: string
          email?: string | null
          etablissement_origine?: string | null
          id?: string
          matricule: string
          nom: string
          photo_url?: string | null
          prenom: string
          sexe: Database["public"]["Enums"]["sexe"]
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          code_acces_hash?: string | null
          created_at?: string
          date_naissance?: string
          email?: string | null
          etablissement_origine?: string | null
          id?: string
          matricule?: string
          nom?: string
          photo_url?: string | null
          prenom?: string
          sexe?: Database["public"]["Enums"]["sexe"]
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          created_at: string
          date_dschang: string
          date_yaounde: string
          id: string
          libelle: string
          numero: number
          publie_le: string | null
          publie_par: string | null
          session: string
          statut: Database["public"]["Enums"]["evaluation_statut"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_dschang: string
          date_yaounde: string
          id?: string
          libelle: string
          numero: number
          publie_le?: string | null
          publie_par?: string | null
          session: string
          statut?: Database["public"]["Enums"]["evaluation_statut"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_dschang?: string
          date_yaounde?: string
          id?: string
          libelle?: string
          numero?: number
          publie_le?: string | null
          publie_par?: string | null
          session?: string
          statut?: Database["public"]["Enums"]["evaluation_statut"]
          updated_at?: string
        }
        Relationships: []
      }
      evaluations_concours_coefficients: {
        Row: {
          coefficient: number
          concours_id: string
          evaluation_id: string
          matiere_id: string
          snapshot_at: string
        }
        Insert: {
          coefficient: number
          concours_id: string
          evaluation_id: string
          matiere_id: string
          snapshot_at?: string
        }
        Update: {
          coefficient?: number
          concours_id?: string
          evaluation_id?: string
          matiere_id?: string
          snapshot_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_concours_coefficients_concours_id_fkey"
            columns: ["concours_id"]
            isOneToOne: false
            referencedRelation: "concours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_concours_coefficients_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_concours_coefficients_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "v_resultats"
            referencedColumns: ["evaluation_id"]
          },
          {
            foreignKeyName: "evaluations_concours_coefficients_matiere_id_fkey"
            columns: ["matiere_id"]
            isOneToOne: false
            referencedRelation: "matieres"
            referencedColumns: ["id"]
          },
        ]
      }
      inscriptions: {
        Row: {
          actif: boolean
          concours_id: string
          created_at: string
          date_inscription: string
          eleve_id: string
          id: string
          session: string
          sous_centre_id: string
          statut_paiement: Database["public"]["Enums"]["statut_paiement"]
          updated_at: string
        }
        Insert: {
          actif?: boolean
          concours_id: string
          created_at?: string
          date_inscription?: string
          eleve_id: string
          id?: string
          session: string
          sous_centre_id: string
          statut_paiement?: Database["public"]["Enums"]["statut_paiement"]
          updated_at?: string
        }
        Update: {
          actif?: boolean
          concours_id?: string
          created_at?: string
          date_inscription?: string
          eleve_id?: string
          id?: string
          session?: string
          sous_centre_id?: string
          statut_paiement?: Database["public"]["Enums"]["statut_paiement"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_concours_id_fkey"
            columns: ["concours_id"]
            isOneToOne: false
            referencedRelation: "concours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_sous_centre_id_fkey"
            columns: ["sous_centre_id"]
            isOneToOne: false
            referencedRelation: "sous_centres"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempted_at: string
          id: number
          identifier: string
          identifier_type: string
          ip: unknown
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          id?: number
          identifier: string
          identifier_type: string
          ip?: unknown
          success: boolean
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          id?: number
          identifier?: string
          identifier_type?: string
          ip?: unknown
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      matieres: {
        Row: {
          code: string
          created_at: string
          id: string
          nom: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          nom: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          nom?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          absent: boolean
          evaluation_id: string
          id: string
          inscription_id: string
          matiere_id: string
          note: number | null
          saisie_le: string
          saisie_par: string | null
          updated_at: string
        }
        Insert: {
          absent?: boolean
          evaluation_id: string
          id?: string
          inscription_id: string
          matiere_id: string
          note?: number | null
          saisie_le?: string
          saisie_par?: string | null
          updated_at?: string
        }
        Update: {
          absent?: boolean
          evaluation_id?: string
          id?: string
          inscription_id?: string
          matiere_id?: string
          note?: number | null
          saisie_le?: string
          saisie_par?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "v_resultats"
            referencedColumns: ["evaluation_id"]
          },
          {
            foreignKeyName: "notes_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_resultats"
            referencedColumns: ["inscription_id"]
          },
          {
            foreignKeyName: "notes_matiere_id_fkey"
            columns: ["matiere_id"]
            isOneToOne: false
            referencedRelation: "matieres"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string
          id: string
          jour_composition: string
          nom: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jour_composition: string
          nom: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jour_composition?: string
          nom?: string
          updated_at?: string
        }
        Relationships: []
      }
      sous_centres: {
        Row: {
          code: string
          created_at: string
          id: string
          nom: string
          region_id: string
          updated_at: string
          ville: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          nom: string
          region_id: string
          updated_at?: string
          ville: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          nom?: string
          region_id?: string
          updated_at?: string
          ville?: string
        }
        Relationships: [
          {
            foreignKeyName: "sous_centres_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_resultats: {
        Row: {
          concours_id: string | null
          effectif_national: number | null
          effectif_regional: number | null
          effectif_sous_centre: number | null
          eleve_id: string | null
          evaluation_id: string | null
          evaluation_statut:
            | Database["public"]["Enums"]["evaluation_statut"]
            | null
          inscription_id: string | null
          moyenne: number | null
          nb_absents: number | null
          nb_notes: number | null
          non_classe: boolean | null
          rang_national: number | null
          rang_regional: number | null
          rang_sous_centre: number | null
          region_id: string | null
          somme_coefs: number | null
          somme_ponderee: number | null
          sous_centre_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_concours_id_fkey"
            columns: ["concours_id"]
            isOneToOne: false
            referencedRelation: "concours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_sous_centre_id_fkey"
            columns: ["sous_centre_id"]
            isOneToOne: false
            referencedRelation: "sous_centres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sous_centres_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculer_evaluation: {
        Args: { p_evaluation_id: string }
        Returns: undefined
      }
      change_admin_password: {
        Args: { p_admin_id: string; p_ancien: string; p_nouveau: string }
        Returns: boolean
      }
      jwt_admin_id: { Args: never; Returns: string }
      jwt_eleve_id: { Args: never; Returns: string }
      jwt_role: { Args: never; Returns: string }
      jwt_sous_centre_id: { Args: never; Returns: string }
      recent_failed_attempts: {
        Args: {
          p_identifier: string
          p_type: string
          p_window_minutes?: number
        }
        Returns: number
      }
      set_eleve_code_acces: {
        Args: { p_code: string; p_eleve_id: string }
        Returns: undefined
      }
      verify_admin_password: {
        Args: { p_matricule: string; p_password: string }
        Returns: {
          id: string
          matricule: string
          must_change_password: boolean
          role: Database["public"]["Enums"]["admin_role"]
          sous_centre_id: string
        }[]
      }
      verify_eleve_code: {
        Args: { p_code: string; p_matricule: string }
        Returns: {
          id: string
          matricule: string
          nom: string
          prenom: string
        }[]
      }
    }
    Enums: {
      admin_role: "admin" | "saisie"
      evaluation_statut:
        | "brouillon"
        | "composition"
        | "saisie"
        | "calcule"
        | "publie"
        | "archive"
      sexe: "M" | "F"
      statut_paiement: "paye" | "partiel" | "non_paye"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["admin", "saisie"],
      evaluation_statut: [
        "brouillon",
        "composition",
        "saisie",
        "calcule",
        "publie",
        "archive",
      ],
      sexe: ["M", "F"],
      statut_paiement: ["paye", "partiel", "non_paye"],
    },
  },
} as const