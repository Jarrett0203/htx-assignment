import { Link, Route, Routes } from 'react-router-dom'
import TaskListPage from './pages/TaskListPage'
import TaskCreationPage from './pages/TaskCreationPage'

function App() {
  return (
    <>
      <nav>
        <Link to="/">Task List</Link>
        <Link to="/create">Create Task</Link>
      </nav>
      <Routes>
        <Route path='/' element={<TaskListPage/>}/>
        <Route path='/create' element={<TaskCreationPage/>}/>
      </Routes>
    </>
  )
}

export default App
