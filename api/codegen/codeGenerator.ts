/**
 * Code Generator - Converts Figma nodes to React + Tailwind code
 */

import { FigmaNode, sanitizeComponentName, flattenChildren } from './figmaParser.js'
import { mapStylesToTailwind } from './styleMapper.js'

export interface GeneratedComponent {
  name: string
  code: string
  language: string
}

/**
 * Generate React component from Figma node
 */
export function generateReactComponent(node: FigmaNode): GeneratedComponent {
  const componentName = sanitizeComponentName(node.name)
  const jsx = generateJSX(node, 0)

  const code = `import React from 'react'

export default function ${componentName}() {
  return (
${indent(jsx, 4)}
  )
}
`

  return {
    name: componentName,
    code,
    language: 'tsx',
  }
}

/**
 * Generate JSX for a node
 */
function generateJSX(node: FigmaNode, depth: number = 0): string {
  const classes = mapStylesToTailwind(node)
  const className = classes.length > 0 ? ` className="${classes.join(' ')}"` : ''

  // Handle different node types
  switch (node.type) {
    case 'TEXT':
      return `<p${className}>${escapeJsx(node.characters || '')}</p>`

    case 'RECTANGLE':
    case 'ELLIPSE':
      return `<div${className}></div>`

    case 'FRAME':
    case 'COMPONENT':
    case 'INSTANCE':
    case 'GROUP':
      return generateContainer(node, className, depth)

    default:
      // Generic container
      return generateContainer(node, className, depth)
  }
}

/**
 * Generate container element with children
 */
function generateContainer(node: FigmaNode, className: string, depth: number): string {
  const children = flattenChildren(node)

  if (children.length === 0) {
    return `<div${className}></div>`
  }

  const childrenJSX = children
    .map(child => generateJSX(child, depth + 1))
    .map(jsx => indent(jsx, 2))
    .join('\n')

  return `<div${className}>
${childrenJSX}
</div>`
}

/**
 * Indent string by n spaces
 */
function indent(str: string, spaces: number): string {
  const indentation = ' '.repeat(spaces)
  return str.split('\n').map(line => indentation + line).join('\n')
}

/**
 * Escape text for use in JSX
 */
function escapeJsx(text: string): string {
  return text
    .replace(/\{/g, "{'{'}")
    .replace(/\}/g, "{'}'}")
    .replace(/</g, "{'<'}")
    .replace(/>/g, "{'>'}")
}

/**
 * Generate multiple components from frames
 */
export function generateComponents(frames: FigmaNode[]): GeneratedComponent[] {
  return frames.map(frame => generateReactComponent(frame))
}
