import { useEffect, useState } from "react";
import { Developer, Task, TASK_STATUSES, TaskStatus } from "../types";
import { assignTask, getAllTasks, updateTaskStatus } from "../api/tasks";
import { getAllDevelopers } from "../api/developers";

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
    const requiredSkillIds = task.skills.map((skill) => skill.skill.id);
    return developers.filter((dev) => {
      const devSkillIds = new Set(dev.skills.map((skill) => skill.skill.id));
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
      <h1>Task List</h1>
      <table>
        <thead>
          <tr>
            <th>Task Title</th>
            <th>Skills</th>
            <th>Status</th>
            <th>Assignee</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4}>Loading...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={4}>{error}</td>
            </tr>
          ) : tasks.length === 0 ? (
            <tr>
              <td colSpan={4}>No tasks currently.</td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>
                  {task.skills.map((skill) => skill.skill.name).join(", ")}
                </td>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value as TaskStatus)
                    }
                  >
                    {TASK_STATUSES.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={task.developerId ?? ""}
                    onChange={(e) =>
                      handleAssign(task.id, Number(e.target.value))
                    }
                  >
                    <option value="" disabled>
                      Unassigned
                    </option>
                    {qualifyingDevelopers(task).map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListPage;
