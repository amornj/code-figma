import { useParams } from 'react-router-dom'

export default function Project() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-2xl font-bold">Project {id}</h1>
        <p className="text-gray-600 mt-2">Project workspace coming soon...</p>
      </div>
    </div>
  )
}
