#!/usr/bin/env node

/**
 * Code-Figma MCP Server
 *
 * Enables Claude Desktop to interact with code-figma app via natural language.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import dotenv from 'dotenv'
import { CodeFigmaClient } from './api-client.js'
import { getAuthToken } from './auth.js'

dotenv.config()

const API_URL = process.env.API_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!
const USER_EMAIL = process.env.USER_EMAIL!
const USER_PASSWORD = process.env.USER_PASSWORD!

// Initialize API client
const client = new CodeFigmaClient(API_URL)

// Initialize MCP server
const server = new Server(
  {
    name: 'code-figma-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// Authenticate on startup
async function authenticate() {
  try {
    const token = await getAuthToken(SUPABASE_URL, SUPABASE_ANON_KEY, USER_EMAIL, USER_PASSWORD)
    client.setToken(token)
    console.error('✅ Authenticated with code-figma API')
  } catch (error: any) {
    console.error('❌ Authentication failed:', error.message)
    process.exit(1)
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_projects',
        description: 'List all projects for the authenticated user',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_project',
        description: 'Get details of a specific project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'The project ID',
            },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'create_project',
        description: 'Create a new project',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Project name',
            },
            description: {
              type: 'string',
              description: 'Project description (optional)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'import_figma_design',
        description: 'Import a Figma design from URL into a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'The project ID to import into',
            },
            figmaUrl: {
              type: 'string',
              description: 'The Figma file URL (e.g., https://www.figma.com/file/...)',
            },
          },
          required: ['projectId', 'figmaUrl'],
        },
      },
      {
        name: 'list_designs',
        description: 'List all Figma designs in a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'The project ID',
            },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'generate_code',
        description: 'Generate React + Tailwind code from a Figma design',
        inputSchema: {
          type: 'object',
          properties: {
            designId: {
              type: 'string',
              description: 'The Figma design ID',
            },
          },
          required: ['designId'],
        },
      },
      {
        name: 'get_design_components',
        description: 'Get all generated components for a Figma design',
        inputSchema: {
          type: 'object',
          properties: {
            designId: {
              type: 'string',
              description: 'The Figma design ID',
            },
          },
          required: ['designId'],
        },
      },
      {
        name: 'get_component',
        description: 'Get a specific component code',
        inputSchema: {
          type: 'object',
          properties: {
            componentId: {
              type: 'string',
              description: 'The component ID',
            },
          },
          required: ['componentId'],
        },
      },
      {
        name: 'update_component',
        description: 'Update component code or name',
        inputSchema: {
          type: 'object',
          properties: {
            componentId: {
              type: 'string',
              description: 'The component ID',
            },
            code: {
              type: 'string',
              description: 'Updated component code (optional)',
            },
            name: {
              type: 'string',
              description: 'Updated component name (optional)',
            },
          },
          required: ['componentId'],
        },
      },
    ],
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params

    if (!args) {
      throw new Error('Arguments are required')
    }

    switch (name) {
      case 'list_projects': {
        const projects = await client.listProjects()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(projects, null, 2),
            },
          ],
        }
      }

      case 'get_project': {
        const project = await client.getProject(args.projectId as string)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(project, null, 2),
            },
          ],
        }
      }

      case 'create_project': {
        const project = await client.createProject(
          args.name as string,
          args.description as string | undefined
        )
        return {
          content: [
            {
              type: 'text',
              text: `✅ Created project: ${project.name} (ID: ${project.id})`,
            },
          ],
        }
      }

      case 'import_figma_design': {
        const design = await client.importFigmaDesign(
          args.projectId as string,
          args.figmaUrl as string
        )
        return {
          content: [
            {
              type: 'text',
              text: `✅ Imported Figma design: ${design.name} (ID: ${design.id})`,
            },
          ],
        }
      }

      case 'list_designs': {
        const designs = await client.listDesigns(args.projectId as string)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(designs, null, 2),
            },
          ],
        }
      }

      case 'generate_code': {
        const result = await client.generateCode(args.designId as string)
        return {
          content: [
            {
              type: 'text',
              text: `✅ Generated ${result.stats.componentsGenerated} components from ${result.stats.framesFound} frames!\n\nComponents:\n${result.components.map((c: any) => `- ${c.name} (ID: ${c.id})`).join('\n')}`,
            },
          ],
        }
      }

      case 'get_design_components': {
        const components = await client.getDesignComponents(args.designId as string)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(components, null, 2),
            },
          ],
        }
      }

      case 'get_component': {
        const component = await client.getComponent(args.componentId as string)
        return {
          content: [
            {
              type: 'text',
              text: `Component: ${component.name}\n\n\`\`\`${component.language}\n${component.code}\n\`\`\``,
            },
          ],
        }
      }

      case 'update_component': {
        const component = await client.updateComponent(
          args.componentId as string,
          args.code as string | undefined,
          args.name as string | undefined
        )
        return {
          content: [
            {
              type: 'text',
              text: `✅ Updated component: ${component.name}`,
            },
          ],
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`,
        },
      ],
      isError: true,
    }
  }
})

// Start server
async function main() {
  await authenticate()

  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('🚀 Code-Figma MCP server running')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
