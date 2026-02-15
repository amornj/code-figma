# Code-Figma MCP Server

Model Context Protocol (MCP) server that enables Claude Desktop to interact with code-figma app using natural language.

## What is This?

This MCP server acts as a bridge between Claude Desktop and your code-figma app. Once configured, you can use Claude to:

- Create and manage projects
- Import Figma designs
- Generate React code
- View and modify components
- All using natural language!

## Prerequisites

- Node.js 18+ installed
- Code-figma app running (Web UI + API)
- Claude Desktop installed ([download](https://claude.ai/download))
- code-figma account (sign up via web UI)

## Installation

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Code-Figma API Configuration
API_URL=http://localhost:3000
SUPABASE_URL=https://dhclrzavrjqxsdedvasn.supabase.co
SUPABASE_ANON_KEY=sb_publishable_EMf_ItHLF5xYS49dCnDLTw_I9WmdHpH

# Your Credentials
USER_EMAIL=your_email@example.com
USER_PASSWORD=your_password
```

**Note:** Use the same email/password you created in the web UI.

### 3. Build the Server

```bash
npm run build
```

### 4. Configure Claude Desktop

Edit Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "code-figma": {
      "command": "node",
      "args": ["/absolute/path/to/code-figma/mcp-server/dist/index.js"],
      "env": {
        "API_URL": "http://localhost:3000",
        "SUPABASE_URL": "https://dhclrzavrjqxsdedvasn.supabase.co",
        "SUPABASE_ANON_KEY": "sb_publishable_EMf_ItHLF5xYS49dCnDLTw_I9WmdHpH",
        "USER_EMAIL": "your_email@example.com",
        "USER_PASSWORD": "your_password"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/code-figma` with your actual path!

### 5. Restart Claude Desktop

Close and reopen Claude Desktop to load the new MCP server.

## Usage

### Starting the App

Make sure code-figma is running:

```bash
# In code-figma root directory
npm run dev
```

This starts both:
- Web UI: http://localhost:5173
- API: http://localhost:3000

### Using with Claude Desktop

Open Claude Desktop and try these commands:

#### List Projects

```
You: "List all my projects"

Claude: Here are your projects:
- My Awesome App (ID: abc-123)
- DogFood Website (ID: def-456)
```

#### Create Project

```
You: "Create a new project called 'Landing Page' for a SaaS product"

Claude: ✅ Created project: Landing Page (ID: xyz-789)
```

#### Import Figma Design

```
You: "Import this Figma design into Landing Page: https://www.figma.com/file/..."

Claude: ✅ Imported Figma design: Hero Section (ID: abc-def)
```

#### Generate Code

```
You: "Generate React code from the Hero Section design"

Claude: ✅ Generated 3 components from 3 frames!

Components:
- HeroSection (ID: 123)
- CallToAction (ID: 456)
- Features (ID: 789)
```

#### View Component Code

```
You: "Show me the HeroSection component code"

Claude: Component: HeroSection

```tsx
import React from 'react'

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center p-8 bg-blue-500">
      <div className="text-4xl font-bold">Welcome</div>
    </div>
  )
}
```
```

#### Update Component

```
You: "Change the HeroSection background to green"

Claude: I'll update the component for you.
[Updates the component code with bg-green-500]
✅ Updated component: HeroSection
```

## Available Tools

The MCP server provides these tools to Claude:

| Tool | Description |
|------|-------------|
| `list_projects` | List all your projects |
| `get_project` | Get project details |
| `create_project` | Create new project |
| `import_figma_design` | Import Figma design from URL |
| `list_designs` | List designs in a project |
| `generate_code` | Generate React code from design |
| `get_design_components` | Get all components for a design |
| `get_component` | Get specific component code |
| `update_component` | Update component code or name |

Claude automatically chooses which tools to use based on your request!

## Example Workflows

### Complete Project Setup

```
You: "Let's create a landing page project.
      Import this Figma design: https://figma.com/file/...
      Then generate all the code"

Claude:
1. ✅ Created project: Landing Page
2. ✅ Imported design: Homepage
3. ✅ Generated 5 components
   - Header
   - Hero
   - Features
   - Pricing
   - Footer

All set! You can view the code in the web UI or ask me to show specific components.
```

### Iterative Development

```
You: "Show me the Header component"
Claude: [Shows code]

You: "Make the header sticky at the top"
Claude: ✅ Updated with sticky positioning

You: "Add a transparent background with blur effect"
Claude: ✅ Updated with backdrop-blur

You: "Perfect! Now show me the Hero component"
Claude: [Shows Hero code]
```

## Troubleshooting

### MCP Server Not Connecting

1. Check Claude Desktop config path is correct
2. Verify absolute path to `dist/index.js`
3. Restart Claude Desktop
4. Check logs in Claude Desktop (Help → Show Logs)

### Authentication Errors

1. Verify credentials in `.env` match web UI account
2. Make sure you can sign in via web UI
3. Check Supabase URL and anon key are correct

### API Connection Failed

1. Ensure code-figma app is running (`npm run dev`)
2. Check API is accessible at http://localhost:3000/api/health
3. Verify `API_URL` in config

### Tools Not Showing Up

1. Rebuild the server: `npm run build`
2. Restart Claude Desktop
3. Check for errors in Claude logs

## Development

### Run in Dev Mode

```bash
npm run dev
```

### Watch Mode (auto-rebuild)

```bash
npm run watch
```

### Test Tools Manually

You can test the API client without MCP:

```typescript
import { CodeFigmaClient } from './src/api-client.js'
import { getAuthToken } from './src/auth.js'

const token = await getAuthToken(...)
const client = new CodeFigmaClient('http://localhost:3000')
client.setToken(token)

const projects = await client.listProjects()
console.log(projects)
```

## Benefits

### vs. Web UI Chatbox (OpenAI/Anthropic API)

| Feature | MCP Server | Web Chatbox |
|---------|------------|-------------|
| **Cost** | ✅ Free (uses Claude Max) | ❌ Pay per request |
| **Model** | ✅ Latest Claude (4.5, 4.6) | ❌ Depends on API tier |
| **Context** | ✅ Full conversation history | ⚠️ Limited window |
| **Tools** | ✅ All MCP tools | ⚠️ Limited to web UI |
| **Workflow** | ✅ Terminal + Web UI | ❌ Web only |

### vs. Web UI Only

| Action | Web UI | Claude + MCP |
|--------|--------|--------------|
| Create project | 5 clicks | "Create a project" |
| Import design | Paste URL, click | "Import this design: [URL]" |
| Generate code | Click button | "Generate code" |
| View component | Click, scroll | "Show me Header component" |
| Edit component | Manual editing | "Make it blue and bigger" |
| Bulk operations | One by one | "Do this for all components" |

## Architecture

```
Claude Desktop
     ↓
MCP Server (this package)
     ↓
REST API (code-figma/api)
     ↓
Supabase (database)
```

All changes made via Claude are:
- Saved to database
- Visible in web UI
- Accessible via API
- Consistent across all interfaces

## Next Steps

After setup:

1. ✅ Test with "list my projects"
2. ✅ Import a Figma design
3. ✅ Generate code
4. ✅ Modify a component with natural language
5. ✅ View changes in web UI

Enjoy the power of AI-driven development! 🚀
