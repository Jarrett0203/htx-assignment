import { Link, Route, Routes } from "react-router-dom";
import TaskListPage from "./pages/TaskListPage";
import TaskCreationPage from "./pages/TaskCreationPage";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Task List
          </Link>
          <Link
            to="/create"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Create Task
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl md:px-6 py-8">
        <Routes>
          <Route path="/" element={<TaskListPage />} />
          <Route path="/create" element={<TaskCreationPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
