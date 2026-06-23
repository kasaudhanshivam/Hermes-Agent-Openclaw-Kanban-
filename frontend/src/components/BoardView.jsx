import { useEffect, useState } from 'react'
import axios from 'axios'
import ListColumn from './ListColumn'

const API = `${import.meta.env.VITE_API_BASE ?? ''}/api/v1`

export default function BoardView({ boardId, onBack }) {
  const [board, setBoard] = useState(null)
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('');

  const [addingList, setAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [listSaving, setListSaving] = useState(false)
  const [listError, setListError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([
      axios.get(`${API}/boards/${boardId}`),
      axios.get(`${API}/boards/${boardId}/lists`),
    ])
      .then(([boardRes, listsRes]) => {
        if (cancelled) return
        setBoard(boardRes.data.data ?? boardRes.data)
        setLists(listsRes.data.data ?? listsRes.data)
      })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [boardId])

  const handleCreateList = async (e) => {
    e.preventDefault()
    if (!newListTitle.trim()) return
    setListSaving(true)
    setListError('')
    try {
      const { data } = await axios.post(`${API}/boards/${boardId}/lists`, { title: newListTitle.trim() })
      const created = data.data ?? data
      setLists((prev) => [...prev, created])
      setNewListTitle('')
      setAddingList(false)
    } catch (e) {
      setListError(e.message)
    } finally {
      setListSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-gray-600">Loading board...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-900">← Back</button>
        <div className="font-semibold text-slate-900 truncate">{board?.name}</div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full flex items-stretch gap-3">
          {lists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              boardId={boardId}
              members={members}
              tags={tags}
              allLists={lists}
            />
          ))}

          {!addingList ? (
            <button
              type="button"
              onClick={() => { setAddingList(true); setListError('') }}
              className="min-w-[270px] w-[270px] shrink-0 rounded-md border border-dashed border-slate-300 bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 px-3 py-3 text-sm flex items-center justify-center"
            >
              + Add List
            </button>
          ) : (
            <form onSubmit={handleCreateList} className="min-w-[270px] w-[270px] shrink-0 rounded-md bg-white border border-slate-200 p-3 flex flex-col gap-2">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="List title"
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                autoFocus
              />
              {listError && <p className="text-xs text-red-600">Error: {listError}</p>}
              <div className="flex items-center gap-2">
                <button type="submit" disabled={listSaving} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {listSaving ? 'Adding...' : 'Add'}
                </button>
                <button type="button" onClick={() => setAddingList(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
