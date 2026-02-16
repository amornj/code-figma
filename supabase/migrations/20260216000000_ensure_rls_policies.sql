-- Migration: Ensure all RLS policies exist for figma_designs, components, custom_code, and app_configs
-- This migration uses IF NOT EXISTS patterns (via DO blocks) to be safely re-runnable.

-- Ensure RLS is enabled on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configs ENABLE ROW LEVEL SECURITY;

-- Helper: Drop and recreate policies to ensure they are correct.
-- Using DROP IF EXISTS + CREATE to be idempotent.

-- ===========================================
-- Projects table policies
-- ===========================================
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own projects" ON projects;
CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- Figma Designs table policies
-- ===========================================
DROP POLICY IF EXISTS "Users can view own figma designs" ON figma_designs;
CREATE POLICY "Users can view own figma designs"
  ON figma_designs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = figma_designs.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own figma designs" ON figma_designs;
CREATE POLICY "Users can create own figma designs"
  ON figma_designs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = figma_designs.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own figma designs" ON figma_designs;
CREATE POLICY "Users can update own figma designs"
  ON figma_designs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = figma_designs.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own figma designs" ON figma_designs;
CREATE POLICY "Users can delete own figma designs"
  ON figma_designs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = figma_designs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ===========================================
-- Components table policies
-- ===========================================
DROP POLICY IF EXISTS "Users can view own components" ON components;
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

DROP POLICY IF EXISTS "Users can create own components" ON components;
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

DROP POLICY IF EXISTS "Users can update own components" ON components;
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

DROP POLICY IF EXISTS "Users can delete own components" ON components;
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

-- ===========================================
-- Custom Code table policies
-- ===========================================
DROP POLICY IF EXISTS "Users can view own custom code" ON custom_code;
CREATE POLICY "Users can view own custom code"
  ON custom_code FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_code.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own custom code" ON custom_code;
CREATE POLICY "Users can create own custom code"
  ON custom_code FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_code.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own custom code" ON custom_code;
CREATE POLICY "Users can update own custom code"
  ON custom_code FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_code.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own custom code" ON custom_code;
CREATE POLICY "Users can delete own custom code"
  ON custom_code FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_code.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ===========================================
-- App Configs table policies
-- ===========================================
DROP POLICY IF EXISTS "Users can view own app configs" ON app_configs;
CREATE POLICY "Users can view own app configs"
  ON app_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own app configs" ON app_configs;
CREATE POLICY "Users can create own app configs"
  ON app_configs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own app configs" ON app_configs;
CREATE POLICY "Users can update own app configs"
  ON app_configs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own app configs" ON app_configs;
CREATE POLICY "Users can delete own app configs"
  ON app_configs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );
