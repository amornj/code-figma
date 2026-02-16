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
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Use backend API to import design
      const response = await fetch('http://localhost:3000/api/designs/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          figmaUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import design')
      }

      return data.design
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
