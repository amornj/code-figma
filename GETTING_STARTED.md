# Getting Started with Code-Figma

## Quick Setup (5 minutes)

### 1. Install Dependencies ✅
```bash
npm install  # Already done!
```

### 2. Set Up Supabase

#### Option A: Use the Backend Engineer's Setup (Recommended)
The backend agent has created comprehensive setup files in the `supabase/` directory:

1. **Read the guide**: `supabase/README.md` - Full setup instructions
2. **Quick start**: `supabase/QUICKSTART.md` - Fast setup guide
3. **Checklist**: `supabase/SETUP_CHECKLIST.md` - Track your progress

#### Option B: Manual Quick Setup
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project (choose a region close to you)
3. Go to SQL Editor and run the migration file: `supabase/migrations/20260215000000_initial_schema.sql`
4. Go to Settings > API and copy:
   - Project URL
   - anon/public key

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` and you should see the login page!

## What's Built So Far

✅ **Phase 1 Complete**: Foundation
- React + Vite + TypeScript setup
- Tailwind CSS configured
- Supabase client integrated
- Authentication pages (login/signup)
- Dashboard for project management
- Routing structure

## Next Steps

### Immediate (Phase 2)
1. Get a Figma personal access token (free!)
   - Go to Figma > Settings > Personal access tokens
   - Generate new token
   - Add to `.env` as `VITE_FIGMA_ACCESS_TOKEN`

2. Test the app:
   - Sign up for an account
   - Create a project
   - Verify everything works

### Coming Soon
- **Phase 2**: Figma design import
- **Phase 3**: Code generation from Figma
- **Phase 4**: Split-pane editor with design/code view
- **Phase 5**: AI chatbox for editing designs
- **Phase 6**: Combine multiple designs into apps

## Project Structure
```
code-figma/
├── src/
│   ├── pages/          # Auth, Dashboard, Project, Settings
│   ├── lib/            # Supabase client
│   ├── hooks/          # useAuth hook
│   ├── types/          # TypeScript types
│   └── components/     # (Coming soon)
├── supabase/           # Database setup & docs
├── public/
├── CLAUDE.md           # Full project documentation
└── package.json
```

## Troubleshooting

### App won't start
- Make sure `.env` file exists in project root
- Verify environment variables have `VITE_` prefix
- Restart dev server after changing `.env`

### Can't log in
- Check Supabase project is active (not paused)
- Verify environment variables are correct
- Check browser console for errors
- Confirm email confirmation is enabled in Supabase Auth settings

### Database errors
- Verify migration ran successfully in Supabase SQL Editor
- Check RLS policies are enabled
- Review `supabase/useful_queries.sql` for debugging queries

## Resources

- [CLAUDE.md](./CLAUDE.md) - Full project architecture
- [supabase/README.md](./supabase/README.md) - Supabase setup guide
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)

## Development Workflow

1. **Create a feature branch** (optional but recommended)
2. **Build incrementally** - One phase at a time
3. **Test frequently** - Run the app and test each feature
4. **Commit often** - Save your progress
5. **Ask for help** - Use the AI assistant for guidance

Ready to build something amazing! 🚀
