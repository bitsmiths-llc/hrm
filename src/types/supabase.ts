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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bank_details: {
        Row: {
          account_holder: string | null
          account_number: string | null
          bank_branch: string | null
          bank_name: string | null
          created_at: string
          employee_id: string
          iban: string | null
          updated_at: string
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string
          employee_id: string
          iban?: string | null
          updated_at?: string
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string
          employee_id?: string
          iban?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          doc_type: string
          employee_id: string
          id: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          doc_type: string
          employee_id: string
          id?: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          doc_type?: string
          employee_id?: string
          id?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          accepted_at: string | null
          account_status: Database["public"]["Enums"]["account_status"]
          activated_at: string | null
          address: string | null
          cnic: string | null
          consent_at: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact: string | null
          full_name: string | null
          id: string
          invited_at: string | null
          phone: string | null
          review_note: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          account_status?: Database["public"]["Enums"]["account_status"]
          activated_at?: string | null
          address?: string | null
          cnic?: string | null
          consent_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact?: string | null
          full_name?: string | null
          id: string
          invited_at?: string | null
          phone?: string | null
          review_note?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          account_status?: Database["public"]["Enums"]["account_status"]
          activated_at?: string | null
          address?: string | null
          cnic?: string | null
          consent_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact?: string | null
          full_name?: string | null
          id?: string
          invited_at?: string | null
          phone?: string | null
          review_note?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      employment_details: {
        Row: {
          base_salary: number | null
          created_at: string
          department: string | null
          designation: string | null
          employee_id: string
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          ot_multiplier_override: number | null
          updated_at: string
          working_hours: number | null
        }
        Insert: {
          base_salary?: number | null
          created_at?: string
          department?: string | null
          designation?: string | null
          employee_id: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          ot_multiplier_override?: number | null
          updated_at?: string
          working_hours?: number | null
        }
        Update: {
          base_salary?: number | null
          created_at?: string
          department?: string | null
          designation?: string | null
          employee_id?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          ot_multiplier_override?: number | null
          updated_at?: string
          working_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employment_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      socials: {
        Row: {
          created_at: string
          employee_id: string
          github_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "socials_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_onboarding: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      submit_onboarding: { Args: never; Returns: undefined }
    }
    Enums: {
      account_status: "invited" | "onboarding" | "submitted" | "active"
      employment_type: "full_time" | "part_time"
      user_role: "admin" | "employee"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["invited", "onboarding", "submitted", "active"],
      employment_type: ["full_time", "part_time"],
      user_role: ["admin", "employee"],
    },
  },
} as const
