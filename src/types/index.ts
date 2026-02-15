export interface User {
  id: string
  email: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface FigmaDesign {
  id: string
  project_id: string
  name: string
  figma_file_key: string
  figma_node_id: string | null
  thumbnail_url: string | null
  figma_data: any
  created_at: string
  updated_at: string
}

export interface Component {
  id: string
  figma_design_id: string
  name: string
  code: string
  language: string
  created_at: string
  updated_at: string
}

export interface CustomCode {
  id: string
  project_id: string
  file_path: string
  code: string
  language: string
  created_at: string
  updated_at: string
}

export interface AppConfig {
  id: string
  project_id: string
  config: any
  created_at: string
  updated_at: string
}
