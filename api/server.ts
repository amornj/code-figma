import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import projectsRouter from './routes/projects.js'
import designsRouter from './routes/designs.js'
import componentsRouter from './routes/components.js'
import { errorHandler } from './middleware/errorHandler.js'

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
