# Supabase Setup Checklist

Use this checklist to ensure you've completed all the necessary steps for setting up Supabase.

## Pre-Setup

- [ ] Node.js 18+ installed
- [ ] npm or pnpm installed
- [ ] Code editor ready (VS Code recommended)

## Supabase Account & Project

- [ ] Created Supabase account at https://supabase.com
- [ ] Created new project in Supabase
  - [ ] Project name: `code-figma` (or your chosen name)
  - [ ] Database password saved securely
  - [ ] Region selected (closest to you/users)
  - [ ] Waited for project initialization to complete

## Database Setup

- [ ] Opened Supabase Dashboard > SQL Editor
- [ ] Copied migration file: `supabase/migrations/20260215000000_initial_schema.sql`
- [ ] Pasted and ran migration in SQL Editor
- [ ] Verified success (no errors)
- [ ] Checked Table Editor - all 5 tables visible:
  - [ ] `projects`
  - [ ] `figma_designs`
  - [ ] `components`
  - [ ] `custom_code`
  - [ ] `app_configs`

## API Configuration

- [ ] Navigated to Settings > API in Supabase Dashboard
- [ ] Copied Project URL
- [ ] Copied anon/public API key

## Environment Variables

- [ ] Copied `.env.example` to `.env`:
  ```bash
  cp .env.example .env
  ```
- [ ] Added Supabase URL to `.env`
- [ ] Added Supabase anon key to `.env`
- [ ] Verified `.env` is in `.gitignore` (should be by default)

## Figma Setup (Required for Phase 2)

- [ ] Created Figma account
- [ ] Generated Personal Access Token in Figma Settings
- [ ] Added token to `.env` file as `VITE_FIGMA_ACCESS_TOKEN`

## Optional: AI Configuration (For Phase 5)

Choose ONE:

- [ ] OpenAI API key obtained and added to `.env`
- [ ] Anthropic API key obtained and added to `.env`
- [ ] Skipped for now (can add later)

## Verification

- [ ] Ran verification query in SQL Editor:
  ```sql
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public';
  ```
- [ ] All 5 tables listed in results
- [ ] Checked RLS is enabled:
  ```sql
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public';
  ```
- [ ] All tables show `rowsecurity = true`

## Application Integration (After you build the app)

- [ ] Created Supabase client in `src/lib/supabase.ts`
- [ ] Tested connection in browser console
- [ ] Implemented authentication (sign up/sign in)
- [ ] Tested CRUD operations on projects table
- [ ] Verified RLS is working (users can only see own data)

## Documentation Review

- [ ] Read `supabase/README.md` (full guide)
- [ ] Reviewed `supabase/QUICKSTART.md` (quick reference)
- [ ] Bookmarked `supabase/useful_queries.sql` (for later)
- [ ] Checked `supabase/types.ts` (TypeScript types)

## Next Steps

After completing this checklist:

1. [ ] Start development server: `npm run dev`
2. [ ] Begin Phase 1 of development (see `CLAUDE.md`)
3. [ ] Implement authentication flow
4. [ ] Build dashboard for project management
5. [ ] Start Figma integration (Phase 2)

---

## Troubleshooting Checklist

If something isn't working:

- [ ] Restarted dev server after changing `.env`
- [ ] Checked browser console for errors
- [ ] Verified all environment variables have `VITE_` prefix
- [ ] Confirmed `.env` file is in project root
- [ ] Checked Supabase project is not paused (free tier auto-pauses after inactivity)
- [ ] Reviewed RLS policies are correct
- [ ] Tested connection to Supabase from browser dev tools

---

## Resources Checklist

Keep these handy:

- [ ] Bookmarked [Supabase Docs](https://supabase.com/docs)
- [ ] Bookmarked [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [ ] Joined [Supabase Discord](https://discord.supabase.com) (optional)
- [ ] Saved Supabase Dashboard URL for quick access

---

**Last Updated**: 2026-02-15

**Status**: ☐ Not Started | ☐ In Progress | ☐ Complete
