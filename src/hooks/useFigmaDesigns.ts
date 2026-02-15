import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { FigmaDesign } from '@/types'
import { figma } from '@/lib/figma'
import toast from 'react-hot-toast'

export function useFigmaDesigns(projectId: string) {
  return useQuery({
    queryKey: ['figma-designs', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('figma_designs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as FigmaDesign[]
    },
  })
}

export function useImportFigmaDesign(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (figmaUrl: string) => {
      // Parse Figma URL
      const parsed = figma.parseFigmaUrl(figmaUrl)
      if (!parsed) {
        throw new Error('Invalid Figma URL')
      }

      const { fileKey, nodeId } = parsed

      // Fetch Figma file data
      const fileData = await figma.getFigmaFile(fileKey)

      // Get thumbnail
      const thumbnailUrl = await figma.getFigmaThumbnail(fileKey)

      // Insert into database
      const { data, error } = await supabase
        .from('figma_designs')
        .insert([
          {
            project_id: projectId,
            name: fileData.name,
            figma_file_key: fileKey,
            figma_node_id: nodeId || null,
            thumbnail_url: thumbnailUrl,
            figma_data: fileData,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['figma-designs', projectId] })
      toast.success('Figma design imported successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import Figma design')
    },
  })
}

export function useDeleteFigmaDesign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (designId: string) => {
      const { error } = await supabase
        .from('figma_designs')
        .delete()
        .eq('id', designId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['figma-designs'] })
      toast.success('Design deleted')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete design')
    },
  })
}
