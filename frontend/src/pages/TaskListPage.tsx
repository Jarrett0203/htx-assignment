import { useEffect, useState } from "react";
import { Developer, Task, TaskStatus } from "../types";
import { assignTask, getAllTasks, updateTaskStatus } from "../api/tasks";
import { getAllDevelopers } from "../api/developers";
import SkillPills from "../components/SkillPills";
import StatusSelect from "../components/StatusSelect";
import AssigneeSelect from "../components/AssigneeSelect";

const TaskListPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [taskData, developerData] = await Promise.all([
          getAllTasks(),
          getAllDevelopers(),
        ]);
        setTasks(taskData);
        setDevelopers(developerData);
      } catch (error) {
        console.error(error);
        setError(
          "Failed to load tasks. Please check your connection and try again.",
        );
      }
      setLoading(false);
    }
    loadData();
  }, []);

  function qualifyingDevelopers(task: Task): Developer[] {
    const requiredSkillIds = task.skills.map((taskSkill) => taskSkill.skill.id);
    return developers.filter((dev) => {
      const devSkillIds = new Set(
        dev.skills.map((devSkill) => devSkill.skill.id),
      );
      return requiredSkillIds.every((id) => devSkillIds.has(id));
    });
  }

  async function handleStatusChange(taskId: number, status: TaskStatus) {
    const updated = await updateTaskStatus(taskId, status);
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? updated : task)),
    );
  }

  async function handleAssign(taskId: number, developerId: number) {
    const updated = await assignTask(taskId, developerId);
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? updated : task)),
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Task List</h1>

      {loading ? (
        <p className="py-8 text-center text-slate-400">Loading...</p>
      ) : error ? (
        <p className="py-8 text-center text-red-500">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="py-8 text-center text-slate-400">No tasks currently.</p>
      ) : (
        <>
          {/* Mobile: stacked cards, hidden at md and above */}
          <div className="flex flex-col gap-3 md:hidden">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <h2 className="font-medium text-slate-900">{task.title}</h2>
                <div className="mt-2">
                  <SkillPills skills={task.skills} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500">
                      Status
                    </label>
                    <div className="mt-1">
                      <StatusSelect task={task} onChange={handleStatusChange} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500">
                      Assignee
                    </label>
                    <div className="mt-1">
                      <AssigneeSelect
                        task={task}
                        developers={qualifyingDevelopers(task)}
                        onChange={handleAssign}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table, hidden below md */}
          <table className="hidden w-full table-fixed border-collapse overflow-hidden rounded-lg border border-slate-200 bg-white text-sm md:table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <th className="w-2/5 px-4 py-3 font-medium">Task Title</th>
                <th className="w-1/4 px-4 py-3 font-medium">Skills</th>
                <th className="w-[15%] px-4 py-3 font-medium">Status</th>
                <th className="w-[20%] px-4 py-3 font-medium">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="wrap-break-word px-4 py-3 text-slate-800">{task.title}</td>
                  <td className="px-4 py-3">
                    <SkillPills skills={task.skills} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect task={task} onChange={handleStatusChange} />
                  </td>
                  <td className="px-4 py-3">
                    <AssigneeSelect
                      task={task}
                      developers={qualifyingDevelopers(task)}
                      onChange={handleAssign}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default TaskListPage;
