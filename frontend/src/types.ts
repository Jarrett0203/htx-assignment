export const TASK_STATUSES = ["TODO", "DONE", "CLOSED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

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
}