import type { Skill } from "../types";
import { apiClient } from "./client";

export async function getAllSkills(): Promise<Skill[]> {
  const res = await apiClient.get<Skill[]>("/skills");
  return res.data;
}