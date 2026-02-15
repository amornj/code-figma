# Code-Figma

A web application that bridges Figma designs and functional code. Import designs, edit them via AI, combine components, and build complete applications.

## Features

- 🎨 Import Figma designs
- 💻 Auto-generate React + Tailwind code
- 🤖 AI-powered design editing via chatbox
- 🔄 Toggle between design and code view
- 🧩 Compose multiple designs into apps
- 🔐 Supabase authentication and data storage
- 📱 Future: Capacitor mobile app

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **State**: React Query + Zustand
- **Code Editor**: Monaco Editor (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Figma personal access token

### Setup

1. Clone the repository
```bash
git clone https://github.com/amornj/code-figma.git
cd code-figma
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase (see `supabase/README.md`)

4. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

5. Run the development server
```bash
npm run dev
```

## Project Structure

See `CLAUDE.md` for detailed architecture and development roadmap.

## Development Phases

- [x] Phase 1: Foundation (React + Vite + Supabase + Auth)
- [ ] Phase 2: Figma Integration
- [ ] Phase 3: Code Generation
- [ ] Phase 4: Editor & Viewer
- [ ] Phase 5: AI Chatbox
- [ ] Phase 6: Project Composition
- [ ] Phase 7: Polish & Optimization
- [ ] Phase 8: Capacitor Integration

## License

MIT
