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
      project_allocations: {
        Row: {
          allocated_hours: number
          created_at: string | null
          end_date: string
          id: string
          member_id: string
          project_id: string
          start_date: string
          status: string
          task_id: string | null
        }
        Insert: {
          allocated_hours: number
          created_at?: string | null
          end_date: string
          id?: string
          member_id: string
          project_id: string
          start_date: string
          status?: string
          task_id?: string | null
        }
        Update: {
          allocated_hours?: number
          created_at?: string | null
          end_date?: string
          id?: string
          member_id?: string
          project_id?: string
          start_date?: string
          status?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_allocations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_allocations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_attributes: {
        Row: {
          code: string | null
          created_at: string
          default_value: string | null
          description: string | null
          id: string
          name: string
          unit: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          default_value?: string | null
          description?: string | null
          id?: string
          name: string
          unit?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          default_value?: string | null
          description?: string | null
          id?: string
          name?: string
          unit?: string | null
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
      project_tasks: {
        Row: {
          calculated_hours: number | null
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          owner_id: string | null
          project_id: string
          start_date: string | null
          status: string | null
          task_id: string
          updated_at: string | null
        }
        Insert: {
          calculated_hours?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          owner_id?: string | null
          project_id: string
          start_date?: string | null
          status?: string | null
          task_id: string
          updated_at?: string | null
        }
        Update: {
          calculated_hours?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          owner_id?: string | null
          project_id?: string
          start_date?: string | null
          status?: string | null
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks_backup: {
        Row: {
          calculated_hours: number | null
          created_at: string | null
          end_date: string | null
          id: string | null
          is_active: boolean | null
          owner_id: string | null
          project_id: string | null
          start_date: string | null
          status: string | null
          task_id: string | null
          updated_at: string | null
        }
        Insert: {
          calculated_hours?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string | null
          is_active?: boolean | null
          owner_id?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          task_id?: string | null
          updated_at?: string | null
        }
        Update: {
          calculated_hours?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string | null
          is_active?: boolean | null
          owner_id?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          task_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          attributes: Json | null
          base_cost: number | null
          category_id: string | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
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
          status: Database["public"]["Enums"]["project_status"] | null
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
          attributes?: Json | null
          base_cost?: number | null
          category_id?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
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
          project_name: string
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
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
          attributes?: Json | null
          base_cost?: number | null
          category_id?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
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
          status?: Database["public"]["Enums"]["project_status"] | null
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
      projects_backup: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          attributes: Json | null
          base_cost: number | null
          category_id: string | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          currency: string | null
          delay_days: number | null
          deleted: boolean | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          epic: string | null
          expected_end_date: string | null
          favorite: boolean | null
          id: string | null
          metadata: Json | null
          name: string | null
          owner_id: string | null
          priority: number | null
          profit_margin: number | null
          progress: number | null
          project_name: string | null
          settings: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          tags: string[] | null
          team_id: string | null
          total_cost: number | null
          total_hours: number | null
          type: string | null
          updated_at: string | null
          version: number | null
          workspace_id: string | null
        }
        Insert: {
          archived?: boolean | null
          archived_at?: string | null
          attributes?: Json | null
          base_cost?: number | null
          category_id?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          currency?: string | null
          delay_days?: number | null
          deleted?: boolean | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          epic?: string | null
          expected_end_date?: string | null
          favorite?: boolean | null
          id?: string | null
          metadata?: Json | null
          name?: string | null
          owner_id?: string | null
          priority?: number | null
          profit_margin?: number | null
          progress?: number | null
          project_name?: string | null
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          team_id?: string | null
          total_cost?: number | null
          total_hours?: number | null
          type?: string | null
          updated_at?: string | null
          version?: number | null
          workspace_id?: string | null
        }
        Update: {
          archived?: boolean | null
          archived_at?: string | null
          attributes?: Json | null
          base_cost?: number | null
          category_id?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          currency?: string | null
          delay_days?: number | null
          deleted?: boolean | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          epic?: string | null
          expected_end_date?: string | null
          favorite?: boolean | null
          id?: string | null
          metadata?: Json | null
          name?: string | null
          owner_id?: string | null
          priority?: number | null
          profit_margin?: number | null
          progress?: number | null
          project_name?: string | null
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          team_id?: string | null
          total_cost?: number | null
          total_hours?: number | null
          type?: string | null
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
          fixed_hours: number | null
          hours_formula: string | null
          hours_type: string
          id: string
          is_active: boolean | null
          order: number | null
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
          fixed_hours?: number | null
          hours_formula?: string | null
          hours_type: string
          id?: string
          is_active?: boolean | null
          order?: number | null
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
          fixed_hours?: number | null
          hours_formula?: string | null
          hours_type?: string
          id?: string
          is_active?: boolean | null
          order?: number | null
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
      team_availability: {
        Row: {
          created_at: string | null
          daily_hours: number
          end_date: string
          id: string
          member_id: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string | null
          daily_hours?: number
          end_date: string
          id?: string
          member_id: string
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string | null
          daily_hours?: number
          end_date?: string
          id?: string
          member_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_availability_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          daily_capacity: number
          department: string | null
          email: string | null
          first_name: string
          hourly_rate: number
          id: string
          last_name: string
          position: string
          squad: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          daily_capacity?: number
          department?: string | null
          email?: string | null
          first_name: string
          hourly_rate: number
          id?: string
          last_name: string
          position: string
          squad?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          daily_capacity?: number
          department?: string | null
          email?: string | null
          first_name?: string
          hourly_rate?: number
          id?: string
          last_name?: string
          position?: string
          squad?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_attribute_code: {
        Args: { name_input: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_distinct_approved_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_limited_user: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "developer" | "financial" | "user"
      order_status:
        | "draft"
        | "pending"
        | "approved"
        | "in_progress"
        | "completed"
        | "cancelled"
      payment_status: "pending" | "paid" | "cancelled"
      project_status: "draft" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "developer", "financial", "user"],
      order_status: [
        "draft",
        "pending",
        "approved",
        "in_progress",
        "completed",
        "cancelled",
      ],
      payment_status: ["pending", "paid", "cancelled"],
      project_status: ["draft", "in_progress", "completed", "cancelled"],
    },
  },
} as const
