import { Developer, MAX_SUBTASK_DEPTH, Task, TaskStatus } from "../types";
import AssigneeSelect from "./AssigneeSelect";
import SkillPills from "./SkillPills";
import StatusSelect from "./StatusSelect";

interface SubtaskListProps {
  tasks: Task[];
  developers: Developer[];
  onStatusChange: (id: number, status: TaskStatus) => void;
  onAssign: (taskId: number, developerId: number) => void;
  depth?: number;
}

const SubtaskList = ({
  tasks,
  developers,
  onStatusChange,
  onAssign,
  depth = 1,
}: SubtaskListProps) => {
  console.log(tasks);
  if (!tasks || tasks.length === 0 || depth > MAX_SUBTASK_DEPTH) {
    return null;
  }
  return (
    <div className="mt-2 flex flex-col gap-2" style={{ marginLeft: depth * 2 }}>
      {tasks.map((task) => {
        const qualifying = developers.filter((dev) => {
          const devSkillIds = new Set(dev.skills.map((s) => s.skill.id));
          return task.skills.every((s) => devSkillIds.has(s.skill.id));
        });

        return (
          <div
            key={task.id}
            className="rounded border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-800">{task.title}</span>
            </div>
            <div className="mt-2">
              <SkillPills skills={task.skills} />
            </div>
            <div className="flex gap-2 md:gap-6 md:w-80 ml-auto mt-2 md:mt-0">
              <div className="md:w-44">
                <label className="block text-xs text-slate-500">Status</label>
                <StatusSelect task={task} onChange={onStatusChange} />
              </div>
              <div className="md:w-48">
                <label className="block text-xs text-slate-500">Assignee</label>
                <AssigneeSelect
                  task={task}
                  developers={qualifying}
                  onChange={onAssign}
                />
              </div>
            </div>
            <SubtaskList
              tasks={task.subtasks}
              developers={developers}
              onStatusChange={onStatusChange}
              onAssign={onAssign}
              depth={depth + 1}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SubtaskList;
