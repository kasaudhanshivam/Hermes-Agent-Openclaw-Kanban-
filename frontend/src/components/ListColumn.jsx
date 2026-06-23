import { useEffect, useState } from 'react';
import axios from 'axios';
import CardItem from './CardItem.jsx';

const API = `${import.meta.env.VITE_API_BASE ?? ''}/api/v1`;

export default function ListColumn({ list, boardId, members, tags, allLists }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [listError, setListError] = useState('');

  const fetchCards = async () => {
    let cancelled = false;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${API}/boards/${boardId}/lists/${list.id}/cards`);
      if (!cancelled) setCards(data.data ?? data);
    } catch (e) {
      if (!cancelled) setError(e.message);
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [boardId, list.id]);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await axios.post(`${API}/boards/${boardId}/lists/${list.id}/cards`, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        due_date: newDueDate || null,
      });
      const created = data.data ?? data;
      setCards((prev) => [...prev, created]);
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      setShowAdd(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async () => {
    if (!editTitle.trim()) return;
    setListError('');
    try {
      const { data } = await axios.put(`${API}/boards/${boardId}/lists/${list.id}`, { title: editTitle.trim() });
      const updated = data.data ?? data;
      list.title = updated.title;
      setEditing(false);
    } catch (e) {
      setListError(e.message);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Delete this list and all its cards?')) return;
    setListError('');
    try {
      await axios.delete(`${API}/boards/${boardId}/lists/${list.id}`);
    } catch (e) {
      setListError(e.message);
    }
  };

  return (
    <div className="min-w-[270px] w-[270px] shrink-0 rounded-md bg-slate-50 border border-slate-200 flex flex-col max-h-full">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setEditing(false);
              }}
            />
            <button type="button" onClick={handleRename} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="px-2 py-1 bg-slate-200 rounded text-xs">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900">{list.title}</h4>
            <span className="text-xs text-slate-500">({list.order ?? 0})</span>
          </div>
        )}
        {!editing && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { setEditing(true); setEditTitle(list.title); setListError(''); }} className="text-xs text-slate-500 hover:text-slate-900">Edit</button>
            <button type="button" onClick={handleDeleteList} className="text-xs text-red-600 hover:text-red-800">Delete</button>
          </div>
        )}
      </div>

      {listError && <p className="px-3 mb-2 text-xs text-red-600">Error: {listError}</p>}
      {error && <p className="px-3 mb-2 text-xs text-red-600">Error: {error}</p>}

      <div className="px-3 space-y-2 overflow-y-auto flex-1 pb-2">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            boardId={boardId}
            listId={list.id}
            members={members}
            tags={tags}
            allLists={allLists}
            onRefresh={fetchCards}
          />
        ))}
      </div>

      <div className="px-3 pb-3 pt-1">
        {!showAdd ? (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="text-xs text-slate-600 hover:text-slate-900 w-full text-left py-1.5 px-2 rounded hover:bg-white/60"
          >
            + Add Card
          </button>
        ) : (
          <form onSubmit={handleAddCard} className="space-y-2 bg-white p-2 rounded border border-slate-200">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Card title"
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              required
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              rows={2}
            />
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <div className="flex items-center gap-2">
              <button type="submit" disabled={saving} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Adding...' : 'Add'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs hover:bg-slate-200">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
