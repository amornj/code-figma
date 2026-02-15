import { useState } from 'react'
import { FigmaDesign } from '@/types'
import { ExternalLink, Trash2, Code, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import ComponentViewer from './ComponentViewer'

interface DesignCardProps {
  design: FigmaDesign
  onDelete: (id: string) => void
}

export default function DesignCard({ design, onDelete }: DesignCardProps) {
  const [generating, setGenerating] = useState(false)
  const [components, setComponents] = useState<any[]>([])
  const [showComponents, setShowComponents] = useState(false)
  const [loadingComponents, setLoadingComponents] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<any>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(`http://localhost:3000/api/designs/${design.id}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate code')
      }

      toast.success(`Generated ${data.result.stats.componentsGenerated} components!`)

      // Load components after generation
      setComponents(data.result.components)
      setShowComponents(true)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setGenerating(false)
    }
  }

  const loadComponents = async () => {
    setLoadingComponents(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(`http://localhost:3000/api/designs/${design.id}/components`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setComponents(data.components || [])
      }
    } catch (error: any) {
      console.error('Failed to load components:', error)
    } finally {
      setLoadingComponents(false)
    }
  }

  const toggleComponents = async () => {
    if (!showComponents && components.length === 0) {
      await loadComponents()
    }
    setShowComponents(!showComponents)
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      {/* Design Thumbnail */}
      <div className="aspect-video bg-gray-100 relative">
        {design.thumbnail_url ? (
          <img
            src={design.thumbnail_url}
            alt={design.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Code className="text-gray-400" size={48} />
          </div>
        )}
      </div>

      {/* Design Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-3">
          {design.name}
        </h3>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <a
              href={`https://www.figma.com/file/${design.figma_file_key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <ExternalLink size={14} />
              Open in Figma
            </a>
            <button
              onClick={() => {
                if (confirm('Delete this design?')) {
                  onDelete(design.id)
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Code size={16} />
            {generating ? 'Generating...' : 'Generate Code'}
          </button>

          {components.length > 0 && (
            <button
              onClick={toggleComponents}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showComponents ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {components.length} Component{components.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Components List */}
        {showComponents && (
          <div className="mt-4 space-y-2">
            {loadingComponents ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              components.map((component) => (
                <div
                  key={component.id}
                  className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold">
                      {component.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{component.language}</span>
                      <button
                        onClick={() => setSelectedComponent(component)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </div>
                  </div>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto max-h-20">
                    <code>{component.code.substring(0, 200)}...</code>
                  </pre>
                </div>
              ))
            )}
          </div>
        )}

        {/* Component Viewer Modal */}
        {selectedComponent && (
          <ComponentViewer
            component={selectedComponent}
            onClose={() => setSelectedComponent(null)}
            onUpdate={() => loadComponents()}
          />
        )}
      </div>
    </div>
  )
}
