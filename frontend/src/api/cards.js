import axios from 'axios'

const API = `${import.meta.env.VITE_API_BASE ?? ''}/api/v1`

export async function moveCard({ boardId, listId, cardId, list_id, order }) {
  const { data } = await axios.put(
    `${API}/boards/${boardId}/lists/${listId}/cards/${cardId}/move`,
    { list_id, order }
  )
  return data.data ?? data
}
