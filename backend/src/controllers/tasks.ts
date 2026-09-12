import { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import { TaskStatus } from "../generated/prisma/enums.ts";

function isValidCreateTaskInput(
  body: Record<string, unknown>,
): body is { title: string; skillIds: number[] } {
  return (
    body === null ||
    typeof body.title !== "string" ||
    body.title.trim().length === 0 ||
    !Array.isArray(body.skillIds) ||
    body.skillIds.length === 0 ||
    body.skillIds.some((s) => typeof s !== "number")
  );
}

export async function createTask(req: Request, res: Response) {
  const { title, skillIds } = req.body;

  if (!isValidCreateTaskInput) {
    return res.status(400).json({ error: "title (string) and skillIds (non-empty number[]) are required"})
  }

  const existingSkills = await prisma.skill.findMany({
    where: { id: { in: skillIds }}
  });

  if (existingSkills.length !== skillIds.length) {
    const existingIds = new Set(existingSkills.map((s) => s.id));
    const missingIds = skillIds.filter((id: number) => !existingIds.has(id));
    return res.status(400).json({ error: `Skill id(s) not found: ${missingIds.join(", ")}`});
  }

  const task = await prisma.task.create({
    data: {
      title,
      skills: {
        create: skillIds.map((skillId: number) => ({
          skill: { connect: { id: skillId } },
        })),
      },
    },
    include: {
      skills: { include: { skill: true } },
    },
  });

  res.status(201).json(task);
}

export async function getAllTasks(req: Request, res: Response) {
  const tasks = await prisma.task.findMany({
    include: {
      skills: { include: { skill: true } },
      developer: true,
    },
  });
  res.json(tasks);
}

export async function getTaskById(req: Request, res: Response) {
  const id = Number(req.params.id);

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
      developer: true,
    },
  });

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
}

function isValidTask(status: string): status is TaskStatus {
  return Object.values(TaskStatus).includes(status as TaskStatus);
}

export async function updateTaskStatus(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!isValidTask) {
    return res.status(400).json({
      error: `Task status must be one of: ${Object.values(TaskStatus).join(", ")}`,
    });
  }

  const task = await prisma.task.update({
    where: { id },
    data: { status: status as TaskStatus },
    include: {
      skills: { include: { skill: true } },
      developer: true,
    },
  });

  res.json(task);
}

export async function assignTask(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { developerId } = req.body;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
      developer: true,
    },
  });

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const developer = await prisma.developer.findUnique({
    where: { id: developerId },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!developer) {
    return res.status(404).json({ error: "Developer not found" });
  }

  const requiredSkillIds = task.skills.map((ts) => ts.skillId);
  const developerSkillIdSet = new Set(developer.skills.map((ds) => ds.skillId));

  const hasAllRequiredSkills = requiredSkillIds.every((skillId) =>
    developerSkillIdSet.has(skillId),
  );

  if (!hasAllRequiredSkills) {
    return res.status(400).json({
      error: `Developer ${developer.name} does not have required skills`,
    });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { developerId },
  });

  res.json(updatedTask);
}
