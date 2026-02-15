import express from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { supabaseAdmin } from '../utils/supabase.js'

const router = express.Router()

router.use(authMiddleware)

// GET /api/components/:id - Get component code
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('components')
      .select(`
        *,
        figma_designs!inner(
          id,
          projects!inner(user_id)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data || data.figma_designs.projects.user_id !== req.user!.id) {
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

    // Verify ownership
    const { data: component } = await supabaseAdmin
      .from('components')
      .select(`
        id,
        figma_designs!inner(
          id,
          projects!inner(user_id)
        )
      `)
      .eq('id', id)
      .single()

    if (!component || component.figma_designs.projects.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Component not found' })
    }

    const { data, error } = await supabaseAdmin
      .from('components')
      .update({ code, name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ component: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/components/:id - Delete component
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Verify ownership
    const { data: component } = await supabaseAdmin
      .from('components')
      .select(`
        id,
        figma_designs!inner(
          id,
          projects!inner(user_id)
        )
      `)
      .eq('id', id)
      .single()

    if (!component || component.figma_designs.projects.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Component not found' })
    }

    const { error } = await supabaseAdmin
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
