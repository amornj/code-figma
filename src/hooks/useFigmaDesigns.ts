import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FigmaDesign } from '@/types'
import { apiRequest } from '@/lib/api'
import toast from 'react-hot-toast'

export function useFigmaDesigns(projectId: string) {
  return useQuery({
    queryKey: ['figma-designs', projectId],
    queryFn: async () => {
      const data = await apiRequest(`/api/projects/${projectId}/designs`)
      return data.designs as FigmaDesign[]
    },
  })
}

export function useImportFigmaDesign(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (figmaUrl: string) => {
      const data = await apiRequest('/api/designs/import', {
        method: 'POST',
        body: JSON.stringify({ projectId, figmaUrl }),
      })
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
      await apiRequest(`/api/designs/${designId}`, { method: 'DELETE' })
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
