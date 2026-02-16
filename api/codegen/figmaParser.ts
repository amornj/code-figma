/**
 * Figma Parser - Extracts and structures Figma design data
 */

export interface FigmaNode {
  id: string
  name: string
  type: string
  visible?: boolean
  children?: FigmaNode[]

  // Layout
  absoluteBoundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }

  // Auto Layout
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE'
  primaryAxisSizingMode?: 'FIXED' | 'AUTO'
  counterAxisSizingMode?: 'FIXED' | 'AUTO'
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX'
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  itemSpacing?: number

  // Styles
  fills?: Array<{
    type: string
    color?: {
      r: number
      g: number
      b: number
      a: number
    }
  }>
  strokes?: Array<any>
  strokeWeight?: number
  cornerRadius?: number

  // Text
  characters?: string
  style?: {
    fontFamily?: string
    fontWeight?: number
    fontSize?: number
    letterSpacing?: number
    lineHeightPx?: number
    textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT'
  }

  // Effects
  effects?: Array<{
    type: string
    radius?: number
    color?: any
    offset?: { x: number; y: number }
  }>
}

export interface ParsedComponent {
  name: string
  node: FigmaNode
  type: 'FRAME' | 'COMPONENT' | 'TEXT' | 'RECTANGLE' | 'OTHER'
}

/**
 * Extract all frames and components from Figma document (recursive - may include duplicates)
 */
export function extractFrames(documentNode: FigmaNode): ParsedComponent[] {
  const frames: ParsedComponent[] = []

  function traverse(node: FigmaNode) {
    if (node.visible === false) return

    if (node.type === 'FRAME' || node.type === 'COMPONENT') {
      frames.push({
        name: node.name,
        node,
        type: node.type as 'FRAME' | 'COMPONENT',
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(documentNode)
  return frames
}

/**
 * Extract only top-level frames from Figma document.
 * In Figma, the document has pages (CANVAS nodes), and each page has top-level frames.
 * We only want these top-level frames to avoid generating duplicate components
 * for frames nested inside other frames.
 */
export function extractTopLevelFrames(documentNode: FigmaNode): ParsedComponent[] {
  const frames: ParsedComponent[] = []

  // Figma structure: DOCUMENT -> CANVAS (pages) -> FRAME/COMPONENT (top-level)
  const pages = documentNode.children || []

  for (const page of pages) {
    if (page.visible === false) continue
    if (page.type !== 'CANVAS' && page.type !== 'PAGE') {
      // If the document doesn't have canvas/page nodes, treat children as top-level
      if (page.type === 'FRAME' || page.type === 'COMPONENT' || page.type === 'COMPONENT_SET') {
        frames.push({
          name: page.name,
          node: page,
          type: (page.type === 'COMPONENT_SET' ? 'COMPONENT' : page.type) as 'FRAME' | 'COMPONENT',
        })
      }
      continue
    }

    // Get direct children of the page (top-level frames)
    const children = page.children || []
    for (const child of children) {
      if (child.visible === false) continue
      if (child.type === 'FRAME' || child.type === 'COMPONENT' || child.type === 'COMPONENT_SET' || child.type === 'INSTANCE') {
        frames.push({
          name: child.name,
          node: child,
          type: child.type === 'FRAME' || child.type === 'INSTANCE' ? 'FRAME' : 'COMPONENT',
        })
      }
    }
  }

  return frames
}

/**
 * Get color as hex string
 */
export function rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`

  if (a < 1) {
    return hex + toHex(a)
  }

  return hex
}

/**
 * Sanitize component name for React
 */
export function sanitizeComponentName(name: string): string {
  // Remove special characters, spaces
  let sanitized = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^\d/, 'Component$&') // Can't start with number

  // Capitalize first letter
  return sanitized.charAt(0).toUpperCase() + sanitized.slice(1)
}

/**
 * Check if node has Auto Layout
 */
export function hasAutoLayout(node: FigmaNode): boolean {
  return node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL'
}

/**
 * Get primary fill color
 */
export function getPrimaryFill(node: FigmaNode): string | null {
  if (!node.fills || node.fills.length === 0) return null

  const fill = node.fills[0]
  if (fill.type !== 'SOLID' || !fill.color) return null

  const { r, g, b, a } = fill.color
  return rgbaToHex(r, g, b, a)
}

/**
 * Flatten children into renderable array
 */
export function flattenChildren(node: FigmaNode): FigmaNode[] {
  if (!node.children) return []
  return node.children.filter(child => child.visible !== false)
}
