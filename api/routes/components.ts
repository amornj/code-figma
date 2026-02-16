import express from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// GET /api/components/:id - Get component code
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const db = req.supabase!

    // RLS ensures user can only see components linked to their designs/projects
    const { data, error } = await db
      .from('components')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Component not found' })
    }

    res.json({ component: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/components/:id - Update component code
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { code, name } = req.body
    const db = req.supabase!

    const updateFields: Record<string, any> = {}
    if (code !== undefined) updateFields.code = code
    if (name !== undefined) updateFields.name = name

    const { data, error } = await db
      .from('components')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Component not found' })
    }

    res.json({ component: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/components/:id - Delete component
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const db = req.supabase!

    const { error } = await db
      .from('components')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Component deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
