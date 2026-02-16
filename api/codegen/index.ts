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
    language: string
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
    if (error) {
      console.error('[Codegen] Design fetch error:', { message: error.message, code: error.code, details: error.details, hint: error.hint })
    }
    throw new Error(`Design not found (id: ${designId})`)
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
  const { error: deleteError } = await db
    .from('components')
    .delete()
    .eq('figma_design_id', designId)

  if (deleteError) {
    console.error('[Codegen] Failed to delete existing components:', { message: deleteError.message, code: deleteError.code, details: deleteError.details })
    // Non-fatal: continue with generation even if delete failed (might just mean no existing components)
  }

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
      console.error(`[Codegen] Failed to store component: ${component.name}`, {
        message: storeError.message,
        code: storeError.code,
        details: storeError.details,
        hint: storeError.hint,
      })
      continue
    }

    storedComponents.push({
      id: stored.id,
      name: stored.name,
      code: stored.code,
      language: stored.language,
    })
  }

  console.log(`[Codegen] Generated ${storedComponents.length}/${frames.length} components for design ${designId}`)

  return {
    designId,
    components: storedComponents,
    stats: {
      framesFound: frames.length,
      componentsGenerated: storedComponents.length,
    },
  }
}
