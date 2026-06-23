import { useEffect, useState } from 'react'
import axios from 'axios'
import ListColumn from './ListColumn'

const API = '/api/v1'

export default function BoardView({ boardId, onBack }) {
  const [board, setBoard] = useState(null)
  const [lists, setLists] = useState([])
  const [tags, setTags] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([
      axios.get(`${API}/boards/${boardId}`),
      axios.get(`${API}/boards/${boardId}/lists`),
      axios.get(`${API}/boards/${boardId}/tags`),
      axios.get(`${API}/boards/${boardId}/members`),
    ])
      .then(([boardRes, listsRes, tagsRes, membersRes]) => {
        if (cancelled) return
        setBoard(boardRes.data.data ?? boardRes.data)
        setLists(listsRes.data.data ?? listsRes.data)
        setTags(tagsRes.data.data ?? tagsRes.data)
        setMembers(membersRes.data.data ?? membersRes.data)
      })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [boardId])

  if (loading) return <p className="p-4">Loading board...</p>
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline text-sm">← Back</button>
      <h2 className="text-2xl font-bold mb-2">{board?.name}</h2>

      <div className="mb-6">
        <h3 className="font-semibold mb-1 text-sm uppercase tracking-wide text-gray-600">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {(tags || []).map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 rounded text-sm"
              style={{ backgroundColor: tag.color || '#dbeafe', color: tag.color ? '#1f2937' : '#1e40af' }}
            >
              {tag.name}
            </span>
          ))}
          {(!tags || tags.length === 0) && <span className="text-xs text-gray-500">No tags</span>}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-1 text-sm uppercase tracking-wide text-gray-600">Members</h3>
        <div className="flex flex-wrap gap-2">
          {(members || []).map((member) => (
            <span key={member.id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
              {member.name || member.user?.name || member.user_id}
            </span>
          ))}
          {(!members || members.length === 0) && <span className="text-xs text-gray-500">No members</span>}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-600">Lists</h3>
        <div className="space-y-3">
          {lists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              boardId={boardId}
              members={members}
              tags={tags}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
