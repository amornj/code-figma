import { useState } from 'react'
import { Code, Eye, Columns, Save, X } from 'lucide-react'
import CodeEditor from './CodeEditor'
import { apiRequest } from '@/lib/api'
import toast from 'react-hot-toast'

interface Component {
  id: string
  name: string
  code: string
  language: string
}

interface ComponentViewerProps {
  component: Component
  onClose: () => void
  onUpdate?: () => void
}

type ViewMode = 'code' | 'preview' | 'split'

export default function ComponentViewer({
  component,
  onClose,
  onUpdate,
}: ComponentViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [editedCode, setEditedCode] = useState(component.code)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleCodeChange = (value: string) => {
    setEditedCode(value)
    setHasChanges(value !== component.code)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await apiRequest(`/api/components/${component.id}`, {
        method: 'PUT',
        body: JSON.stringify({ code: editedCode }),
      })

      toast.success('Component saved!')
      setHasChanges(false)
      onUpdate?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save component')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{component.name}</h2>
            <p className="text-sm text-gray-500">{component.language || 'tsx'}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggles */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded ${
                  viewMode === 'code'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Code only"
              >
                <Code size={16} />
                Code
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded ${
                  viewMode === 'preview'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Preview only"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded ${
                  viewMode === 'split'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Split view"
              >
                <Columns size={16} />
                Split
              </button>
            </div>

            {/* Save Button */}
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'code' && (
            <div className="h-full p-4">
              <CodeEditor
                code={editedCode}
                language={component.language || 'typescript'}
                onChange={handleCodeChange}
                fileName={`${component.name}.${component.language || 'tsx'}`}
              />
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="h-full p-8 overflow-auto bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8 mb-4">
                  <h3 className="text-lg font-semibold mb-4">Component Preview</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                    <p>Live preview coming soon!</p>
                    <p className="text-sm mt-2">
                      This will render your React component in real-time
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <strong>Note:</strong> To see the component in action, copy the code and paste
                  it into your project, or use the "Download" button to save the file.
                </div>
              </div>
            </div>
          )}

          {viewMode === 'split' && (
            <div className="h-full grid grid-cols-2 gap-4 p-4">
              {/* Left: Preview */}
              <div className="overflow-auto bg-gray-50 rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Preview</h3>
                  <div className="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-300 text-center text-gray-500">
                    <p>Live preview coming soon!</p>
                    <p className="text-sm mt-2">Component will render here</p>
                  </div>
                </div>
              </div>

              {/* Right: Code */}
              <div className="overflow-hidden">
                <CodeEditor
                  code={editedCode}
                  language={component.language || 'typescript'}
                  onChange={handleCodeChange}
                  fileName={`${component.name}.${component.language || 'tsx'}`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
