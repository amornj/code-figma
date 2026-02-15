# Code-Figma: Figma Design to Code Webapp

## Project Vision
A powerful platform that bridges the gap between Figma designs and functional code. Users can import Figma designs, view them alongside their generated code, edit designs through multiple interfaces (Web UI, Terminal CLI, or Claude Desktop with MCP), combine multiple designs into complete applications, and add custom functionality.

### Multiple Interfaces, Single Codebase
The app provides three ways to interact with your projects:
1. **Web UI** - Visual interface for viewing, browsing, and managing projects
2. **Terminal/CLI** - Command-line tools for scriptable workflows (future)
3. **Claude Desktop + MCP** - AI-powered natural language editing using your existing Claude Max subscription

All interfaces talk to the same REST API and database, ensuring consistency and flexibility.

### Cost-Effective AI Integration
Instead of paying for additional AI API access (OpenAI, Anthropic), the app integrates with Claude Desktop via Model Context Protocol (MCP). Users leverage their existing Claude Max subscription for unlimited AI-powered editing, saving significant monthly costs while maintaining powerful AI capabilities.

Eventually will be packaged as a mobile app using Capacitor.

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

### 4. AI-Powered Design Editing (via Claude Desktop + MCP)
- Natural language editing through Claude Desktop terminal
- No additional AI API costs - uses existing Claude Max subscription
- Commands like:
  - "Change the button color to blue"
  - "Make the heading larger"
  - "Add padding to the card"
  - "Generate a product card from frame 3"
  - "Create a login form like the signup form"
- Claude interprets intent and modifies code via MCP server
- Updates reflected in database and visible in web UI
- Full conversation context and project awareness

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

### Phase 1: Foundation ✅ COMPLETE
- [x] Set up Vite + React + TypeScript + Tailwind
- [x] Install and configure Supabase client
- [x] Set up Supabase database tables and RLS policies
- [x] Implement authentication (login, signup, logout)
- [x] Create basic routing structure
- [x] Build dashboard for project management (CRUD)

### Phase 2: Figma Integration ✅ COMPLETE
- [x] Create Figma API client module
- [x] Implement Figma file URL parsing
- [x] Fetch and display Figma design metadata
- [x] Store Figma design data in Supabase
- [x] Display design thumbnails/previews
- [x] Delete imported designs
- [x] Link to Figma files

### Phase 3: REST API Layer 🔄 IN PROGRESS
**Purpose:** Expose app functionality via REST API for multiple interfaces (Web UI, CLI, MCP)

**API Endpoints to Build:**
- [ ] Projects API (CRUD operations)
- [ ] Figma Designs API (import, list, delete)
- [ ] Components API (CRUD for generated code)
- [ ] Custom Code API (CRUD for user files)
- [ ] Code Generation API (trigger generation, get status)

**Technical Details:**
- [ ] Set up API routes (using Vite backend or separate Express server)
- [ ] Authentication middleware (Supabase JWT validation)
- [ ] Rate limiting and security
- [ ] API documentation (OpenAPI/Swagger)
- [ ] CORS configuration for web UI
- [ ] Error handling and validation

### Phase 4: Code Generation Engine
- [ ] Build Figma AST parser
- [ ] Implement code generator (Figma nodes → React + Tailwind)
- [ ] Handle layouts (Auto Layout → Flexbox/Grid)
- [ ] Handle typography and colors
- [ ] Generate component files
- [ ] Store generated code in Supabase
- [ ] API endpoint for triggering generation
- [ ] Background job processing for large designs

### Phase 5: MCP Server (Claude Desktop Integration)
**Purpose:** Enable AI-powered editing via Claude Desktop using Model Context Protocol

**MCP Server Features:**
- [ ] Create `code-figma-mcp` package
- [ ] Implement MCP tools:
  - [ ] `list_projects` - List all user projects
  - [ ] `get_project` - Get project details
  - [ ] `import_figma_design` - Import design from URL
  - [ ] `list_designs` - List designs in project
  - [ ] `generate_code` - Generate code from design
  - [ ] `get_component` - Get generated component code
  - [ ] `update_component` - Modify component code
  - [ ] `create_custom_code` - Add custom code file
- [ ] Authentication with Supabase
- [ ] Connect to REST API
- [ ] Configuration for Claude Desktop
- [ ] Documentation and setup guide

**Claude Desktop Setup:**
- [ ] Add MCP server to Claude Desktop config
- [ ] Test tools in Claude Desktop terminal
- [ ] Create example prompts/workflows
- [ ] User guide for natural language editing

### Phase 6: Editor & Viewer (Web UI Enhancement)
- [ ] Integrate Monaco Editor for code viewing/editing
- [ ] Build design viewer (iframe or render component)
- [ ] Implement split-pane layout with toggle
- [ ] Real-time code preview updates
- [ ] Syntax highlighting and code formatting
- [ ] Component diff view (Figma vs generated)

### Phase 7: Project Composition
- [ ] Multi-component project structure
- [ ] Component composition UI
- [ ] Navigation/routing between screens
- [ ] Add custom code files via web UI
- [ ] Integrate custom functionality (API calls, state, etc.)
- [ ] Project export (download as ZIP)

### Phase 8: Polish & Optimization
- [ ] Error handling and validation
- [ ] Loading states and skeletons
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Testing (unit, integration)
- [ ] Analytics and monitoring

### Phase 9: CLI Tool (Optional)
- [ ] Build command-line interface
- [ ] Commands: `code-figma import <url>`, `code-figma generate`, etc.
- [ ] Uses same REST API as MCP and web UI
- [ ] Scriptable workflows

### Phase 10: Capacitor Integration
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

# No AI API keys needed!
# We use Claude Desktop + MCP instead, which uses your existing
# Claude Max subscription - no additional costs!
```

## Architecture: API-First, Multiple Interfaces

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User Interfaces                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🌐 Web UI          💻 Terminal/CLI    🤖 Claude    │
│  (Browser)          (Future)            Desktop      │
│                                         (MCP)        │
│                                                      │
└────────────┬────────────────┬───────────────────────┘
             │                │
             │                │
             ▼                ▼
┌─────────────────────────────────────────────────────┐
│                   REST API Layer                     │
│          (Express or Vite API Routes)                │
├─────────────────────────────────────────────────────┤
│  • Authentication (Supabase JWT)                     │
│  • Projects CRUD                                     │
│  • Figma Designs CRUD                                │
│  • Components CRUD                                   │
│  • Code Generation                                   │
│  • Custom Code Management                            │
└────────────┬───────────────┬────────────────────────┘
             │               │
             ▼               ▼
    ┌────────────────┐  ┌──────────────┐
    │   Supabase     │  │  Figma API   │
    │   (Database    │  │  (Designs)   │
    │   + Auth)      │  │              │
    └────────────────┘  └──────────────┘
```

### Interface Comparison

| Feature | Web UI | Terminal/CLI | Claude Desktop |
|---------|--------|--------------|----------------|
| **View Projects** | ✅ Visual cards | ✅ List view | ✅ Ask Claude |
| **Import Figma** | ✅ Form input | ✅ Command | ✅ "Import X" |
| **View Code** | ✅ Monaco editor | ✅ Cat/less | ✅ Show me code |
| **Edit Code** | ✅ Monaco editor | ✅ Vim/nano | ✅ Natural language |
| **Generate Code** | ✅ Button click | ✅ Command | ✅ "Generate..." |
| **Speed** | Medium | Fast | Fastest |
| **Visual Feedback** | ✅ Best | ❌ None | ⚠️ Via web UI |
| **Bulk Operations** | ❌ Manual | ✅ Scripts | ✅ One command |
| **AI Editing** | ❌ (would need API) | ❌ | ✅ Built-in |
| **Learning Curve** | Low | Medium | Low |

### Single Codebase Benefits

**One database, one API, multiple interfaces:**
- Changes in Claude Desktop → visible in Web UI
- Import in Web UI → accessible via CLI
- Generate in Terminal → stored in database
- No data sync issues
- Consistent business logic
- Easy to maintain

### MCP Integration Benefits

**Why MCP instead of traditional chatbox:**
1. **No AI API costs** - Use existing Claude Max subscription
2. **Better context** - Claude Desktop maintains full conversation history
3. **More powerful** - Access to latest Claude models (4.5, 4.6)
4. **Tool ecosystem** - Can combine with other MCP tools
5. **Terminal workflow** - Familiar for developers
6. **Scriptable** - Can automate with Alfred, Raycast, etc.

### Example Workflows

**Scenario: Import and generate code**

**Web UI:**
1. Click "Import Figma Design"
2. Paste URL
3. Click "Import"
4. Wait for thumbnail
5. Click design card
6. Click "Generate Code"
7. View in editor

**Claude Desktop:**
```
You: "Import DogFoodSheltie design and generate code"
Claude: ✅ Done! Generated 3 components.
```

**Both end up in the same database!**

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
