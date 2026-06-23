import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API = `${import.meta.env.VITE_API_BASE ?? ''}/api/v1`

export default function CardItem({
  card,
  boardId,
  listId,
  members = [],
  tags = [],
  allLists = [],
  onRefresh,
  moveTarget = { list_id: '', order: '' },
  onMoveChange,
  onMove,
  moving = false,
}) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(card.title)
  const [editDescription, setEditDescription] = useState(card.description || '')
  const [editDueDate, setEditDueDate] = useState(card.due_date || '')
  const [localMembers, setLocalMembers] = useState(card.members || [])
  const [localTags, setLocalTags] = useState(card.tags || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLocalMembers(card.members || [])
    setLocalTags(card.tags || [])
  }, [card.members, card.tags])

  const refreshCard = async () => {
    try {
      const { data } = await axios.get(`${API}/boards/${boardId}/cards/${card.id}`)
      const updated = data.data ?? data
      setLocalMembers(updated.members || [])
      setLocalTags(updated.tags || [])
      // update basic fields
      onRefresh?.()
    } catch {
      // ignore
    }
  }

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
      const { data } = await axios.put(`${API}/boards/${boardId}/lists/${listId}/cards/${card.id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        due_date: editDueDate || null,
      })
      const updated = data.data ?? data
      // update parent state via onRefresh; also update local fields
      Object.assign(card, updated)
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

  const handleAssign = async (memberId) => {
    setSaving(true)
    setError('')
    try {
      await axios.put(`${API}/boards/${boardId}/cards/${card.id}/assign`, { member_id: Number(memberId) })
      await refreshCard()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUnassign = async (memberId) => {
    setSaving(true)
    setError('')
    try {
      await axios.delete(`${API}/boards/${boardId}/cards/${card.id}/assign`, { data: { member_id: Number(memberId) } })
      await refreshCard()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAttachTag = async (tagId) => {
    setSaving(true)
    setError('')
    try {
      await axios.post(`${API}/boards/${boardId}/cards/${card.id}/tags/${tagId}`)
      await refreshCard()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDetachTag = async (tagId) => {
    setSaving(true)
    setError('')
    try {
      await axios.delete(`${API}/boards/${boardId}/cards/${card.id}/tags/${tagId}`)
      await refreshCard()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
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

      {(localTags || []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {localTags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: tag.color || '#dbeafe',
                color: tag.color ? '#1f2937' : '#1e40af',
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleDetachTag(tag.id)}
                className="ml-1 text-gray-800 hover:text-red-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {(localMembers || []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {localMembers.map((m) => (
            <span key={m.id} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs flex items-center gap-1">
              {m.name || m.user?.name || m.user_id}
              <button
                type="button"
                onClick={() => handleUnassign(m.id)}
                className="text-green-900 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {!editing && (
        <div className="mt-2 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value=""
              onChange={(e) => { if (e.target.value) handleAssign(e.target.value) }}
              disabled={saving}
              className="rounded border border-gray-300 px-2 py-1 text-xs"
              defaultValue=""
            >
              <option value="" disabled>Assign member...</option>
              {members
                .filter((m) => !(localMembers || []).some((lm) => lm.id === m.id))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.user?.name || m.user_id}
                  </option>
                ))}
            </select>

            <select
              value=""
              onChange={(e) => { if (e.target.value) handleAttachTag(e.target.value) }}
              disabled={saving}
              className="rounded border border-gray-300 px-2 py-1 text-xs"
              defaultValue=""
            >
              <option value="" disabled>Attach tag...</option>
              {tags
                .filter((t) => !(localTags || []).some((lt) => lt.id === t.id))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>

            {(allLists && allLists.length > 1) && (
              <div className="flex items-center gap-1">
                <select
                  value={moveTarget.list_id}
                  onChange={(e) => onMoveChange({ list_id: e.target.value, order: moveTarget.order })}
                  className="rounded border border-gray-300 px-2 py-1 text-xs"
                >
                  <option value="">Move to...</option>
                  {allLists
                    .filter((l) => String(l.id) !== String(listId))
                    .map((l) => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                </select>
                <input
                  type="number"
                  value={moveTarget.order}
                  onChange={(e) => onMoveChange({ list_id: moveTarget.list_id, order: e.target.value })}
                  placeholder="Order"
                  className="rounded border border-gray-300 px-2 py-1 text-xs w-16"
                />
                <button
                  type="button"
                  onClick={onMove}
                  disabled={moving || !moveTarget.list_id}
                  className="px-2 py-1 bg-gray-800 text-white rounded text-xs disabled:opacity-50"
                >
                  {moving ? 'Moving...' : 'Move'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && !editing && <p className="mt-1 text-xs text-red-600">Error: {error}</p>}

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
