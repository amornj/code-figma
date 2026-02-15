/**
 * Style Mapper - Converts Figma styles to Tailwind CSS classes
 */

import { FigmaNode, rgbaToHex } from './figmaParser.js'

/**
 * Map Figma styles to Tailwind classes
 */
export function mapStylesToTailwind(node: FigmaNode): string[] {
  const classes: string[] = []

  // Layout (Auto Layout)
  if (node.layoutMode === 'HORIZONTAL') {
    classes.push('flex', 'flex-row')
  } else if (node.layoutMode === 'VERTICAL') {
    classes.push('flex', 'flex-col')
  }

  // Alignment
  if (node.primaryAxisAlignItems === 'CENTER') {
    classes.push('justify-center')
  } else if (node.primaryAxisAlignItems === 'MAX') {
    classes.push('justify-end')
  } else if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
    classes.push('justify-between')
  }

  if (node.counterAxisAlignItems === 'CENTER') {
    classes.push('items-center')
  } else if (node.counterAxisAlignItems === 'MAX') {
    classes.push('items-end')
  }

  // Gap (itemSpacing)
  if (node.itemSpacing) {
    const gap = mapSpacingToTailwind(node.itemSpacing)
    if (gap) classes.push(`gap-${gap}`)
  }

  // Padding
  const padding = mapPadding(node)
  classes.push(...padding)

  // Background color
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0]
    if (fill.type === 'SOLID' && fill.color) {
      const color = mapColorToTailwind(fill.color)
      if (color) classes.push(`bg-${color}`)
    }
  }

  // Border radius
  if (node.cornerRadius) {
    const radius = mapBorderRadius(node.cornerRadius)
    if (radius) classes.push(radius)
  }

  // Text styles
  if (node.type === 'TEXT') {
    classes.push(...mapTextStyles(node))
  }

  // Effects (shadows)
  if (node.effects && node.effects.length > 0) {
    const shadow = mapShadow(node.effects)
    if (shadow) classes.push(shadow)
  }

  // Width/Height
  if (node.absoluteBoundingBox) {
    const sizing = mapSizing(node)
    classes.push(...sizing)
  }

  return classes.filter(Boolean)
}

/**
 * Map spacing to Tailwind scale
 */
function mapSpacingToTailwind(pixels: number): string | null {
  const spacingMap: Record<number, string> = {
    0: '0',
    4: '1',
    8: '2',
    12: '3',
    16: '4',
    20: '5',
    24: '6',
    32: '8',
    40: '10',
    48: '12',
    64: '16',
  }

  // Find closest match
  const closest = Object.keys(spacingMap)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - pixels) < Math.abs(prev - pixels) ? curr : prev
    )

  return spacingMap[closest]
}

/**
 * Map padding to Tailwind classes
 */
function mapPadding(node: FigmaNode): string[] {
  const classes: string[] = []

  const top = node.paddingTop || 0
  const right = node.paddingRight || 0
  const bottom = node.paddingBottom || 0
  const left = node.paddingLeft || 0

  // Check if all sides are equal
  if (top === right && right === bottom && bottom === left && top > 0) {
    const p = mapSpacingToTailwind(top)
    if (p) classes.push(`p-${p}`)
  } else {
    // Individual sides
    if (top > 0) {
      const pt = mapSpacingToTailwind(top)
      if (pt) classes.push(`pt-${pt}`)
    }
    if (right > 0) {
      const pr = mapSpacingToTailwind(right)
      if (pr) classes.push(`pr-${pr}`)
    }
    if (bottom > 0) {
      const pb = mapSpacingToTailwind(bottom)
      if (pb) classes.push(`pb-${pb}`)
    }
    if (left > 0) {
      const pl = mapSpacingToTailwind(left)
      if (pl) classes.push(`pl-${pl}`)
    }
  }

  return classes
}

/**
 * Map color to Tailwind color
 */
function mapColorToTailwind(color: { r: number; g: number; b: number; a: number }): string | null {
  const hex = rgbaToHex(color.r, color.g, color.b, color.a)

  // Common color mappings
  const colorMap: Record<string, string> = {
    '#ffffff': 'white',
    '#000000': 'black',
    '#f3f4f6': 'gray-100',
    '#e5e7eb': 'gray-200',
    '#d1d5db': 'gray-300',
    '#9ca3af': 'gray-400',
    '#6b7280': 'gray-500',
    '#3b82f6': 'blue-500',
    '#10b981': 'green-500',
    '#ef4444': 'red-500',
  }

  return colorMap[hex] || `[${hex}]`
}

/**
 * Map border radius
 */
function mapBorderRadius(radius: number): string | null {
  if (radius === 0) return null

  const radiusMap: Record<number, string> = {
    4: 'rounded',
    8: 'rounded-lg',
    12: 'rounded-xl',
    16: 'rounded-2xl',
    9999: 'rounded-full',
  }

  const closest = Object.keys(radiusMap)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - radius) < Math.abs(prev - radius) ? curr : prev
    )

  return radiusMap[closest] || 'rounded'
}

/**
 * Map text styles
 */
function mapTextStyles(node: FigmaNode): string[] {
  const classes: string[] = []

  if (!node.style) return classes

  // Font size
  if (node.style.fontSize) {
    const size = mapFontSize(node.style.fontSize)
    if (size) classes.push(size)
  }

  // Font weight
  if (node.style.fontWeight) {
    const weight = mapFontWeight(node.style.fontWeight)
    if (weight) classes.push(weight)
  }

  // Text align
  if (node.style.textAlignHorizontal) {
    const align = mapTextAlign(node.style.textAlignHorizontal)
    if (align) classes.push(align)
  }

  return classes
}

function mapFontSize(size: number): string | null {
  const sizeMap: Record<number, string> = {
    12: 'text-xs',
    14: 'text-sm',
    16: 'text-base',
    18: 'text-lg',
    20: 'text-xl',
    24: 'text-2xl',
    30: 'text-3xl',
    36: 'text-4xl',
  }

  const closest = Object.keys(sizeMap)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
    )

  return sizeMap[closest]
}

function mapFontWeight(weight: number): string | null {
  if (weight >= 700) return 'font-bold'
  if (weight >= 600) return 'font-semibold'
  if (weight >= 500) return 'font-medium'
  return null
}

function mapTextAlign(align: string): string | null {
  const alignMap: Record<string, string> = {
    'LEFT': 'text-left',
    'CENTER': 'text-center',
    'RIGHT': 'text-right',
  }
  return alignMap[align] || null
}

/**
 * Map shadow effects
 */
function mapShadow(effects: any[]): string | null {
  const shadow = effects.find(e => e.type === 'DROP_SHADOW')
  if (!shadow) return null

  // Use generic shadow classes
  return 'shadow-lg'
}

/**
 * Map sizing
 */
function mapSizing(node: FigmaNode): string[] {
  const classes: string[] = []

  // For now, use arbitrary values for specific sizes
  // In production, you might want to map to Tailwind's scale

  return classes
}
