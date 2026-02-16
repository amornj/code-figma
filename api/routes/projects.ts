import express from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/projects - List all projects for authenticated user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const db = req.supabase!
    const { data, error } = await db
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ projects: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/projects/:id - Get single project
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const db = req.supabase!

    const { data, error } = await db
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json({ project: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/projects - Create new project
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body
    const db = req.supabase!

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' })
    }

    const { data, error } = await db
      .from('projects')
      .insert([{
        user_id: req.user!.id,
        name,
        description: description || null,
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ project: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/projects/:id - Update project
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body
    const db = req.supabase!

    const { data, error } = await db
      .from('projects')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json({ project: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const db = req.supabase!

    const { error } = await db
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Project deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/projects/:id/designs - Get all designs for a project
router.get('/:id/designs', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const db = req.supabase!

    // Verify user owns the project (RLS handles this)
    const { data: project } = await db
      .from('projects')
      .select('id')
      .eq('id', id)
      .single()

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const { data, error } = await db
      .from('figma_designs')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ designs: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
