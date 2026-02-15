# Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         auth.users                               │
│                    (Supabase Auth)                               │
│  - id (UUID, PK)                                                 │
│  - email                                                         │
│  - ... (managed by Supabase)                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 1:N
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         projects                                 │
│─────────────────────────────────────────────────────────────────│
│  id              UUID (PK)                                       │
│  user_id         UUID (FK → auth.users.id) [NOT NULL]          │
│  name            TEXT [NOT NULL]                                │
│  description     TEXT                                            │
│  created_at      TIMESTAMP                                       │
│  updated_at      TIMESTAMP                                       │
│─────────────────────────────────────────────────────────────────│
│  RLS: Enabled                                                    │
│  Policies: Users can only access their own projects             │
└─────┬──────────────────────────┬──────────────────┬─────────────┘
      │                          │                  │
      │ 1:N                      │ 1:N              │ 1:1
      │                          │                  │
      ▼                          ▼                  ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ figma_designs    │   │  custom_code     │   │  app_configs     │
│──────────────────│   │──────────────────│   │──────────────────│
│ id (UUID, PK)    │   │ id (UUID, PK)    │   │ id (UUID, PK)    │
│ project_id (FK)  │   │ project_id (FK)  │   │ project_id (FK)  │
│ name             │   │ file_path        │   │ config (JSONB)   │
│ figma_file_key   │   │ code (TEXT)      │   │ created_at       │
│ figma_node_id    │   │ language         │   │ updated_at       │
│ thumbnail_url    │   │ created_at       │   │──────────────────│
│ figma_data       │   │ updated_at       │   │ UNIQUE:          │
│ created_at       │   │──────────────────│   │ project_id       │
│ updated_at       │   │ RLS: Enabled     │   │──────────────────│
│──────────────────│   │ Policies: Via    │   │ RLS: Enabled     │
│ RLS: Enabled     │   │ project owner    │   │ Policies: Via    │
│ Policies: Via    │   └──────────────────┘   │ project owner    │
│ project owner    │                           └──────────────────┘
└────┬─────────────┘
     │
     │ 1:N
     │
     ▼
┌──────────────────────────────────────────────────────────────────┐
│                        components                                 │
│──────────────────────────────────────────────────────────────────│
│  id                  UUID (PK)                                    │
│  figma_design_id     UUID (FK → figma_designs.id) [NOT NULL]    │
│  name                TEXT [NOT NULL]                             │
│  code                TEXT [NOT NULL]                             │
│  language            TEXT (default: 'tsx')                       │
│  created_at          TIMESTAMP                                    │
│  updated_at          TIMESTAMP                                    │
│──────────────────────────────────────────────────────────────────│
│  RLS: Enabled                                                     │
│  Policies: Via figma_design → project owner                      │
└──────────────────────────────────────────────────────────────────┘
```

## Relationship Summary

| Parent Table | Child Table | Relationship | Delete Behavior |
|--------------|-------------|--------------|-----------------|
| auth.users | projects | 1:N | CASCADE |
| projects | figma_designs | 1:N | CASCADE |
| projects | custom_code | 1:N | CASCADE |
| projects | app_configs | 1:1 | CASCADE |
| figma_designs | components | 1:N | CASCADE |

## Data Flow

```
User Authentication (Supabase Auth)
    ↓
Creates Projects
    ↓
    ├─→ Imports Figma Designs
    │       ↓
    │   Generates Components
    │
    ├─→ Adds Custom Code
    │
    └─→ Configures App (App Configs)
```

## Table Purposes

### 🎯 **projects**
- Main container for user's work
- Each user can have multiple projects
- Deleted when user is deleted (CASCADE)

### 🎨 **figma_designs**
- Stores imported Figma file information
- Linked to a specific project
- Contains raw Figma API data (JSONB)
- Multiple designs per project

### 🧩 **components**
- Generated React/TSX code from Figma designs
- One component per Figma frame/component
- Stores the actual code as TEXT
- Multiple components per design

### 📝 **custom_code**
- User-added functionality (utils, APIs, etc.)
- File path and code content
- Multiple files per project
- Language field for syntax highlighting

### ⚙️ **app_configs**
- Application-level settings (routes, navigation, theme)
- Stored as JSONB for flexibility
- One config per project (UNIQUE constraint)
- Easy to extend without schema changes

## Security Model (RLS)

```
Row Level Security Hierarchy:

auth.users (Supabase managed)
    │
    └─→ projects (user_id = auth.uid())
            │
            ├─→ figma_designs (via project.user_id)
            │       │
            │       └─→ components (via figma_design.project.user_id)
            │
            ├─→ custom_code (via project.user_id)
            │
            └─→ app_configs (via project.user_id)
```

**Key Points:**
- All tables have RLS enabled
- Only `projects` directly checks `auth.uid()`
- Child tables verify ownership through parent relationships
- Users can only SELECT, INSERT, UPDATE, DELETE their own data

## Indexes

Optimized queries with indexes on foreign keys:

- `idx_projects_user_id` → Fast user project lookups
- `idx_figma_designs_project_id` → Fast design retrieval
- `idx_components_figma_design_id` → Fast component queries
- `idx_custom_code_project_id` → Fast custom code queries
- `idx_app_configs_project_id` → Fast config lookups

## Automatic Features

### Auto-Generated Fields
- `id` → UUID v4 (all tables)
- `created_at` → Current timestamp on INSERT
- `updated_at` → Current timestamp on INSERT/UPDATE

### Triggers
All tables have triggers to automatically update `updated_at` on modification.

### Cascade Deletes
```
Delete User → Deletes Projects
    → Deletes Figma Designs
        → Deletes Components
    → Deletes Custom Code
    → Deletes App Configs
```

## JSON Schema Examples

### figma_data (JSONB)
```json
{
  "document": { /* Figma API response */ },
  "components": { /* Figma components */ },
  "styles": { /* Color/text styles */ }
}
```

### app_configs.config (JSONB)
```json
{
  "routes": [
    { "path": "/", "component": "HomePage", "name": "Home" },
    { "path": "/about", "component": "AboutPage", "name": "About" }
  ],
  "navigation": {
    "items": [
      { "label": "Home", "path": "/", "icon": "home" }
    ]
  },
  "theme": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#10B981"
  }
}
```

## Query Examples

### Get complete project with all data
```sql
SELECT
  p.*,
  json_agg(DISTINCT fd.*) as figma_designs,
  json_agg(DISTINCT c.*) as components,
  json_agg(DISTINCT cc.*) as custom_code,
  ac.config as app_config
FROM projects p
LEFT JOIN figma_designs fd ON fd.project_id = p.id
LEFT JOIN components c ON c.figma_design_id = fd.id
LEFT JOIN custom_code cc ON cc.project_id = p.id
LEFT JOIN app_configs ac ON ac.project_id = p.id
WHERE p.id = 'project-uuid'
GROUP BY p.id, ac.config;
```

---

**Note**: This diagram represents the logical structure. Actual PostgreSQL implementation includes additional system columns and constraints.
