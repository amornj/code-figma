# Code-Figma: Figma Design to Code Webapp

## Project Vision
A web application that bridges the gap between Figma designs and functional code. Users can import Figma designs, view them alongside their generated code, edit designs via a chatbox interface, combine multiple designs into complete applications, and add custom functionality. Eventually will be packaged as a mobile app using Capacitor.

## Tech Stack

### Core
- **Frontend**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (for high-quality component library)
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand or React Context (choose based on complexity)
- **Code Editor**: Monaco Editor (VS Code's editor)
- **Future**: Capacitor (for iOS/Android apps)

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `react-router-dom` - Routing
- `monaco-editor` - Code editor
- `@tanstack/react-query` - Server state management
- `react-hot-toast` - Notifications
- `lucide-react` - Icons
- `axios` - HTTP client for Figma API

## Core Features

### 1. Figma Design Import
- Users paste Figma file URL or file key
- Fetch design data via Figma REST API
- Extract frames/components
- Store design metadata and preview images in Supabase
- Generate initial code from Figma design data

### 2. Code Generation
- Parse Figma design tree (nodes, styles, layouts)
- Generate React + Tailwind components
- Support for:
  - Layout (Flexbox/Grid from Auto Layout)
  - Typography (text styles)
  - Colors (fill colors)
  - Spacing (padding, margins)
  - Responsive design hints

### 3. Dual View Interface
- Split-pane view (like Figma's dev mode)
- Left: Design preview (rendered component or Figma embed)
- Right: Code editor (Monaco)
- Toggle between design-only, code-only, or split view
- Real-time code updates reflected in preview

### 4. AI-Powered Design Editing
- Chatbox interface for editing designs
- Natural language commands like:
  - "Change the button color to blue"
  - "Make the heading larger"
  - "Add padding to the card"
- AI interprets intent and modifies code
- Updates reflected in both code and preview

### 5. Project Composition
- Combine multiple Figma designs into one project
- Each design = a component
- Build app structure by composing components
- Add navigation between screens
- Implement app logic (forms, API calls, state management)

### 6. Custom Functionality
- Add custom JavaScript/TypeScript code
- Integrate with external APIs
- Store data in Supabase database
- Add form validation, business logic, etc.

### 7. Data Persistence
- All projects stored in Supabase
- Each project contains:
  - Metadata (name, description, created_at)
  - Figma designs (file URLs, frame IDs)
  - Generated code for each component
  - Custom code additions
  - App configuration

## Database Schema (Supabase)

### Tables

```sql
-- Users (handled by Supabase Auth)

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Figma Designs (imported designs)
CREATE TABLE figma_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  figma_file_key TEXT NOT NULL,
  figma_node_id TEXT, -- Specific frame/component
  thumbnail_url TEXT,
  figma_data JSONB, -- Raw Figma API response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Components (generated code from designs)
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  figma_design_id UUID REFERENCES figma_designs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL, -- The actual component code
  language TEXT DEFAULT 'tsx',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Code (user-added functionality)
CREATE TABLE custom_code (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- e.g., "utils/api.ts"
  code TEXT NOT NULL,
  language TEXT DEFAULT 'typescript',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Configuration
CREATE TABLE app_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  config JSONB NOT NULL, -- Routes, navigation, API endpoints, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configs ENABLE ROW LEVEL SECURITY;

-- Policies (users can only access their own data)
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables (via project_id join)
```

## Application Architecture

### Directory Structure
```
code-figma/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   ├── editor/          # Code editor components
│   │   ├── viewer/          # Design viewer components
│   │   ├── chat/            # AI chatbox interface
│   │   └── layout/          # Layout components
│   ├── pages/
│   │   ├── Auth.tsx         # Login/signup
│   │   ├── Dashboard.tsx    # Project list
│   │   ├── Project.tsx      # Main project workspace
│   │   └── Settings.tsx     # User settings
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── figma.ts         # Figma API client
│   │   ├── codegen.ts       # Figma to code generation
│   │   └── ai.ts            # AI chat integration
│   ├── hooks/
│   │   ├── useProject.ts
│   │   ├── useFigmaDesigns.ts
│   │   └── useAuth.ts
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── store/               # State management
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env.example
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── CLAUDE.md
```

## Development Phases

### Phase 1: Foundation (MVP)
- [ ] Set up Vite + React + TypeScript + Tailwind
- [ ] Install and configure Supabase client
- [ ] Set up Supabase database tables and RLS policies
- [ ] Implement authentication (login, signup, logout)
- [ ] Create basic routing structure
- [ ] Build dashboard for project management (CRUD)

### Phase 2: Figma Integration
- [ ] Create Figma API client module
- [ ] Implement Figma file URL parsing
- [ ] Fetch and display Figma design metadata
- [ ] Store Figma design data in Supabase
- [ ] Display design thumbnails/previews

### Phase 3: Code Generation
- [ ] Build Figma AST parser
- [ ] Implement code generator (Figma nodes → React + Tailwind)
- [ ] Handle layouts (Auto Layout → Flexbox/Grid)
- [ ] Handle typography and colors
- [ ] Generate component files
- [ ] Store generated code in Supabase

### Phase 4: Editor & Viewer
- [ ] Integrate Monaco Editor
- [ ] Build design viewer (iframe or render component)
- [ ] Implement split-pane layout with toggle
- [ ] Real-time code preview updates
- [ ] Syntax highlighting and code formatting

### Phase 5: AI Chatbox
- [ ] Design chatbox UI
- [ ] Integrate AI API (Claude, GPT-4, or local model)
- [ ] Build prompt engineering for design editing
- [ ] Implement code modification based on chat commands
- [ ] Update preview on changes

### Phase 6: Project Composition
- [ ] Multi-component project structure
- [ ] Component composition UI
- [ ] Navigation/routing between screens
- [ ] Add custom code files
- [ ] Integrate custom functionality (API calls, state, etc.)

### Phase 7: Polish & Optimization
- [ ] Error handling and validation
- [ ] Loading states and skeletons
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Testing (unit, integration)

### Phase 8: Capacitor Integration
- [ ] Install Capacitor
- [ ] Configure iOS and Android projects
- [ ] Test on mobile devices
- [ ] Add mobile-specific features (if needed)
- [ ] Build and deploy to app stores

## Figma API Setup

### Getting a Personal Access Token (FREE)
1. Go to Figma → Settings → Account
2. Scroll to "Personal access tokens"
3. Click "Generate new token"
4. Name it (e.g., "code-figma-app")
5. Copy the token (only shown once!)
6. Add to `.env` file:
   ```
   VITE_FIGMA_ACCESS_TOKEN=your_token_here
   ```

### Figma API Endpoints
- **Get file**: `GET https://api.figma.com/v1/files/:file_key`
- **Get images**: `GET https://api.figma.com/v1/images/:file_key`
- **Get components**: `GET https://api.figma.com/v1/files/:file_key/components`

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Figma
VITE_FIGMA_ACCESS_TOKEN=your_figma_token

# AI (Optional, for chatbox feature)
VITE_OPENAI_API_KEY=your_openai_key
# or
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

## Key Architectural Decisions

### 1. Why React + Vite?
- Developer is experienced with this stack
- Fast dev server and HMR
- Simple, lightweight
- Works perfectly with Capacitor

### 2. Why Supabase?
- Built-in auth
- PostgreSQL database with real-time capabilities
- Row-level security
- Easy file storage (for thumbnails, assets)
- Generous free tier

### 3. Code Generation Strategy
- Parse Figma's JSON structure
- Map Figma properties to Tailwind classes
- Generate semantic, readable React code
- Allow manual editing after generation

### 4. AI Integration
- Use Claude or GPT-4 for design editing
- Prompt: "You are a code editor. Modify the following React component based on this request: [user request]. Return only the updated code."
- Parse AI response and update code

### 5. Preview Strategy
- Option A: Render component in iframe (isolated)
- Option B: Dynamic import and render (faster but less isolated)
- Start with iframe for safety

## Future Enhancements
- Collaborative editing (multiple users)
- Version control for designs/code
- Export to GitHub repo
- Component library management
- Design system creation
- Plugin marketplace
- Figma plugin for two-way sync

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account (free tier)
- Figma account (free tier)

### Initial Setup
1. Clone repo and install dependencies
2. Create Supabase project
3. Run database migrations (SQL schema)
4. Get Figma access token
5. Configure `.env` file
6. Run `npm run dev`

### Development Workflow
1. Start with Phase 1 (foundation)
2. Build incrementally
3. Test each feature before moving to next phase
4. Keep code clean and documented
5. Commit frequently to GitHub

## Notes for Claude (AI Assistant)
- User prefers React + Vite (experienced with this stack)
- Focus on clean, maintainable code
- Use TypeScript for type safety
- Follow React best practices
- Keep components small and reusable
- Write self-documenting code with clear naming
- Add comments only where logic is complex
- Prioritize MVP features first
- Test features before marking phase complete
- Eventually this will be a Capacitor app, so avoid web-only APIs where possible
