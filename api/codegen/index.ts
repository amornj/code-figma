/**
 * Code Generation Orchestrator
 */

import { supabaseAdmin } from '../utils/supabase.js'
import { extractFrames, ParsedComponent } from './figmaParser.js'
import { generateReactComponent, GeneratedComponent } from './codeGenerator.js'

export interface GenerationResult {
  designId: string
  components: Array<{
    id: string
    name: string
    code: string
  }>
  stats: {
    framesFound: number
    componentsGenerated: number
  }
}

/**
 * Generate code from a Figma design
 */
export async function generateCodeFromDesign(designId: string): Promise<GenerationResult> {
  // 1. Fetch design from database
  const { data: design, error } = await supabaseAdmin
    .from('figma_designs')
    .select('*')
    .eq('id', designId)
    .single()

  if (error || !design) {
    throw new Error('Design not found')
  }

  // 2. Extract frames from Figma data
  const figmaData = design.figma_data
  const documentNode = figmaData.document

  if (!documentNode) {
    throw new Error('No document node found in Figma data')
  }

  const frames = extractFrames(documentNode)

  if (frames.length === 0) {
    throw new Error('No frames found in design')
  }

  // 3. Generate code for each frame
  const generatedComponents: GeneratedComponent[] = []

  for (const frame of frames) {
    try {
      const component = generateReactComponent(frame.node)
      generatedComponents.push(component)
    } catch (error) {
      console.error(`Failed to generate component for frame: ${frame.name}`, error)
      // Continue with other frames
    }
  }

  // 4. Store components in database
  const storedComponents = []

  for (const component of generatedComponents) {
    const { data: stored, error } = await supabaseAdmin
      .from('components')
      .insert([{
        figma_design_id: designId,
        name: component.name,
        code: component.code,
        language: component.language,
      }])
      .select()
      .single()

    if (error) {
      console.error(`Failed to store component: ${component.name}`, error)
      continue
    }

    storedComponents.push({
      id: stored.id,
      name: stored.name,
      code: stored.code,
    })
  }

  // 5. Return result
  return {
    designId,
    components: storedComponents,
    stats: {
      framesFound: frames.length,
      componentsGenerated: storedComponents.length,
    },
  }
}

/**
 * Get all components for a design
 */
export async function getComponentsForDesign(designId: string) {
  const { data, error } = await supabaseAdmin
    .from('components')
    .select('*')
    .eq('figma_design_id', designId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch components')
  }

  return data
}
