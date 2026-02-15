# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Code-Figma project.

## Table of Contents
1. [Create a Supabase Project](#1-create-a-supabase-project)
2. [Run Database Migrations](#2-run-database-migrations)
3. [Get Your API Keys](#3-get-your-api-keys)
4. [Configure Environment Variables](#4-configure-environment-variables)
5. [Verify Setup](#5-verify-setup)
6. [Database Schema Overview](#6-database-schema-overview)

---

## 1. Create a Supabase Project

1. **Sign up or log in** to [Supabase](https://supabase.com)
   - You can use the free tier for this project

2. **Create a new project**
   - Click "New Project"
   - Choose an organization (or create one)
   - Fill in the project details:
     - **Name**: `code-figma` (or any name you prefer)
     - **Database Password**: Choose a strong password and save it securely
     - **Region**: Choose the region closest to you or your users
     - **Pricing Plan**: Free tier is perfect for development

3. **Wait for project setup**
   - This usually takes 1-2 minutes
   - You'll see a progress indicator

---

## 2. Run Database Migrations

You have two options for running the migrations:

### Option A: Using Supabase Dashboard (Easiest)

1. **Go to the SQL Editor**
   - In your Supabase project dashboard, navigate to **SQL Editor** in the left sidebar

2. **Create a new query**
   - Click "New Query"

3. **Copy and paste the migration file**
   - Open `supabase/migrations/20260215000000_initial_schema.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the migration**
   - Click "Run" or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
   - You should see "Success. No rows returned" (this is expected)

5. **Verify tables were created**
   - Navigate to **Table Editor** in the left sidebar
   - You should see all 5 tables: `projects`, `figma_designs`, `components`, `custom_code`, `app_configs`

### Option B: Using Supabase CLI (Advanced)

If you prefer using the CLI:

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   - Find your project ref in the Supabase dashboard URL: `https://app.supabase.com/project/[your-project-ref]`

4. **Push migrations**
   ```bash
   supabase db push
   ```

---

## 3. Get Your API Keys

1. **Navigate to Project Settings**
   - Click the gear icon in the left sidebar
   - Go to **API** section

2. **Copy your credentials**
   You'll need two pieces of information:

   - **Project URL** (under "Project URL")
     - Example: `https://abcdefghijklmnop.supabase.co`

   - **Anon/Public Key** (under "Project API keys")
     - Look for the `anon` `public` key (it's a long JWT token)
     - This key is safe to use in your frontend code

3. **Keep these secure**
   - Don't commit these to version control
   - Use environment variables (see next step)

---

## 4. Configure Environment Variables

1. **Copy the example environment file**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file**
   - Add your Supabase credentials:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here

   # Figma Configuration (get this from Figma)
   VITE_FIGMA_ACCESS_TOKEN=your-figma-token

   # AI Configuration (optional - for chatbox feature)
   # VITE_OPENAI_API_KEY=your-openai-key
   # VITE_ANTHROPIC_API_KEY=your-anthropic-key
   ```

3. **Save the file**
   - The `.env` file is already in `.gitignore` to prevent accidental commits

---

## 5. Verify Setup

### Test Database Connection

1. **Create a test query in Supabase Dashboard**
   - Go to **SQL Editor**
   - Run this query:

   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

   - You should see all 5 tables listed

2. **Test Row Level Security**
   - Try inserting a test row (this will fail if not authenticated - this is expected!):

   ```sql
   INSERT INTO projects (user_id, name, description)
   VALUES (auth.uid(), 'Test Project', 'Testing RLS');
   ```

   - If you get an error about `auth.uid()`, that's correct - RLS is working!

### Test in Your Application

Once you've configured the environment variables, test the connection in your app:

```typescript
// In your browser console or a test file
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Test the connection
const { data, error } = await supabase.from('projects').select('count')
console.log('Connection test:', { data, error })
```

---

## 6. Database Schema Overview

### Tables

#### `projects`
The main project table. Each user can have multiple projects.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users (Supabase Auth) |
| name | TEXT | Project name |
| description | TEXT | Optional project description |
| created_at | TIMESTAMP | Auto-generated creation time |
| updated_at | TIMESTAMP | Auto-updated modification time |

#### `figma_designs`
Stores imported Figma designs linked to projects.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | References projects table |
| name | TEXT | Design name |
| figma_file_key | TEXT | Figma file identifier |
| figma_node_id | TEXT | Specific frame/component ID (optional) |
| thumbnail_url | TEXT | URL to design preview image |
| figma_data | JSONB | Raw Figma API response data |
| created_at | TIMESTAMP | Auto-generated creation time |
| updated_at | TIMESTAMP | Auto-updated modification time |

#### `components`
Stores generated code from Figma designs.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| figma_design_id | UUID | References figma_designs table |
| name | TEXT | Component name |
| code | TEXT | The actual component code (React/TSX) |
| language | TEXT | Code language (default: 'tsx') |
| created_at | TIMESTAMP | Auto-generated creation time |
| updated_at | TIMESTAMP | Auto-updated modification time |

#### `custom_code`
Stores user-added custom code files (utils, API clients, etc.).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | References projects table |
| file_path | TEXT | File path (e.g., "utils/api.ts") |
| code | TEXT | The actual code content |
| language | TEXT | Code language (default: 'typescript') |
| created_at | TIMESTAMP | Auto-generated creation time |
| updated_at | TIMESTAMP | Auto-updated modification time |

#### `app_configs`
Stores application configuration (routes, navigation, etc.).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | References projects table (unique) |
| config | JSONB | Configuration object |
| created_at | TIMESTAMP | Auto-generated creation time |
| updated_at | TIMESTAMP | Auto-updated modification time |

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Projects**: Users can only view/create/update/delete their own projects
- **Figma Designs**: Users can only access designs belonging to their projects
- **Components**: Users can only access components from their Figma designs
- **Custom Code**: Users can only access custom code from their projects
- **App Configs**: Users can only access configs from their projects

This ensures complete data isolation between users.

### Automatic Timestamps

All tables have triggers that automatically update the `updated_at` timestamp whenever a row is modified.

---

## Troubleshooting

### Issue: "relation 'auth.users' does not exist"

**Solution**: The `auth.users` table is managed by Supabase Auth and should exist by default. If you see this error, make sure your Supabase project was created successfully.

### Issue: "permission denied for table"

**Solution**: This is expected if you're not authenticated! RLS policies require authentication. Make sure to:
1. Sign up/sign in through Supabase Auth
2. Use the authenticated user's token for requests

### Issue: Cannot insert data

**Solution**: Check that:
1. You're authenticated (have a valid session)
2. The `user_id` matches `auth.uid()`
3. Foreign key references are valid (e.g., `project_id` exists in `projects` table)

### Issue: Environment variables not loading

**Solution**:
1. Make sure your `.env` file is in the project root
2. Restart your dev server after changing `.env`
3. Vite requires the `VITE_` prefix for client-side variables

---

## Next Steps

1. **Set up Authentication**
   - Implement sign up/sign in pages
   - Use Supabase Auth for user management
   - See [Supabase Auth docs](https://supabase.com/docs/guides/auth)

2. **Get Figma Access Token**
   - Follow the instructions in `CLAUDE.md`
   - Add it to your `.env` file

3. **Start Building**
   - Create the Supabase client (`src/lib/supabase.ts`)
   - Build authentication flow
   - Create project CRUD operations
   - Import Figma designs

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## Support

If you encounter any issues:
1. Check the [Supabase Discord](https://discord.supabase.com)
2. Review [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
3. Consult the project's `CLAUDE.md` file
