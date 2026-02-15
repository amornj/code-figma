-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Figma Designs table (imported designs)
CREATE TABLE figma_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  figma_file_key TEXT NOT NULL,
  figma_node_id TEXT, -- Specific frame/component
  thumbnail_url TEXT,
  figma_data JSONB, -- Raw Figma API response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Components table (generated code from designs)
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  figma_design_id UUID REFERENCES figma_designs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL, -- The actual component code
  language TEXT DEFAULT 'tsx',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Code table (user-added functionality)
CREATE TABLE custom_code (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL, -- e.g., "utils/api.ts"
  code TEXT NOT NULL,
  language TEXT DEFAULT 'typescript',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Configuration table
CREATE TABLE app_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  config JSONB NOT NULL, -- Routes, navigation, API endpoints, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id) -- One config per project
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_figma_designs_project_id ON figma_designs(project_id);
CREATE INDEX idx_components_figma_design_id ON components(figma_design_id);
CREATE INDEX idx_custom_code_project_id ON custom_code(project_id);
CREATE INDEX idx_app_configs_project_id ON app_configs(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Projects table
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Figma Designs table
CREATE POLICY "Users can view own figma designs"
  ON figma_designs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = figma_designs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own figma designs"
  ON figma_designs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = figma_designs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own figma designs"
  ON figma_designs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = figma_designs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own figma designs"
  ON figma_designs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = figma_designs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for Components table
CREATE POLICY "Users can view own components"
  ON components FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM figma_designs
      JOIN projects ON projects.id = figma_designs.project_id
      WHERE figma_designs.id = components.figma_design_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own components"
  ON components FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM figma_designs
      JOIN projects ON projects.id = figma_designs.project_id
      WHERE figma_designs.id = components.figma_design_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own components"
  ON components FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM figma_designs
      JOIN projects ON projects.id = figma_designs.project_id
      WHERE figma_designs.id = components.figma_design_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own components"
  ON components FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM figma_designs
      JOIN projects ON projects.id = figma_designs.project_id
      WHERE figma_designs.id = components.figma_design_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for Custom Code table
CREATE POLICY "Users can view own custom code"
  ON custom_code FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_code.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own custom code"
  ON custom_code FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_code.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own custom code"
  ON custom_code FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_code.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own custom code"
  ON custom_code FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_code.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for App Configs table
CREATE POLICY "Users can view own app configs"
  ON app_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own app configs"
  ON app_configs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own app configs"
  ON app_configs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own app configs"
  ON app_configs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at on UPDATE
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_figma_designs_updated_at
  BEFORE UPDATE ON figma_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_code_updated_at
  BEFORE UPDATE ON custom_code
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_configs_updated_at
  BEFORE UPDATE ON app_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
