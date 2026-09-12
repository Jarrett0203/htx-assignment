import { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";

export async function getAllSkills(req: Request, res: Response) {
  const skills = await prisma.skill.findMany();
  res.json(skills);
}

export async function getSkillById(req: Request, res: Response) {
  const id = Number(req.params.id);

  const skill = await prisma.skill.findUnique({
    where: { id }
  });

  if (!skill) {
    return res.status(404).json({ error: "Skill not found "});
  }

  res.json(skill);
}
