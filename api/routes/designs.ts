import express from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { supabaseAdmin } from '../utils/supabase.js'
import axios from 'axios'

const router = express.Router()
const FIGMA_API_BASE = 'https://api.figma.com/v1'
const FIGMA_TOKEN = process.env.VITE_FIGMA_ACCESS_TOKEN

router.use(authMiddleware)

// POST /api/designs/import - Import Figma design
router.post('/import', async (req: AuthRequest, res) => {
  try {
    const { projectId, figmaUrl } = req.body

    if (!projectId || !figmaUrl) {
      return res.status(400).json({ error: 'projectId and figmaUrl are required' })
    }

    // Verify user owns the project
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', req.user!.id)
      .single()

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Parse Figma URL
    const urlMatch = figmaUrl.match(/\/(file|design)\/([a-zA-Z0-9]+)/)
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid Figma URL' })
    }

    const fileKey = urlMatch[2]
    const nodeId = new URL(figmaUrl).searchParams.get('node-id') || null

    // Check if design already exists
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('figma_designs')
      .select('id')
      .eq('project_id', projectId)
      .eq('figma_file_key', fileKey)
      .maybeSingle()

    if (existing) {
      return res.status(409).json({ error: 'Design already imported for this project' })
    }

    // Fetch from Figma API
    const response = await axios.get(`${FIGMA_API_BASE}/files/${fileKey}`, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN },
    })

    const fileData = response.data

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from('figma_designs')
      .insert([{
        project_id: projectId,
        name: fileData.name,
        figma_file_key: fileKey,
        figma_node_id: nodeId,
        thumbnail_url: fileData.thumbnailUrl || null,
        figma_data: fileData,
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ design: data })
  } catch (error: any) {
    console.error('Import error:', error.response?.data || error.message)

    // Handle Figma API rate limiting
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Figma API rate limit reached. Please wait a few minutes and try again.'
      })
    }

    res.status(500).json({ error: error.message })
  }
})

// GET /api/designs/:id - Get design details
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('figma_designs')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data || data.projects.user_id !== req.user!.id) {
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

    // Verify ownership through project
    const { data: design } = await supabaseAdmin
      .from('figma_designs')
      .select(`
        id,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (!design || design.projects.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Design not found' })
    }

    const { error } = await supabaseAdmin
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

    // Verify ownership
    const { data: design } = await supabaseAdmin
      .from('figma_designs')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (!design || design.projects.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Design not found' })
    }

    // Import code generation module
    const { generateCodeFromDesign } = await import('../codegen/index.js')

    // Generate code
    const result = await generateCodeFromDesign(id)

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

    // Verify ownership
    const { data: design } = await supabaseAdmin
      .from('figma_designs')
      .select(`
        id,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (!design || design.projects.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Design not found' })
    }

    // Get components
    const { data: components, error } = await supabaseAdmin
      .from('components')
      .select('*')
      .eq('figma_design_id', id)
      .order('created_at', { ascending: true })

    if (error) throw error

    res.json({ components })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
