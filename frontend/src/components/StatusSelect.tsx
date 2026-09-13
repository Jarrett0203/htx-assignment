import { Task, TASK_STATUSES, TaskStatus } from "../types";

interface StatusSelectProps {
  task: Task;
  onChange: (id: number, status: TaskStatus) => void;
}

const StatusSelect = ({ task, onChange }: StatusSelectProps) => {
  return (
    <select
      value={task.status}
      onChange={(e) => onChange(task.id, e.target.value as TaskStatus)}
      className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
    >
      {TASK_STATUSES.map((status) => (
        <option value={status} key={status}>
          {status}
        </option>
      ))}
    </select>
  );
};

export default StatusSelect;
