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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          applied_at: string
          attendance_percentage: number | null
          average_daily_earnings_rwf: number | null
          bank_account_number: string | null
          bank_name: string | null
          candidate_code: string
          cell: string | null
          cohort_id: string
          collateral_description: string | null
          collateral_value_rwf: number | null
          cooperative_name: string | null
          crb_resolution_notes: string | null
          current_vehicle_plate: string | null
          currently_driving_for: string | null
          date_of_birth: string | null
          deposit_available_rwf: number | null
          disqualification_reason: string | null
          district: string | null
          doc_bank_statement: boolean
          doc_cooperative_letter: boolean
          doc_criminal_record: boolean
          doc_deposit_proof: boolean
          doc_driving_license: boolean
          doc_loan_application_letter: boolean
          doc_marital_status_proof: boolean
          doc_medical_certificate: boolean
          doc_momo_statement: boolean
          doc_national_id: boolean
          doc_passport_photo: boolean
          doc_previous_vehicle_docs: boolean
          doc_proforma_invoice: boolean
          doc_proof_of_residence: boolean
          doc_spouse_id: boolean
          doc_tax_clearance: boolean
          doc_two_passport_photos: boolean
          doc_yego_history: boolean
          driving_license_number: string | null
          education_level: string | null
          email: string | null
          exam_score: number | null
          existing_loan_details: string | null
          full_name: string
          gender: string | null
          guarantor_name: string | null
          guarantor_occupation: string | null
          guarantor_phone: string | null
          has_bank_account: boolean | null
          has_existing_loan: boolean | null
          has_smartphone: boolean | null
          id: string
          instructor_notes: string | null
          is_cooperative_member: boolean
          license_categories: string | null
          license_issue_date: string | null
          listed_on_crb: boolean
          marital_status: string | null
          monthly_income_rwf: number | null
          national_id: string
          needs_uza_access_support: boolean | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          offers_collateral: boolean
          other_loan_bank: string | null
          other_loan_repayment_source: string | null
          phone: string
          preferred_financing: string | null
          preferred_language: string | null
          preferred_term_years: number | null
          previously_drove_for_service: boolean
          sector: string | null
          spouse_name: string | null
          status: Database["public"]["Enums"]["candidate_status"]
          target_vehicle_price_rwf: number | null
          taxi_association: string | null
          training_status: Database["public"]["Enums"]["training_status"]
          updated_at: string
          waitlist_position: number | null
          years_driving_experience: number | null
        }
        Insert: {
          applied_at?: string
          attendance_percentage?: number | null
          average_daily_earnings_rwf?: number | null
          bank_account_number?: string | null
          bank_name?: string | null
          candidate_code: string
          cell?: string | null
          cohort_id: string
          collateral_description?: string | null
          collateral_value_rwf?: number | null
          cooperative_name?: string | null
          crb_resolution_notes?: string | null
          current_vehicle_plate?: string | null
          currently_driving_for?: string | null
          date_of_birth?: string | null
          deposit_available_rwf?: number | null
          disqualification_reason?: string | null
          district?: string | null
          doc_bank_statement?: boolean
          doc_cooperative_letter?: boolean
          doc_criminal_record?: boolean
          doc_deposit_proof?: boolean
          doc_driving_license?: boolean
          doc_loan_application_letter?: boolean
          doc_marital_status_proof?: boolean
          doc_medical_certificate?: boolean
          doc_momo_statement?: boolean
          doc_national_id?: boolean
          doc_passport_photo?: boolean
          doc_previous_vehicle_docs?: boolean
          doc_proforma_invoice?: boolean
          doc_proof_of_residence?: boolean
          doc_spouse_id?: boolean
          doc_tax_clearance?: boolean
          doc_two_passport_photos?: boolean
          doc_yego_history?: boolean
          driving_license_number?: string | null
          education_level?: string | null
          email?: string | null
          exam_score?: number | null
          existing_loan_details?: string | null
          full_name: string
          gender?: string | null
          guarantor_name?: string | null
          guarantor_occupation?: string | null
          guarantor_phone?: string | null
          has_bank_account?: boolean | null
          has_existing_loan?: boolean | null
          has_smartphone?: boolean | null
          id?: string
          instructor_notes?: string | null
          is_cooperative_member?: boolean
          license_categories?: string | null
          license_issue_date?: string | null
          listed_on_crb?: boolean
          marital_status?: string | null
          monthly_income_rwf?: number | null
          national_id: string
          needs_uza_access_support?: boolean | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          offers_collateral?: boolean
          other_loan_bank?: string | null
          other_loan_repayment_source?: string | null
          phone: string
          preferred_financing?: string | null
          preferred_language?: string | null
          preferred_term_years?: number | null
          previously_drove_for_service?: boolean
          sector?: string | null
          spouse_name?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
          target_vehicle_price_rwf?: number | null
          taxi_association?: string | null
          training_status?: Database["public"]["Enums"]["training_status"]
          updated_at?: string
          waitlist_position?: number | null
          years_driving_experience?: number | null
        }
        Update: {
          applied_at?: string
          attendance_percentage?: number | null
          average_daily_earnings_rwf?: number | null
          bank_account_number?: string | null
          bank_name?: string | null
          candidate_code?: string
          cell?: string | null
          cohort_id?: string
          collateral_description?: string | null
          collateral_value_rwf?: number | null
          cooperative_name?: string | null
          crb_resolution_notes?: string | null
          current_vehicle_plate?: string | null
          currently_driving_for?: string | null
          date_of_birth?: string | null
          deposit_available_rwf?: number | null
          disqualification_reason?: string | null
          district?: string | null
          doc_bank_statement?: boolean
          doc_cooperative_letter?: boolean
          doc_criminal_record?: boolean
          doc_deposit_proof?: boolean
          doc_driving_license?: boolean
          doc_loan_application_letter?: boolean
          doc_marital_status_proof?: boolean
          doc_medical_certificate?: boolean
          doc_momo_statement?: boolean
          doc_national_id?: boolean
          doc_passport_photo?: boolean
          doc_previous_vehicle_docs?: boolean
          doc_proforma_invoice?: boolean
          doc_proof_of_residence?: boolean
          doc_spouse_id?: boolean
          doc_tax_clearance?: boolean
          doc_two_passport_photos?: boolean
          doc_yego_history?: boolean
          driving_license_number?: string | null
          education_level?: string | null
          email?: string | null
          exam_score?: number | null
          existing_loan_details?: string | null
          full_name?: string
          gender?: string | null
          guarantor_name?: string | null
          guarantor_occupation?: string | null
          guarantor_phone?: string | null
          has_bank_account?: boolean | null
          has_existing_loan?: boolean | null
          has_smartphone?: boolean | null
          id?: string
          instructor_notes?: string | null
          is_cooperative_member?: boolean
          license_categories?: string | null
          license_issue_date?: string | null
          listed_on_crb?: boolean
          marital_status?: string | null
          monthly_income_rwf?: number | null
          national_id?: string
          needs_uza_access_support?: boolean | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          offers_collateral?: boolean
          other_loan_bank?: string | null
          other_loan_repayment_source?: string | null
          phone?: string
          preferred_financing?: string | null
          preferred_language?: string | null
          preferred_term_years?: number | null
          previously_drove_for_service?: boolean
          sector?: string | null
          spouse_name?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
          target_vehicle_price_rwf?: number | null
          taxi_association?: string | null
          training_status?: Database["public"]["Enums"]["training_status"]
          updated_at?: string
          waitlist_position?: number | null
          years_driving_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          applications_open: boolean
          capacity: number
          code: string
          created_at: string
          end_date: string | null
          id: string
          instructor_id: string | null
          location: string | null
          name: string
          notes: string | null
          partner_bank: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          applications_open?: boolean
          capacity?: number
          code: string
          created_at?: string
          end_date?: string | null
          id?: string
          instructor_id?: string | null
          location?: string | null
          name: string
          notes?: string | null
          partner_bank?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          applications_open?: boolean
          capacity?: number
          code?: string
          created_at?: string
          end_date?: string | null
          id?: string
          instructor_id?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          partner_bank?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financing_institutions: {
        Row: {
          code: string
          collateral_percent: number
          created_at: string
          deposit_tiers: Json
          equity_release_percent: number
          id: string
          insurance_percent_per_year: number
          is_active: boolean
          is_default_for_program: boolean
          max_term_years: number
          min_client_contribution_rwf: number
          min_term_years: number
          name: string
          notes: string | null
          processing_fee_percent: number
          rate_tiers: Json
          supports_uza_access_topup: boolean
          target_program: string
          updated_at: string
        }
        Insert: {
          code: string
          collateral_percent?: number
          created_at?: string
          deposit_tiers?: Json
          equity_release_percent?: number
          id?: string
          insurance_percent_per_year?: number
          is_active?: boolean
          is_default_for_program?: boolean
          max_term_years?: number
          min_client_contribution_rwf?: number
          min_term_years?: number
          name: string
          notes?: string | null
          processing_fee_percent?: number
          rate_tiers?: Json
          supports_uza_access_topup?: boolean
          target_program?: string
          updated_at?: string
        }
        Update: {
          code?: string
          collateral_percent?: number
          created_at?: string
          deposit_tiers?: Json
          equity_release_percent?: number
          id?: string
          insurance_percent_per_year?: number
          is_active?: boolean
          is_default_for_program?: boolean
          max_term_years?: number
          min_client_contribution_rwf?: number
          min_term_years?: number
          name?: string
          notes?: string | null
          processing_fee_percent?: number
          rate_tiers?: Json
          supports_uza_access_topup?: boolean
          target_program?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "instructor"
      candidate_status:
        | "enrolled"
        | "waitlisted"
        | "rejected"
        | "withdrawn"
        | "graduated"
      training_status: "not_started" | "in_progress" | "completed" | "failed"
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
      app_role: ["admin", "instructor"],
      candidate_status: [
        "enrolled",
        "waitlisted",
        "rejected",
        "withdrawn",
        "graduated",
      ],
      training_status: ["not_started", "in_progress", "completed", "failed"],
    },
  },
} as const
