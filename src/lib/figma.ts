import axios from 'axios'

const FIGMA_API_BASE = 'https://api.figma.com/v1'
const FIGMA_TOKEN = import.meta.env.VITE_FIGMA_ACCESS_TOKEN

if (!FIGMA_TOKEN) {
  console.warn('Figma access token not configured')
}

const figmaClient = axios.create({
  baseURL: FIGMA_API_BASE,
  headers: {
    'X-Figma-Token': FIGMA_TOKEN,
  },
})

export interface FigmaFile {
  name: string
  lastModified: string
  thumbnailUrl: string
  version: string
  document: any
  components: any
  schemaVersion: number
}

export interface FigmaNode {
  id: string
  name: string
  type: string
  children?: FigmaNode[]
}

export interface FigmaImageResponse {
  err: string | null
  images: Record<string, string>
}

/**
 * Parse Figma URL to extract file key and node ID
 * Example URL: https://www.figma.com/file/ABC123/My-Design?node-id=1:2
 * Or: https://www.figma.com/design/ABC123/My-Design
 */
export function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
  try {
    const urlObj = new URL(url)

    // Match patterns like /file/KEY, /design/KEY, or /proto/KEY
    const pathMatch = urlObj.pathname.match(/\/(file|design|proto)\/([a-zA-Z0-9]+)/)
    if (!pathMatch) return null

    const fileKey = pathMatch[2]
    const nodeId = urlObj.searchParams.get('node-id') || undefined

    return { fileKey, nodeId }
  } catch (error) {
    return null
  }
}

/**
 * Get Figma file data
 */
export async function getFigmaFile(fileKey: string): Promise<FigmaFile> {
  const response = await figmaClient.get(`/files/${fileKey}`)
  return response.data
}

/**
 * Get specific node from Figma file
 */
export async function getFigmaNode(fileKey: string, nodeId: string) {
  const response = await figmaClient.get(`/files/${fileKey}/nodes`, {
    params: { ids: nodeId },
  })
  return response.data
}

/**
 * Get image URLs for Figma nodes
 */
export async function getFigmaImages(
  fileKey: string,
  nodeIds: string[],
  options: {
    scale?: number
    format?: 'jpg' | 'png' | 'svg' | 'pdf'
  } = {}
): Promise<FigmaImageResponse> {
  const { scale = 2, format = 'png' } = options

  const response = await figmaClient.get(`/images/${fileKey}`, {
    params: {
      ids: nodeIds.join(','),
      scale,
      format,
    },
  })

  return response.data
}

/**
 * Get file thumbnail
 */
export async function getFigmaThumbnail(fileKey: string): Promise<string | null> {
  try {
    const file = await getFigmaFile(fileKey)
    return file.thumbnailUrl || null
  } catch (error) {
    console.error('Failed to get Figma thumbnail:', error)
    return null
  }
}

/**
 * Extract all frames from a Figma file
 */
export function extractFrames(node: FigmaNode): FigmaNode[] {
  const frames: FigmaNode[] = []

  function traverse(n: FigmaNode) {
    if (n.type === 'FRAME' || n.type === 'COMPONENT') {
      frames.push(n)
    }

    if (n.children) {
      n.children.forEach(traverse)
    }
  }

  traverse(node)
  return frames
}

export const figma = {
  parseFigmaUrl,
  getFigmaFile,
  getFigmaNode,
  getFigmaImages,
  getFigmaThumbnail,
  extractFrames,
}
