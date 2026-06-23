import { useState } from 'react'
import BoardList from './components/BoardList'
import BoardView from './components/BoardView'

function App() {
  const [selectedBoard, setSelectedBoard] = useState(null)

  return (
    <div className="min-h-screen bg-gray-100">
      {selectedBoard ? (
        <BoardView boardId={selectedBoard.id} onBack={() => setSelectedBoard(null)} />
      ) : (
        <BoardList onSelectBoard={setSelectedBoard} />
      )}
    </div>
  )
}

export default App
