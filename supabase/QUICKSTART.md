# Supabase Quick Start

For developers who want to get up and running quickly.

## 5-Minute Setup

### 1. Create Supabase Project (2 min)
```
1. Go to https://supabase.com
2. Click "New Project"
3. Set name, password, region
4. Wait for project creation
```

### 2. Run Migration (1 min)
```
1. Open Supabase Dashboard > SQL Editor
2. Copy contents from: supabase/migrations/20260215000000_initial_schema.sql
3. Paste and click "Run"
```

### 3. Get API Keys (1 min)
```
1. Go to Settings > API in Supabase Dashboard
2. Copy "Project URL"
3. Copy "anon public" key
```

### 4. Configure Environment (1 min)
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your credentials
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 5. Verify Setup
```bash
# Start your dev server
npm run dev

# The Supabase connection will be tested when you sign in
```

## Database Structure

```
projects (user's main projects)
  └── figma_designs (imported Figma files)
       └── components (generated code)
  └── custom_code (user's custom files)
  └── app_configs (project configuration)
```

## Key Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Auto Timestamps**: `created_at` and `updated_at` automatically managed
- **Cascade Deletes**: Deleting a project removes all related data
- **Indexed Queries**: Optimized for fast lookups

## Common Operations

### Create a Project
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    user_id: user.id,
    name: 'My Project',
    description: 'A cool project'
  })
  .select()
```

### Get User's Projects
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .order('created_at', { ascending: false })
```

### Import Figma Design
```typescript
const { data, error } = await supabase
  .from('figma_designs')
  .insert({
    project_id: projectId,
    name: 'Homepage',
    figma_file_key: 'abc123',
    figma_data: { /* Figma API response */ }
  })
  .select()
```

### Get Project with All Data
```typescript
const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    figma_designs (
      *,
      components (*)
    ),
    custom_code (*),
    app_configs (*)
  `)
  .eq('id', projectId)
  .single()
```

## Need Help?

See the full guide in `supabase/README.md`
