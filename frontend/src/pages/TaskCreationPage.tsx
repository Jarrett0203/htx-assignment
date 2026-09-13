import { SubmitEvent, useEffect, useState } from "react";
import {
  createEmptyDraft,
  CreateTaskInput,
  draftToInput,
  Skill,
  TaskDraft,
} from "../types";
import { useNavigate } from "react-router-dom";
import { getAllSkills } from "../api/skills";
import { createTask } from "../api/tasks";
import SubtaskForm from "../components/SubtaskForm";
import { ClipLoader } from "react-spinners";

const TaskCreationPage = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [selectedSkillIds, setSelectedSkills] = useState<number[]>([]);
  const [taskTitleError, setTaskTitleError] = useState<string>("");
  const [subtasks, setSubtasks] = useState<TaskDraft[]>([]);
  const [formError, setFormError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSkills() {
      try {
        const skillData = await getAllSkills();
        setSkills(skillData);
      } catch (error) {
        console.error(error);
        setError("Failed to load skills. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, []);

  function validateTitle() {
    if (taskTitle?.trim().length === 0) {
      setTaskTitleError(`Title cannot be empty!`);
      return false;
    }
    return true;
  }

  function toggleSkill(skillId: number) {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  }

  async function submitNewTask(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateTitle()) {
      return;
    }

    setTaskTitleError("");
    setFormError("");
    setIsSubmitting(true);

    const input: CreateTaskInput = {
      title: taskTitle,
      skillIds: selectedSkillIds,
      subtasks: subtasks.map((subtask) => draftToInput(subtask)),
    };

    try {
      await createTask(input);
      navigate("/");
    } catch (error) {
      console.error(error);
      setFormError("Failed to create task, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <p className="py-8 text-center text-slate-400">Loading...</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Create Task</h1>

      <form
        onSubmit={(e) => submitNewTask(e)}
        className="max-w-lg rounded-lg border border-slate-200 bg-white p-6"
      >
        <div>
          <label
            htmlFor="taskTitle"
            className="block text-sm font-medium text-slate-700"
          >
            Task Title
          </label>
          <textarea
            id="taskTitle"
            onChange={(e) => setTaskTitle(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
          />
          {taskTitleError !== "" && (
            <p className="mt-1 text-sm text-red-500">{taskTitleError}</p>
          )}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-slate-700">
            Required Skills
          </legend>
          <div className="mt-2 flex flex-col gap-2">
            {skills.map((skill) => (
              <label
                key={skill.id}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selectedSkillIds.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                />
                {skill.name}
              </label>
            ))}
          </div>
        </fieldset>

        {subtasks.map((subtask, i) => (
          <SubtaskForm
            key={subtask.id}
            draft={subtask}
            skills={skills}
            depth={2}
            onChange={(updated) =>
              setSubtasks((prev) =>
                prev.map((s, idx) => (idx === i ? updated : s)),
              )
            }
            onRemove={() =>
              setSubtasks((prev) => prev.filter((_, idx) => idx !== i))
            }
          />
        ))}

        <div className="flex gap-3">
          <button
            type="button"
            className="mt-6 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
            onClick={() => setSubtasks((prev) => [...prev, createEmptyDraft()])}
          >
            + Add subtask
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <ClipLoader size={14} color="#ffffff" />}
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
        {formError && <p className="mt-2 text-sm text-red-500">{formError}</p>}
      </form>
    </div>
  );
};

export default TaskCreationPage;
