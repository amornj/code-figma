/**
 * Code Generation Orchestrator
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { extractTopLevelFrames } from './figmaParser.js'
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
 * Generate code from a Figma design.
 * Accepts a user-scoped Supabase client to respect RLS policies.
 */
export async function generateCodeFromDesign(
  designId: string,
  db: SupabaseClient
): Promise<GenerationResult> {
  // 1. Fetch design from database
  const { data: design, error } = await db
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

  // Extract only top-level frames (direct children of pages) to avoid duplicates
  const frames = extractTopLevelFrames(documentNode)

  if (frames.length === 0) {
    throw new Error('No frames or components found in design')
  }

  // 3. Delete existing components for this design before regenerating
  await db
    .from('components')
    .delete()
    .eq('figma_design_id', designId)

  // 4. Generate code for each frame
  const generatedComponents: GeneratedComponent[] = []

  for (const frame of frames) {
    try {
      const component = generateReactComponent(frame.node)
      generatedComponents.push(component)
    } catch (err) {
      console.error(`Failed to generate component for frame: ${frame.name}`, err)
    }
  }

  if (generatedComponents.length === 0) {
    throw new Error('Failed to generate any components from the design')
  }

  // 5. Store components in database
  const storedComponents = []

  for (const component of generatedComponents) {
    const { data: stored, error: storeError } = await db
      .from('components')
      .insert([{
        figma_design_id: designId,
        name: component.name,
        code: component.code,
        language: component.language,
      }])
      .select()
      .single()

    if (storeError) {
      console.error(`Failed to store component: ${component.name}`, storeError)
      continue
    }

    storedComponents.push({
      id: stored.id,
      name: stored.name,
      code: stored.code,
    })
  }

  return {
    designId,
    components: storedComponents,
    stats: {
      framesFound: frames.length,
      componentsGenerated: storedComponents.length,
    },
  }
}
