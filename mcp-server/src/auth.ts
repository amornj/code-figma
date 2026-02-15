/**
 * Authentication - Get Supabase auth token
 */

import axios from 'axios'

export async function getAuthToken(
  supabaseUrl: string,
  anonKey: string,
  email: string,
  password: string
): Promise<string> {
  try {
    const response = await axios.post(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        email,
        password,
      },
      {
        headers: {
          'apikey': anonKey,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.access_token
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`)
  }
}
