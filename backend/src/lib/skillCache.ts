import { prisma } from "./prisma.ts";

let skills: { id: number; name: string }[] = [];

export async function loadSkillCache(): Promise<void> {
  skills = await prisma.skill.findMany();
}

export function getSkillNames(): string[] {
  return skills.map((s) => s.name);
}

export function getSkillIdByName(name: string): number | undefined {
  return skills.find((s) => s.name === name)?.id;
}