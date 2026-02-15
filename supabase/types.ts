/**
 * Supabase Database Types
 *
 * These types match the database schema defined in migrations.
 * Auto-generated types can be created with: npx supabase gen types typescript
 *
 * Usage in your app:
 * import type { Database, Tables, TablesInsert, TablesUpdate } from '@/supabase/types'
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      figma_designs: {
        Row: {
          id: string
          project_id: string
          name: string
          figma_file_key: string
          figma_node_id: string | null
          thumbnail_url: string | null
          figma_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          figma_file_key: string
          figma_node_id?: string | null
          thumbnail_url?: string | null
          figma_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          figma_file_key?: string
          figma_node_id?: string | null
          thumbnail_url?: string | null
          figma_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "figma_designs_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      components: {
        Row: {
          id: string
          figma_design_id: string
          name: string
          code: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          figma_design_id: string
          name: string
          code: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          figma_design_id?: string
          name?: string
          code?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "components_figma_design_id_fkey"
            columns: ["figma_design_id"]
            referencedRelation: "figma_designs"
            referencedColumns: ["id"]
          }
        ]
      }
      custom_code: {
        Row: {
          id: string
          project_id: string
          file_path: string
          code: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          file_path: string
          code: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          file_path?: string
          code?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_code_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      app_configs: {
        Row: {
          id: string
          project_id: string
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          config: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_configs_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types for convenience
export type Project = Tables<'projects'>
export type ProjectInsert = TablesInsert<'projects'>
export type ProjectUpdate = TablesUpdate<'projects'>

export type FigmaDesign = Tables<'figma_designs'>
export type FigmaDesignInsert = TablesInsert<'figma_designs'>
export type FigmaDesignUpdate = TablesUpdate<'figma_designs'>

export type Component = Tables<'components'>
export type ComponentInsert = TablesInsert<'components'>
export type ComponentUpdate = TablesUpdate<'components'>

export type CustomCode = Tables<'custom_code'>
export type CustomCodeInsert = TablesInsert<'custom_code'>
export type CustomCodeUpdate = TablesUpdate<'custom_code'>

export type AppConfig = Tables<'app_configs'>
export type AppConfigInsert = TablesInsert<'app_configs'>
export type AppConfigUpdate = TablesUpdate<'app_configs'>

// Extended types with relationships for queries
export type ProjectWithDesigns = Project & {
  figma_designs: FigmaDesign[]
  custom_code: CustomCode[]
  app_configs: AppConfig[]
}

export type FigmaDesignWithComponents = FigmaDesign & {
  components: Component[]
}

export type ProjectComplete = Project & {
  figma_designs: FigmaDesignWithComponents[]
  custom_code: CustomCode[]
  app_configs: AppConfig[]
}

// App config structure (customize based on your needs)
export interface AppConfigData {
  routes?: {
    path: string
    component: string
    name: string
  }[]
  navigation?: {
    items: {
      label: string
      path: string
      icon?: string
    }[]
  }
  apiEndpoints?: {
    name: string
    url: string
    method: string
  }[]
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    font?: string
  }
  // Add more config properties as needed
}
