import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import projectsRouter from './routes/projects.js'
import designsRouter from './routes/designs.js'
import componentsRouter from './routes/components.js'
import { errorHandler } from './middleware/errorHandler.js'
import { supabaseAdmin } from './utils/supabase.js'

dotenv.config()

const app = express()
const PORT = process.env.API_PORT || 3000

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', process.env.VITE_APP_URL].filter(Boolean),
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// DEV ONLY: Auth helpers for testing
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/signup', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' })
    }
    const { data, error } = await supabaseAdmin.auth.signUp({ email, password })
    if (error) return res.status(400).json({ error: error.message, code: error.status })
    res.json({
      user: data.user ? { id: data.user.id, email: data.user.email, confirmed: data.user.email_confirmed_at } : null,
      session: data.session ? { access_token: data.session.access_token, expires_at: data.session.expires_at } : null,
    })
  })

  app.post('/api/dev/signin', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' })
    }
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
    if (error) return res.status(400).json({ error: error.message, code: error.status })
    res.json({
      user: { id: data.user.id, email: data.user.email },
      session: { access_token: data.session.access_token, expires_at: data.session.expires_at },
    })
  })
}

// API Routes
app.use('/api/projects', projectsRouter)
app.use('/api/designs', designsRouter)
app.use('/api/components', componentsRouter)

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
})

export default app
