import { useMemo, useState } from 'react'
import axios from 'axios'
import { moveCard } from '../api/cards'

const API = `${import.meta.env.VITE_API_BASE ?? ''}/api/v1`

export default function CardItem({
  card,
  boardId,
  listId,
  members = [],
  tags = [],
  allLists = [],
  onRefresh,
}) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(card.title)
  const [editDescription, setEditDescription] = useState(card.description || '')
  const [editDueDate, setEditDueDate] = useState(card.due_date || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [moving, setMoving] = useState(false)
  const [moveTarget, setMoveTarget] = useState('')
  const [moveError, setMoveError] = useState('')

  const isOverdue = useMemo(() => {
    if (!card.due_date) return false
    const due = new Date(card.due_date)
    return due < new Date()
  }, [card.due_date])

  const borderClass = isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await axios.put(`${API}/boards/${boardId}/lists/${listId}/cards/${card.id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        due_date: editDueDate || null,
      })
      setEditing(false)
      onRefresh?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this card?')) return
    setSaving(true)
    setError('')
    try {
      await axios.delete(`${API}/boards/${boardId}/lists/${listId}/cards/${card.id}`)
      onRefresh?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const validTargets = useMemo(
    () => (Array.isArray(allLists) ? allLists.filter((l) => l.id !== listId) : []),
    [allLists, listId]
  )

  const handleMove = async (e) => {
    e.preventDefault()
    if (!moveTarget) return
    setMoving(true)
    setMoveError('')
    try {
      await moveCard({
        boardId,
        listId,
        cardId: card.id,
        list_id: Number(moveTarget),
        order: 0,
      })
      onRefresh?.()
      setMoveTarget('')
    } catch (e) {
      setMoveError(e.message)
    } finally {
      setMoving(false)
    }
  }

  return (
    <div className={`border rounded p-2 ${borderClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h5 className="font-medium">{card.title}</h5>
          {card.description && <p className="text-sm text-gray-700 mt-1">{card.description}</p>}
          {card.due_date && (
            <p className={`text-xs mt-1 ${isOverdue ? 'text-red-700 font-medium' : 'text-gray-500'}`}>
              Due: {card.due_date}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing((v) => !v)
            if (!editing) {
              setEditTitle(card.title)
              setEditDescription(card.description || '')
              setEditDueDate(card.due_date || '')
              setError('')
            }
          }}
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          {editing ? 'Close' : 'Edit'}
        </button>
      </div>

      {error && !editing && <p className="mt-1 text-xs text-red-600">Error: {error}</p>}

      {!editing && validTargets.length > 0 && (
        <form onSubmit={handleMove} className="mt-2">
          <div className="flex items-center gap-2">
            <select
              value={moveTarget}
              onChange={(e) => setMoveTarget(e.target.value)}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="">Move to...</option>
              {validTargets.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={moving || !moveTarget}
              className="px-3 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-800 disabled:opacity-50"
            >
              {moving ? 'Moving...' : 'Move'}
            </button>
          </div>
          {moveError && <p className="mt-1 text-xs text-red-600">Error: {moveError}</p>}
        </form>
      )}

      {editing && (
        <form onSubmit={handleSave} className="mt-2 space-y-2 bg-white p-2 rounded border">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            required
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            rows={2}
          />
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
          {error && <p className="text-xs text-red-600">Error: {error}</p>}
          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={handleDelete} disabled={saving} className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50">
              Delete
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-3 py-1 bg-gray-200 rounded text-xs">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
