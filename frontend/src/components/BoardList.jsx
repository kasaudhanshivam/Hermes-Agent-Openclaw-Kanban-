import { useEffect, useState } from 'react'
import axios from 'axios'
import BoardView from './BoardView'

const API = `${import.meta.env.VITE_API_BASE ?? ''}/api/v1`

export default function BoardList({ onSelectBoard }) {
  const [selectedId, setSelectedId] = useState(null);
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    axios.get(`${API}/boards`)
      .then(({ data }) => {
        if (!cancelled) setBoards(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
      })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      const { data } = await axios.post(`${API}/boards`, { name: name.trim() })
      const created = data.data ?? data
      setBoards((prev) => [...prev, created])
      setSelectedId(created.id)
      setName('')
    } catch (e) {
      setCreateError(e.message)
    } finally {
      setCreating(false)
    }
  }

  if (selectedId) {
    return <BoardView boardId={selectedId} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Boards</h1>
        <p className="text-sm text-slate-500 mb-6">Create a board to get started.</p>

        <form onSubmit={handleCreate} className="mb-4 flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New board name"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
          >
            {creating ? 'Creating...' : 'Create Board'}
          </button>
        </form>
        {createError && <p className="mb-3 text-sm text-red-600">Error: {createError}</p>}

        {loading && <p className="text-sm text-slate-600">Loading boards...</p>}
        {error && <p className="text-sm text-red-600">Error: {error}</p>}

        <div className="space-y-2">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => onSelectBoard?.(board) || setSelectedId(board.id)}
              className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow hover:border-slate-300"
            >
              <div className="font-medium text-slate-900">{board.name}</div>
              <div className="text-xs text-slate-500 mt-1">
                {board.created_by ? `by ${board.created_by}` : ''}
                {board.updated_at ? ` · Updated ${new Date(board.updated_at).toLocaleDateString()}` : ''}
              </div>
            </button>
          ))}
          {boards.length === 0 && !loading && (
            <p className="text-xs text-slate-500">No boards yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
