import React from "react";
import { Developer, Task } from "../types";

interface AssigneeSelectProps {
  task: Task;
  developers: Developer[];
  onChange: (taskId: number, developerId: number) => void;
}

const AssigneeSelect = ({task, developers, onChange}: AssigneeSelectProps) => {
  return (
    <select
      value={task.developerId ?? ""}
      onChange={(e) => onChange(task.id, Number(e.target.value))}
      className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
    >
      <option value="" disabled>
        Unassigned
      </option>
      {developers.map((dev) => (
        <option key={dev.id} value={dev.id}>
          {dev.name}
        </option>
      ))}
    </select>
  );
};

export default AssigneeSelect;
