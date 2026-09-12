import type { Developer } from "../types";
import { apiClient } from "./client";

export async function getAllDevelopers(): Promise<Developer[]> {
  const res = await apiClient.get<Developer[]>("/developers");
  return res.data;
}

export async function getDeveloperById(id: number): Promise<Developer> {
  const res = await apiClient.get<Developer>(`/developers/${id}`);
  return res.data;
}