import express from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import axios from 'axios'

const router = express.Router()
const FIGMA_API_BASE = 'https://api.figma.com/v1'
const FIGMA_TOKEN = process.env.VITE_FIGMA_ACCESS_TOKEN

/** Log Supabase errors with full detail */
function logSupabaseError(context: string, error: any) {
  console.error(`[Supabase ${context}]`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  })
}

router.use(authMiddleware)

// POST /api/designs/import - Import Figma design
router.post('/import', async (req: AuthRequest, res) => {
  try {
    const { projectId, figmaUrl } = req.body
    const db = req.supabase!

    if (!projectId || !figmaUrl) {
      return res.status(400).json({ error: 'projectId and figmaUrl are required' })
    }

    if (!FIGMA_TOKEN) {
      return res.status(500).json({ error: 'Figma API token not configured on server' })
    }

    // Verify user owns the project (RLS ensures only user's projects are visible)
    const { data: project, error: projectError } = await db
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      if (projectError) logSupabaseError('project lookup', projectError)
      return res.status(404).json({ error: 'Project not found or access denied' })
    }

    // Parse Figma URL - handle /file/, /design/, and /proto/ patterns
    const urlMatch = figmaUrl.match(/\/(file|design|proto)\/([a-zA-Z0-9]+)/)
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid Figma URL. Expected format: https://www.figma.com/design/FILE_KEY/...' })
    }

    const fileKey = urlMatch[2]

    // Parse node-id from URL if present
    let nodeId: string | null = null
    try {
      nodeId = new URL(figmaUrl).searchParams.get('node-id') || null
    } catch {
      // URL parsing failed, skip node-id extraction
    }

    // Check if design already exists for this project
    const { data: existing } = await db
      .from('figma_designs')
      .select('id')
      .eq('project_id', projectId)
      .eq('figma_file_key', fileKey)
      .maybeSingle()

    if (existing) {
      return res.status(409).json({ error: 'This design has already been imported to this project' })
    }

    // Fetch from Figma API
    let fileData: any
    try {
      const response = await axios.get(`${FIGMA_API_BASE}/files/${fileKey}`, {
        headers: { 'X-Figma-Token': FIGMA_TOKEN },
        timeout: 30000,
      })
      fileData = response.data
    } catch (figmaError: any) {
      if (figmaError.response?.status === 429) {
        const retryAfter = figmaError.response.headers['retry-after']
        const waitMinutes = retryAfter ? Math.ceil(Number(retryAfter) / 60) : 'a few'
        return res.status(429).json({
          error: `Figma API rate limit reached. Please wait ${waitMinutes} minutes and try again.`,
          retryAfter: retryAfter ? Number(retryAfter) : undefined,
        })
      }
      if (figmaError.response?.status === 403) {
        return res.status(403).json({ error: 'Access denied. Check that your Figma token has access to this file.' })
      }
      if (figmaError.response?.status === 404) {
        return res.status(404).json({ error: 'Figma file not found. Check the URL and try again.' })
      }
      throw figmaError
    }

    // Insert into database
    const { data, error } = await db
      .from('figma_designs')
      .insert([{
        project_id: projectId,
        name: fileData.name || 'Untitled Design',
        figma_file_key: fileKey,
        figma_node_id: nodeId,
        thumbnail_url: fileData.thumbnailUrl || null,
        figma_data: fileData,
      }])
      .select()
      .single()

    if (error) {
      logSupabaseError('design insert', error)
      return res.status(500).json({
        error: 'Failed to save design to database',
        details: process.env.NODE_ENV === 'development' ? { code: error.code, message: error.message, hint: error.hint } : undefined,
      })
    }

    console.log(`[Import] Design saved: ${data.id} (${data.name}) for project ${projectId}`)
    res.status(201).json({ design: data })
  } catch (error: any) {
    console.error('Import error:', error.response?.data || error.message)
    res.status(500).json({ error: error.message || 'Failed to import design' })
  }
})

// POST /api/designs/mock-import - Import a design with sample Figma data (for testing without Figma API)
router.post('/mock-import', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.body
    const db = req.supabase!

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' })
    }

    // Verify user owns the project (RLS)
    const { data: project, error: projectError } = await db
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      if (projectError) logSupabaseError('mock-import project lookup', projectError)
      return res.status(404).json({ error: 'Project not found or access denied' })
    }

    // Sample Figma document data that exercises the code generation pipeline
    const mockFigmaData = {
      name: 'Mock Design - Sample Card',
      lastModified: new Date().toISOString(),
      thumbnailUrl: null,
      version: '1',
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [
          {
            id: '0:1',
            name: 'Page 1',
            type: 'CANVAS',
            children: [
              {
                id: '1:2',
                name: 'Card',
                type: 'FRAME',
                visible: true,
                absoluteBoundingBox: { x: 0, y: 0, width: 384, height: 320 },
                layoutMode: 'VERTICAL',
                primaryAxisSizingMode: 'FIXED',
                counterAxisSizingMode: 'FIXED',
                primaryAxisAlignItems: 'MIN',
                counterAxisAlignItems: 'MIN',
                paddingTop: 16,
                paddingRight: 16,
                paddingBottom: 16,
                paddingLeft: 16,
                itemSpacing: 12,
                cornerRadius: 12,
                fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
                effects: [{ type: 'DROP_SHADOW', radius: 8, color: { r: 0, g: 0, b: 0, a: 0.1 }, offset: { x: 0, y: 2 } }],
                children: [
                  {
                    id: '1:3',
                    name: 'Title',
                    type: 'TEXT',
                    visible: true,
                    characters: 'Card Title',
                    style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 24, textAlignHorizontal: 'LEFT' },
                    fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 1 } }],
                  },
                  {
                    id: '1:4',
                    name: 'Description',
                    type: 'TEXT',
                    visible: true,
                    characters: 'This is a sample card description with some text content.',
                    style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 16, textAlignHorizontal: 'LEFT' },
                    fills: [{ type: 'SOLID', color: { r: 0.42, g: 0.45, b: 0.50, a: 1 } }],
                  },
                  {
                    id: '1:5',
                    name: 'Button Row',
                    type: 'FRAME',
                    visible: true,
                    layoutMode: 'HORIZONTAL',
                    primaryAxisAlignItems: 'MAX',
                    counterAxisAlignItems: 'CENTER',
                    itemSpacing: 8,
                    children: [
                      {
                        id: '1:6',
                        name: 'Button',
                        type: 'FRAME',
                        visible: true,
                        layoutMode: 'HORIZONTAL',
                        primaryAxisAlignItems: 'CENTER',
                        counterAxisAlignItems: 'CENTER',
                        paddingTop: 8,
                        paddingRight: 16,
                        paddingBottom: 8,
                        paddingLeft: 16,
                        cornerRadius: 8,
                        fills: [{ type: 'SOLID', color: { r: 0.23, g: 0.51, b: 0.96, a: 1 } }],
                        children: [
                          {
                            id: '1:7',
                            name: 'Button Text',
                            type: 'TEXT',
                            visible: true,
                            characters: 'Click Me',
                            style: { fontFamily: 'Inter', fontWeight: 600, fontSize: 14, textAlignHorizontal: 'CENTER' },
                            fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: '2:1',
                name: 'Hero Section',
                type: 'FRAME',
                visible: true,
                absoluteBoundingBox: { x: 0, y: 400, width: 1200, height: 600 },
                layoutMode: 'VERTICAL',
                primaryAxisAlignItems: 'CENTER',
                counterAxisAlignItems: 'CENTER',
                paddingTop: 64,
                paddingRight: 32,
                paddingBottom: 64,
                paddingLeft: 32,
                itemSpacing: 24,
                fills: [{ type: 'SOLID', color: { r: 0.95, g: 0.96, b: 0.97, a: 1 } }],
                children: [
                  {
                    id: '2:2',
                    name: 'Hero Title',
                    type: 'TEXT',
                    visible: true,
                    characters: 'Welcome to Our Platform',
                    style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 36, textAlignHorizontal: 'CENTER' },
                    fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 1 } }],
                  },
                  {
                    id: '2:3',
                    name: 'Hero Subtitle',
                    type: 'TEXT',
                    visible: true,
                    characters: 'Build something amazing with our tools',
                    style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 18, textAlignHorizontal: 'CENTER' },
                    fills: [{ type: 'SOLID', color: { r: 0.42, g: 0.45, b: 0.50, a: 1 } }],
                  },
                ],
              },
            ],
          },
        ],
      },
    }

    // Insert mock design into database
    const { data, error } = await db
      .from('figma_designs')
      .insert([{
        project_id: projectId,
        name: mockFigmaData.name,
        figma_file_key: `mock_${Date.now()}`,
        figma_node_id: null,
        thumbnail_url: null,
        figma_data: mockFigmaData,
      }])
      .select()
      .single()

    if (error) {
      logSupabaseError('mock design insert', error)
      return res.status(500).json({
        error: 'Failed to save mock design to database',
        details: process.env.NODE_ENV === 'development' ? { code: error.code, message: error.message, hint: error.hint } : undefined,
      })
    }

    console.log(`[Mock Import] Design saved: ${data.id} (${data.name}) for project ${projectId}`)
    res.status(201).json({ design: data, mock: true })
  } catch (error: any) {
    console.error('Mock import error:', error.message)
    res.status(500).json({ error: error.message || 'Failed to mock import design' })
  }
})

// GET /api/designs/:id - Get design details
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const db = req.supabase!

    // RLS ensures only the user's designs (via project ownership) are visible
    const { data, error } = await db
      .from('figma_designs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Design not found' })
    }

    res.json({ design: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/designs/:id - Delete design
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const db = req.supabase!

    // First check it exists (RLS handles ownership)
    const { data: design } = await db
      .from('figma_designs')
      .select('id')
      .eq('id', id)
      .single()

    if (!design) {
      return res.status(404).json({ error: 'Design not found' })
    }

    const { error } = await db
      .from('figma_designs')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Design deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/designs/:id/generate - Generate code from design
router.post('/:id/generate', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const db = req.supabase!

    // Verify design exists and user has access (RLS)
    const { data: design, error: designError } = await db
      .from('figma_designs')
      .select('*')
      .eq('id', id)
      .single()

    if (designError || !design) {
      if (designError) logSupabaseError('design lookup for codegen', designError)
      return res.status(404).json({ error: 'Design not found or access denied' })
    }

    // Check if figma_data exists
    if (!design.figma_data || !design.figma_data.document) {
      return res.status(400).json({ error: 'Design has no Figma data. Try re-importing it.' })
    }

    // Import code generation module
    const { generateCodeFromDesign } = await import('../codegen/index.js')

    // Generate code (pass the user's supabase client for DB operations)
    const result = await generateCodeFromDesign(id, db)

    res.json({
      message: 'Code generated successfully',
      result,
    })
  } catch (error: any) {
    console.error('Code generation error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/designs/:id/components - Get generated components for a design
router.get('/:id/components', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const db = req.supabase!

    // Verify design exists (RLS handles ownership)
    const { data: design } = await db
      .from('figma_designs')
      .select('id')
      .eq('id', id)
      .single()

    if (!design) {
      return res.status(404).json({ error: 'Design not found' })
    }

    // Get components
    const { data: components, error } = await db
      .from('components')
      .select('*')
      .eq('figma_design_id', id)
      .order('created_at', { ascending: true })

    if (error) throw error

    res.json({ components: components || [] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
