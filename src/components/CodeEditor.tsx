import { useRef, useState } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { Copy, Download, Maximize2, Minimize2, Check } from 'lucide-react'
import * as monaco from 'monaco-editor'

interface CodeEditorProps {
  code: string
  language?: string
  onChange?: (value: string) => void
  readOnly?: boolean
  fileName?: string
}

export default function CodeEditor({
  code,
  language = 'typescript',
  onChange,
  readOnly = false,
  fileName = 'Component.tsx',
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark')

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleTheme = () => {
    setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')
  }

  return (
    <div
      className={`flex flex-col border border-gray-300 rounded-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{fileName}</span>
          {readOnly && (
            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
              Read Only
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            {theme === 'vs-dark' ? '🌙 Dark' : '☀️ Light'}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Copy code"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Download file"
          >
            <Download size={14} />
            Download
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => onChange?.(value || '')}
          theme={theme}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            readOnly,
            formatOnPaste: true,
            formatOnType: true,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  )
}
