# Code-Figma REST API

Backend API for code-figma application. Provides endpoints for managing projects, Figma designs, and generated components.

## Running the API

```bash
# Development (with hot reload)
npm run dev:api

# Or run both frontend and API
npm run dev
```

## Base URL

- Development: `http://localhost:3000`

## Authentication

All API endpoints (except `/api/health`) require authentication via Supabase JWT token.

**Headers:**
```
Authorization: Bearer <supabase_jwt_token>
```

To get a token:
1. Sign in via web UI
2. Get session token from Supabase client
3. Use in API requests

## Endpoints

### Health Check

**GET** `/api/health`

Check if API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T14:39:09.784Z"
}
```

---

### Projects

#### List Projects

**GET** `/api/projects`

Get all projects for authenticated user.

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "My Project",
      "description": "Project description",
      "created_at": "2026-02-15T...",
      "updated_at": "2026-02-15T..."
    }
  ]
}
```

#### Get Project

**GET** `/api/projects/:id`

Get single project by ID.

**Response:**
```json
{
  "project": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "My Project",
    "description": "Project description",
    "created_at": "2026-02-15T...",
    "updated_at": "2026-02-15T..."
  }
}
```

#### Create Project

**POST** `/api/projects`

Create a new project.

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Optional description"
}
```

**Response:** `201 Created`
```json
{
  "project": { ... }
}
```

#### Update Project

**PUT** `/api/projects/:id`

Update project details.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "project": { ... }
}
```

#### Delete Project

**DELETE** `/api/projects/:id`

Delete a project and all associated data.

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

#### Get Project Designs

**GET** `/api/projects/:id/designs`

Get all Figma designs for a project.

**Response:**
```json
{
  "designs": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "name": "DogFoodSheltie",
      "figma_file_key": "abc123",
      "figma_node_id": "1:2",
      "thumbnail_url": "https://...",
      "figma_data": { ... },
      "created_at": "2026-02-15T...",
      "updated_at": "2026-02-15T..."
    }
  ]
}
```

---

### Figma Designs

#### Import Figma Design

**POST** `/api/designs/import`

Import a Figma design from URL.

**Request Body:**
```json
{
  "projectId": "uuid",
  "figmaUrl": "https://www.figma.com/file/abc123/My-Design"
}
```

**Response:** `201 Created`
```json
{
  "design": { ... }
}
```

#### Get Design

**GET** `/api/designs/:id`

Get design details.

**Response:**
```json
{
  "design": { ... }
}
```

#### Delete Design

**DELETE** `/api/designs/:id`

Delete a Figma design.

**Response:**
```json
{
  "message": "Design deleted successfully"
}
```

#### Generate Code

**POST** `/api/designs/:id/generate`

Trigger code generation from design.

**Response:**
```json
{
  "message": "Code generation not yet implemented",
  "designId": "uuid",
  "status": "pending"
}
```

_Note: Full implementation in Phase 4_

---

### Components

#### Get Component

**GET** `/api/components/:id`

Get generated component code.

**Response:**
```json
{
  "component": {
    "id": "uuid",
    "figma_design_id": "uuid",
    "name": "Button",
    "code": "import React from 'react'...",
    "language": "tsx",
    "created_at": "2026-02-15T...",
    "updated_at": "2026-02-15T..."
  }
}
```

#### Update Component

**PUT** `/api/components/:id`

Update component code.

**Request Body:**
```json
{
  "name": "Updated Name",
  "code": "import React from 'react'..."
}
```

**Response:**
```json
{
  "component": { ... }
}
```

#### Delete Component

**DELETE** `/api/components/:id`

Delete a component.

**Response:**
```json
{
  "message": "Component deleted successfully"
}
```

---

## Error Responses

All endpoints may return error responses:

**401 Unauthorized:**
```json
{
  "error": "Missing or invalid authorization header"
}
```

**404 Not Found:**
```json
{
  "error": "Project not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Error message",
  "stack": "..." // Only in development
}
```

---

## Usage with MCP

These endpoints are designed to be called by the MCP server (Claude Desktop integration).

Example MCP tool implementation:
```typescript
{
  name: "import_figma_design",
  description: "Import a Figma design into a project",
  parameters: {
    projectId: "string",
    figmaUrl: "string"
  },
  handler: async (params) => {
    const response = await fetch('http://localhost:3000/api/designs/import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    return await response.json()
  }
}
```

---

## Development

**File Structure:**
```
api/
├── server.ts           # Express app
├── routes/
│   ├── projects.ts    # Project endpoints
│   ├── designs.ts     # Figma design endpoints
│   └── components.ts  # Component endpoints
├── middleware/
│   ├── auth.ts        # JWT authentication
│   └── errorHandler.ts
├── utils/
│   └── supabase.ts    # Supabase client
└── tsconfig.json
```

**Adding New Endpoints:**
1. Create route file in `api/routes/`
2. Import and use in `api/server.ts`
3. Add authentication middleware if needed
4. Document in this README
