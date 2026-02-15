-- ==========================================
-- Useful SQL Queries for Code-Figma
-- ==========================================
-- Copy and paste these in the Supabase SQL Editor when needed

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check if all tables were created successfully
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- View all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check all indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;


-- ==========================================
-- DEVELOPMENT QUERIES
-- ==========================================

-- Count records in each table
SELECT 'projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'figma_designs', COUNT(*) FROM figma_designs
UNION ALL
SELECT 'components', COUNT(*) FROM components
UNION ALL
SELECT 'custom_code', COUNT(*) FROM custom_code
UNION ALL
SELECT 'app_configs', COUNT(*) FROM app_configs;

-- Get all projects with their design counts
SELECT
  p.id,
  p.name,
  p.created_at,
  COUNT(fd.id) as design_count
FROM projects p
LEFT JOIN figma_designs fd ON fd.project_id = p.id
GROUP BY p.id, p.name, p.created_at
ORDER BY p.created_at DESC;

-- Get full project hierarchy
SELECT
  p.name as project_name,
  fd.name as design_name,
  c.name as component_name,
  c.language
FROM projects p
LEFT JOIN figma_designs fd ON fd.project_id = p.id
LEFT JOIN components c ON c.figma_design_id = fd.id
ORDER BY p.name, fd.name, c.name;

-- Get all Figma designs with their component counts
SELECT
  fd.id,
  fd.name,
  fd.figma_file_key,
  p.name as project_name,
  COUNT(c.id) as component_count
FROM figma_designs fd
JOIN projects p ON p.id = fd.project_id
LEFT JOIN components c ON c.figma_design_id = fd.id
GROUP BY fd.id, fd.name, fd.figma_file_key, p.name
ORDER BY fd.created_at DESC;


-- ==========================================
-- CLEANUP QUERIES (USE WITH CAUTION!)
-- ==========================================

-- WARNING: These will delete data!
-- Only use during development/testing

-- Delete all data from all tables (preserves structure)
-- TRUNCATE TABLE app_configs CASCADE;
-- TRUNCATE TABLE custom_code CASCADE;
-- TRUNCATE TABLE components CASCADE;
-- TRUNCATE TABLE figma_designs CASCADE;
-- TRUNCATE TABLE projects CASCADE;

-- Delete a specific project and all related data (CASCADE handles it)
-- DELETE FROM projects WHERE id = 'your-project-id';

-- Delete all projects for a specific user
-- DELETE FROM projects WHERE user_id = 'your-user-id';


-- ==========================================
-- TESTING QUERIES
-- ==========================================

-- Test insert (will fail if not authenticated - this is expected!)
-- INSERT INTO projects (user_id, name, description)
-- VALUES (auth.uid(), 'Test Project', 'Testing RLS');

-- Get current authenticated user ID
-- SELECT auth.uid();

-- View current user's projects (only works when authenticated)
-- SELECT * FROM projects WHERE user_id = auth.uid();


-- ==========================================
-- PERFORMANCE MONITORING
-- ==========================================

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries (requires pg_stat_statements extension)
-- SELECT
--   query,
--   calls,
--   total_time,
--   mean_time,
--   max_time
-- FROM pg_stat_statements
-- ORDER BY mean_time DESC
-- LIMIT 10;


-- ==========================================
-- MIGRATION HELPERS
-- ==========================================

-- If you need to add a new column to an existing table
-- ALTER TABLE projects ADD COLUMN new_column_name TEXT;

-- If you need to remove a column
-- ALTER TABLE projects DROP COLUMN column_name;

-- If you need to rename a column
-- ALTER TABLE projects RENAME COLUMN old_name TO new_name;

-- If you need to add an index
-- CREATE INDEX idx_new_index ON projects(column_name);

-- If you need to update the RLS policy
-- DROP POLICY "policy_name" ON table_name;
-- CREATE POLICY "new_policy_name" ON table_name FOR SELECT USING (condition);


-- ==========================================
-- DATA EXPORT (for backup or migration)
-- ==========================================

-- Export all projects as JSON
-- SELECT json_agg(row_to_json(projects)) FROM projects;

-- Export complete project with all related data
-- SELECT json_build_object(
--   'project', row_to_json(p.*),
--   'figma_designs', (
--     SELECT json_agg(row_to_json(fd.*))
--     FROM figma_designs fd
--     WHERE fd.project_id = p.id
--   ),
--   'components', (
--     SELECT json_agg(row_to_json(c.*))
--     FROM components c
--     JOIN figma_designs fd ON fd.id = c.figma_design_id
--     WHERE fd.project_id = p.id
--   )
-- ) as complete_project
-- FROM projects p
-- WHERE p.id = 'your-project-id';
