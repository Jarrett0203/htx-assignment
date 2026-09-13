export const TASK_STATUSES = ["TODO", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const MAX_SUBTASK_DEPTH = 3;

export interface Skill {
  id: number;
  name: string;
}

export interface Developer {
  id: number;
  name: string;
  skills: { skill: Skill }[];
}

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  developerId: number | null;
  developer: Developer | null;
  skills: { skill: Skill }[];
  subtasks: Task[];
}

export interface CreateTaskInput {
  title: string;
  skillIds: number[];
  subtasks?: CreateTaskInput[];
}

export interface TaskDraft {
  id: string;
  title: string;
  skillIds: number[];
  subtasks: TaskDraft[];
}

export function createEmptyDraft(): TaskDraft {
  return { id: crypto.randomUUID(), title: "", skillIds: [], subtasks: [] };
}

export function draftToInput(draft: TaskDraft): CreateTaskInput {
  return {
    title: draft.title,
    skillIds: draft.skillIds,
    subtasks: draft.subtasks.map((sub) => draftToInput(sub)),
  };
}