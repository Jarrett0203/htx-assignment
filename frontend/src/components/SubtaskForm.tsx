import {
  createEmptyDraft,
  MAX_SUBTASK_DEPTH,
  Skill,
  TaskDraft,
} from "../types";

interface SubTaskFormProps {
  draft: TaskDraft;
  skills: Skill[];
  depth: number;
  onChange: (updated: TaskDraft) => void;
  onRemove: () => void;
}

const SubtaskForm = ({
  draft,
  skills,
  depth,
  onChange,
  onRemove,
}: SubTaskFormProps) => {
  function toggleSkill(skillId: number) {
    const skillIds = draft.skillIds.includes(skillId)
      ? draft.skillIds.filter((id) => id !== skillId)
      : [...draft.skillIds, skillId];
    onChange({ ...draft, skillIds });
  }

  function addSubtask() {
    onChange({ ...draft, subtasks: [...draft.subtasks, createEmptyDraft()] });
  }

  function updateSubtask(index: number, updated: TaskDraft) {
    const subtasks = draft.subtasks.map((subtask, i) =>
      i === index ? updated : subtask,
    );
    onChange({ ...draft, subtasks });
  }

  function removeSubtask(index: number) {
    onChange({
      ...draft,
      subtasks: draft.subtasks.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="mt-3 rounded border border-slate-200 p-3 pl-4">
      <div className="flex items-center gap-2">
        <textarea
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          placeholder="Subtask title"
          className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
        />
        <button
          type="button"
          onClick={onRemove}
          className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
        >
          Remove
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        {skills.map((skill) => (
          <label
            key={skill.id}
            className="flex items-center gap-1 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={draft.skillIds.includes(skill.id)}
              onChange={() => toggleSkill(skill.id)}
            />
            {skill.name}
          </label>
        ))}
      </div>

      {draft.subtasks.map((sub, i) => (
        <SubtaskForm
          key={sub.id}
          draft={sub}
          skills={skills}
          depth={depth + 1}
          onChange={(updated) => updateSubtask(i, updated)}
          onRemove={() => removeSubtask(i)}
        />
      ))}

      {depth < MAX_SUBTASK_DEPTH && (
        <button
          type="button"
          onClick={addSubtask}
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
        >
          + Add subtask
        </button>
      )}
    </div>
  );
};

export default SubtaskForm;
