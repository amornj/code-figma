import { Request, Response, NextFunction } from 'express'
import { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAdmin, createUserClient } from '../utils/supabase.js'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
  }
  supabase?: SupabaseClient
  accessToken?: string
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.split(' ')[1]

    // Verify JWT token with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Attach user info and a user-scoped Supabase client to the request
    req.user = {
      id: data.user.id,
      email: data.user.email!,
    }
    req.accessToken = token
    req.supabase = createUserClient(token)

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}
