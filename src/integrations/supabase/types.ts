export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      permissions: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean | null
          id: string
          module: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          module: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          supervisor_email: string | null
        }
        Insert: {
          approved?: boolean | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          supervisor_email?: string | null
        }
        Update: {
          approved?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          supervisor_email?: string | null
        }
        Relationships: []
      }
      project_attributes: {
        Row: {
          created_at: string
          default_value: string | null
          description: string | null
          id: string
          name: string
          unit: string | null
          value: string
        }
        Insert: {
          created_at?: string
          default_value?: string | null
          description?: string | null
          id?: string
          name: string
          unit?: string | null
          value: string
        }
        Update: {
          created_at?: string
          default_value?: string | null
          description?: string | null
          id?: string
          name?: string
          unit?: string | null
          value?: string
        }
        Relationships: []
      }
      project_integrations: {
        Row: {
          created_at: string
          id: string
          integration_name: string
          is_enabled: boolean | null
          project_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          integration_name: string
          is_enabled?: boolean | null
          project_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          integration_name?: string
          is_enabled?: boolean | null
          project_id?: string
          status?: string | null
        }
        Relationships: []
      }
      project_schedule: {
        Row: {
          created_at: string
          id: string
          project_id: string
          start_date: string
          workday_end: string
          workday_hours: number
          workday_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          start_date: string
          workday_end: string
          workday_hours: number
          workday_start: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          start_date?: string
          workday_end?: string
          workday_hours?: number
          workday_start?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          base_cost: number | null
          category_id: string | null
          client_id: string | null
          client_name: string | null
          created_at: string
          currency: string | null
          delay_days: number | null
          deleted: boolean | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          epic: string | null
          expected_end_date: string | null
          favorite: boolean | null
          id: string
          metadata: Json | null
          name: string
          owner_id: string | null
          priority: number | null
          profit_margin: number | null
          progress: number | null
          project_name: string
          settings: Json | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          team_id: string | null
          total_cost: number | null
          total_hours: number | null
          type: string
          updated_at: string | null
          version: number | null
          workspace_id: string | null
        }
        Insert: {
          archived?: boolean | null
          archived_at?: string | null
          base_cost?: number | null
          category_id?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          currency?: string | null
          delay_days?: number | null
          deleted?: boolean | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          epic?: string | null
          expected_end_date?: string | null
          favorite?: boolean | null
          id?: string
          metadata?: Json | null
          name: string
          owner_id?: string | null
          priority?: number | null
          profit_margin?: number | null
          progress?: number | null
          project_name?: string
          settings?: Json | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          team_id?: string | null
          total_cost?: number | null
          total_hours?: number | null
          type: string
          updated_at?: string | null
          version?: number | null
          workspace_id?: string | null
        }
        Update: {
          archived?: boolean | null
          archived_at?: string | null
          base_cost?: number | null
          category_id?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          currency?: string | null
          delay_days?: number | null
          deleted?: boolean | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          epic?: string | null
          expected_end_date?: string | null
          favorite?: boolean | null
          id?: string
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          priority?: number | null
          profit_margin?: number | null
          progress?: number | null
          project_name?: string
          settings?: Json | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          team_id?: string | null
          total_cost?: number | null
          total_hours?: number | null
          type?: string
          updated_at?: string | null
          version?: number | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          depends_on: string | null
          epic: string | null
          hours_formula: string | null
          id: string
          is_active: boolean | null
          owner: string | null
          phase: string | null
          status: string | null
          story: string | null
          task_name: string
        }
        Insert: {
          created_at?: string
          depends_on?: string | null
          epic?: string | null
          hours_formula?: string | null
          id?: string
          is_active?: boolean | null
          owner?: string | null
          phase?: string | null
          status?: string | null
          story?: string | null
          task_name: string
        }
        Update: {
          created_at?: string
          depends_on?: string | null
          epic?: string | null
          hours_formula?: string | null
          id?: string
          is_active?: boolean | null
          owner?: string | null
          phase?: string | null
          status?: string | null
          story?: string | null
          task_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_depends_on_fkey"
            columns: ["depends_on"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_distinct_approved_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_limited_user: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "developer" | "financial" | "user"
      project_status: "draft" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
