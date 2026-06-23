import { useEffect, useState } from 'react'
import axios from 'axios'

const API = '/api/v1'

export default function BoardList({ onSelectBoard }) {
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
      setName('')
    } catch (e) {
      setCreateError(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-3">Boards</h2>

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New board name"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          disabled={creating}
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Board'}
        </button>
      </form>
      {createError && <p className="mb-2 text-sm text-red-600">Error: {createError}</p>}

      {loading && <p className="text-sm text-gray-600">Loading boards...</p>}
      {error && <p className="text-sm text-red-600">Error: {error}</p>}

      <ul className="space-y-2">
        {boards.map((board) => (
          <li key={board.id}>
            <button
              onClick={() => onSelectBoard(board)}
              className="w-full text-left px-4 py-3 bg-white shadow rounded hover:bg-gray-50"
            >
              <div className="font-medium">{board.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {board.created_by ? `by ${board.created_by}` : ''}
                {board.updated_at ? ` · Updated ${new Date(board.updated_at).toLocaleDateString()}` : ''}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
