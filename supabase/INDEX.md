# Supabase Setup - Documentation Index

Welcome to the Supabase setup for the Code-Figma project! This directory contains everything you need to set up and manage your Supabase database.

## Quick Navigation

### 🚀 Getting Started (Start Here!)
1. **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step checklist
2. **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute quick setup guide
3. **[README.md](./README.md)** - Complete setup guide with detailed instructions

### 📁 Files in This Directory

| File | Purpose | When to Use |
|------|---------|-------------|
| **README.md** | Comprehensive setup guide | First-time setup, detailed instructions |
| **QUICKSTART.md** | 5-minute setup guide | Quick reference, experienced users |
| **SETUP_CHECKLIST.md** | Step-by-step checklist | Track your progress during setup |
| **SCHEMA_DIAGRAM.md** | Visual database schema | Understanding table relationships |
| **useful_queries.sql** | SQL query reference | Development, testing, debugging |
| **types.ts** | TypeScript type definitions | Application development |
| **migrations/** | Database migration files | Initial setup, schema changes |

## Directory Structure

```
supabase/
├── INDEX.md                         # This file - documentation index
├── README.md                        # Complete setup guide
├── QUICKSTART.md                    # 5-minute quick reference
├── SETUP_CHECKLIST.md              # Setup progress checklist
├── SCHEMA_DIAGRAM.md               # Visual database schema
├── useful_queries.sql              # Helpful SQL queries
├── types.ts                        # TypeScript definitions
└── migrations/
    └── 20260215000000_initial_schema.sql  # Initial database schema
```

## Setup Workflow

```
1. Create Supabase Account & Project
         ↓
2. Run Migration (SQL in Dashboard)
         ↓
3. Get API Keys from Dashboard
         ↓
4. Configure .env File
         ↓
5. Start Building Your App!
```

## Database Overview

### Tables Created
The migration creates 5 tables with full Row Level Security:

1. **projects** - User's main projects
2. **figma_designs** - Imported Figma files
3. **components** - Generated React components
4. **custom_code** - User-added custom code
5. **app_configs** - Application configuration

All tables include:
- Automatic UUID primary keys
- Auto-updating timestamps
- Row Level Security (RLS) policies
- Cascade delete behavior
- Performance indexes

## File Descriptions

### 📖 README.md
**Full Setup Guide**

Complete instructions for:
- Creating a Supabase project
- Running migrations (Dashboard or CLI)
- Getting API keys
- Configuring environment variables
- Verifying setup
- Understanding database schema
- Troubleshooting common issues

**Read this for**: First-time setup, detailed explanations

---

### ⚡ QUICKSTART.md
**5-Minute Setup**

Condensed version with:
- Minimal setup steps
- Quick reference for common operations
- Database structure overview
- Code examples

**Read this for**: Quick reference, already familiar with Supabase

---

### ✅ SETUP_CHECKLIST.md
**Progress Tracker**

Interactive checklist covering:
- Pre-setup requirements
- Account creation
- Database setup
- API configuration
- Verification steps
- Next steps

**Use this to**: Track your setup progress, ensure nothing is missed

---

### 📊 SCHEMA_DIAGRAM.md
**Visual Database Schema**

Includes:
- Entity Relationship Diagram (ERD)
- Table relationships
- Data flow visualization
- Security model hierarchy
- JSON schema examples
- Query examples

**Use this to**: Understand database structure, plan queries, visualize data flow

---

### 🔧 useful_queries.sql
**SQL Query Reference**

Contains:
- Verification queries
- Development queries
- Testing queries
- Cleanup queries (use with caution!)
- Performance monitoring
- Data export examples

**Use this to**: Test database, monitor performance, export data

---

### 📝 types.ts
**TypeScript Type Definitions**

Provides:
- Database type definitions
- Table row types
- Insert/Update types
- Helper types for relationships
- App config interface

**Use this to**: Get type safety in your application code

---

### 🗃️ migrations/20260215000000_initial_schema.sql
**Initial Database Migration**

Creates:
- All 5 database tables
- Indexes for performance
- Row Level Security policies
- Auto-update triggers
- UUID extension

**Use this to**: Set up your database initially (run once)

---

## Setup Steps Summary

### Step 1: Create Supabase Project
- Sign up at https://supabase.com
- Create new project
- Choose name, password, region
- Wait for initialization

### Step 2: Run Migration
- Copy migration SQL from `migrations/20260215000000_initial_schema.sql`
- Paste in Supabase Dashboard → SQL Editor
- Click "Run"

### Step 3: Get API Keys
- Go to Settings → API in Supabase Dashboard
- Copy Project URL
- Copy anon/public key

### Step 4: Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Step 5: Verify
```sql
-- Run in SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

## Common Tasks

### Check Table Count
```sql
SELECT COUNT(*) FROM projects;
```

### View Your Projects
```typescript
const { data } = await supabase
  .from('projects')
  .select('*')
```

### Create a Project
```typescript
const { data } = await supabase
  .from('projects')
  .insert({
    user_id: user.id,
    name: 'My Project'
  })
  .select()
```

## Environment Variables Required

Add to your `.env` file (copied from `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FIGMA_ACCESS_TOKEN=your-figma-token
```

## Troubleshooting Quick Links

### Issue: Tables not created
**Solution**: Re-run migration in SQL Editor

### Issue: RLS blocking queries
**Solution**: Ensure user is authenticated via Supabase Auth

### Issue: Environment variables not loading
**Solution**: Restart dev server, check `VITE_` prefix

### Issue: Cannot connect to Supabase
**Solution**: Verify URL and keys, check project is not paused

For detailed troubleshooting, see **[README.md](./README.md)** section "Troubleshooting"

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## What's Next?

After completing Supabase setup:

1. ✅ Install dependencies (`npm install @supabase/supabase-js`)
2. ✅ Create Supabase client (`src/lib/supabase.ts`)
3. ✅ Implement authentication
4. ✅ Build project management features
5. ✅ Start Phase 2: Figma Integration

See `CLAUDE.md` in the project root for the complete development roadmap.

---

## Document Revision

**Created**: 2026-02-15
**Migration Version**: 20260215000000
**Schema Version**: 1.0
**Compatible With**: Supabase PostgreSQL 15+

## Need Help?

1. Check the **[README.md](./README.md)** for detailed guidance
2. Review **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** to ensure all steps completed
3. Search **[useful_queries.sql](./useful_queries.sql)** for relevant queries
4. Consult **[SCHEMA_DIAGRAM.md](./SCHEMA_DIAGRAM.md)** for schema questions
5. Visit [Supabase Discord](https://discord.supabase.com) for community support

---

**Happy Coding!** 🚀
