import type { CreateTaskInput, Task, TaskStatus } from "../types";
import { apiClient } from "./client";

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await apiClient.post<Task>("/tasks", input);
  return res.data;
}

export async function getAllTasks(): Promise<Task[]> {
  const res = await apiClient.get<Task[]>("/tasks");
  return res.data;
}

export async function getTaskById(id: number): Promise<Task> {
  const res = await apiClient.get<Task>(`/tasks/${id}`);
  return res.data;
}

export async function updateTaskStatus(
  id: number,
  status: TaskStatus,
): Promise<Task> {
  const res = await apiClient.patch<Task>(`/tasks/${id}/status`, { status });
  return res.data;
}

export async function assignTask(
  id: number,
  developerId: number,
): Promise<Task> {
  const res = await apiClient.patch<Task>(`/tasks/${id}/assign`, {
    developerId,
  });
  return res.data;
}
