import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import CardItem from './CardItem'

const API = `${import.meta.env.VITE_API_BASE ?? ''}/api/v1`

export default function ListColumn({ list, boardId, members, tags }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(list.title)
  const [listError, setListError] = useState('')
  const [moveTargets, setMoveTargets] = useState({}) // cardId -> { list_id, order }
  const [moving, setMoving] = useState({})

  const parentLists = useMemo(() => tags || [], [tags])

  const fetchCards = async () => {
    let cancelled = false
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`${API}/boards/${boardId}/lists/${list.id}/cards`)
      if (!cancelled) setCards(data.data ?? data)
    } catch (e) {
      if (!cancelled) setError(e.message)
    } finally {
      if (!cancelled) setLoading(false)
    }
  }

  useEffect(() => {
    fetchCards()
  }, [boardId, list.id])

  const handleAddCard = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSaving(true)
    setError('')
    try {
      const { data } = await axios.post(`${API}/boards/${boardId}/lists/${list.id}/cards`, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        due_date: newDueDate || null,
      })
      const created = data.data ?? data
      setCards((prev) => [...prev, created])
      setNewTitle('')
      setNewDescription('')
      setNewDueDate('')
      setShowAdd(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRename = async () => {
    if (!editTitle.trim()) return
    setListError('')
    try {
      const { data } = await axios.put(`${API}/boards/${boardId}/lists/${list.id}`, {
        title: editTitle.trim(),
      })
      const updated = data.data ?? data
      list.title = updated.title
      setEditing(false)
    } catch (e) {
      setListError(e.message)
    }
  }

  const handleDeleteList = async () => {
    if (!window.confirm('Delete this list and all its cards?')) return
    setListError('')
    try {
      await axios.delete(`${API}/boards/${boardId}/lists/${list.id}`)
      // notify parent to remove list? For now, we clear the column.
      setCards([])
    } catch (e) {
      setListError(e.message)
    }
  }

  const handleMove = async (cardId) => {
    const payload = moveTargets[cardId]
    if (!payload || !payload.list_id) return
    setMoving((prev) => ({ ...prev, [cardId]: true }))
    setError('')
    try {
      const { data } = await axios.put(
        `${API}/boards/${boardId}/lists/${list.id}/cards/${cardId}/move`,
        { list_id: Number(payload.list_id), order: Number(payload.order) || 0 }
      )
      const updated = data.data ?? data
      // If moved to another list, remove from here and let that column refresh itself.
      if (Number(updated.list_id) !== Number(list.id)) {
        setCards((prev) => prev.filter((c) => c.id !== cardId))
      } else {
        // update order locally
        setCards((prev) => prev.map((c) => (c.id === cardId ? updated : c)))
      }
      setMoveTargets((prev) => {
        const next = { ...prev }
        delete next[cardId]
        return next
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setMoving((prev) => {
        const next = { ...prev }
        delete next[cardId]
        return next
      })
    }
  }

  return (
    <div className="border rounded-md p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditing(false) }}
            />
            <button type="button" onClick={handleRename} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="px-2 py-1 bg-gray-200 rounded text-xs">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{list.title}</h4>
            <span className="text-xs text-gray-500">(#{list.order ?? ''})</span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-2">
          {!editing && (
            <>
              <button type="button" onClick={() => { setEditing(true); setEditTitle(list.title); setListError('') }} className="text-xs text-blue-600 hover:underline">Edit</button>
              <button type="button" onClick={handleDeleteList} className="text-xs text-red-600 hover:underline">Delete</button>
            </>
          )}
        </div>
      </div>

      {listError && <p className="mb-2 text-xs text-red-600">Error: {listError}</p>}

      {error && <p className="mb-2 text-xs text-red-600">Error: {error}</p>}

      <div className="space-y-2">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            boardId={boardId}
            listId={list.id}
            members={members}
            tags={tags}
            allLists={parentLists}
            onRefresh={fetchCards}
            moveTarget={moveTargets[card.id] || { list_id: '', order: '' }}
            onMoveChange={(val) => setMoveTargets((prev) => ({ ...prev, [card.id]: val }))}
            onMove={() => handleMove(card.id)}
            moving={!!moving[card.id]}
          />
        ))}
      </div>

      {!showAdd ? (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="mt-2 text-xs text-gray-600 hover:text-gray-900"
        >
          + Add Card
        </button>
      ) : (
        <form onSubmit={handleAddCard} className="mt-2 space-y-2 bg-white p-2 rounded border">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Card title"
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            required
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            rows={2}
          />
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Adding...' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1 bg-gray-200 rounded text-xs">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
