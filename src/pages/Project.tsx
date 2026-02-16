import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { Project as ProjectType } from '@/types'
import { useFigmaDesigns, useImportFigmaDesign, useDeleteFigmaDesign } from '@/hooks/useFigmaDesigns'
import { ArrowLeft, Plus, Image as ImageIcon } from 'lucide-react'
import DesignCard from '@/components/DesignCard'

export default function Project() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showImportModal, setShowImportModal] = useState(false)
  const [figmaUrl, setFigmaUrl] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const data = await apiRequest(`/api/projects/${id}`)
      return data.project as ProjectType
    },
  })

  const { data: designs, isLoading: designsLoading } = useFigmaDesigns(id!)
  const importDesign = useImportFigmaDesign(id!)
  const deleteDesign = useDeleteFigmaDesign()

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!figmaUrl.trim()) return
    setImportError(null)

    try {
      await importDesign.mutateAsync(figmaUrl)
      setFigmaUrl('')
      setShowImportModal(false)
    } catch (error: any) {
      setImportError(error.message || 'Failed to import design')
    }
  }

  if (projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Figma Designs</h2>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={16} />
            Import Figma Design
          </button>
        </div>

        {/* Designs Grid */}
        {designsLoading ? (
          <div className="text-center py-12">Loading designs...</div>
        ) : designs && designs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                onDelete={(id) => deleteDesign.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ImageIcon className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No designs yet
            </h3>
            <p className="text-gray-600 mb-4">
              Import your first Figma design to get started
            </p>
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={16} />
              Import Figma Design
            </button>
          </div>
        )}
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Import Figma Design</h3>
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Figma File URL
                </label>
                <input
                  type="url"
                  required
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.figma.com/design/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the URL from your Figma file's address bar
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>How to get the URL:</strong>
                  <br />
                  1. Open your design in Figma
                  <br />
                  2. Copy the URL from your browser
                  <br />
                  3. Paste it here
                </p>
              </div>

              {importError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{importError}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false)
                    setFigmaUrl('')
                    setImportError(null)
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importDesign.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {importDesign.isPending ? 'Importing...' : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
