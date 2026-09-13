import { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import { TaskStatus } from "../generated/prisma/enums.ts";
import { identifySkillNames } from "../services/skillIdentifier.ts";
import { getSkillIdByName } from "../lib/skillCache.ts";

interface CreateTaskInput {
  title: string;
  skillIds: number[];
  subtasks?: CreateTaskInput[];
}

interface TaskCreateData {
  title: string;
  skills: {
    create: { skill: { connect: { id: number } } }[];
  };
  subtasks: {
    create: TaskCreateData[];
  };
}

function buildTaskCreateData(input: CreateTaskInput): TaskCreateData {
  return {
    title: input.title,
    skills: {
      create: input.skillIds.map((skillId) => ({
        skill: { connect: { id: skillId } },
      })),
    },
    subtasks: {
      create: (input.subtasks ?? []).map((subtask) =>
        buildTaskCreateData(subtask),
      ),
    },
  };
}

function isValidCreateTaskInput(body: unknown): body is CreateTaskInput {
  if (typeof body !== "object" || body === null) return false;

  const bodyRecord = body as Record<string, unknown>;
  const hasValidTitle =
    typeof bodyRecord.title === "string" && bodyRecord.title.trim().length > 0;
  const hasValidSkillIds =
    Array.isArray(bodyRecord.skillIds) &&
    bodyRecord.skillIds.every((skillId) => typeof skillId === "number");

  if (!hasValidTitle || !hasValidSkillIds) return false;

  if (bodyRecord.subtasks !== undefined) {
    if (!Array.isArray(bodyRecord.subtasks)) return false;
    return bodyRecord.subtasks.every((subtask) =>
      isValidCreateTaskInput(subtask),
    );
  }

  return true;
}

function collectAllSkillIds(input: CreateTaskInput): number[] {
  return [
    ...input.skillIds,
    ...(input.subtasks ?? []).flatMap((sub) => collectAllSkillIds(sub)),
  ];
}

async function resolveSkillIds(input: CreateTaskInput): Promise<CreateTaskInput> {
  let skillIds = input.skillIds;

  if (skillIds.length === 0) {
    const skillNames = await identifySkillNames(input.title);
    skillIds = skillNames.map((name) => getSkillIdByName(name)).filter((id): id is number => id !== undefined);
  }

  const resolvedSubtasks = await Promise.all(
    (input.subtasks ?? []).map((subtask) => resolveSkillIds(subtask))
  );

  return {...input, skillIds, subtasks: resolvedSubtasks};
}

export async function createTask(req: Request, res: Response) {
  if (!isValidCreateTaskInput(req.body)) {
    return res
      .status(400)
      .json({
        error: "Invalid task data: check title, skillIds, and any subtasks",
      });
  }

  const resolvedInput = await resolveSkillIds(req.body);

  const allSkillIds = [...new Set(collectAllSkillIds(resolvedInput))];
  const existingSkills = await prisma.skill.findMany({ where: { id: { in: allSkillIds } } });

  if (existingSkills.length !== allSkillIds.length) {
    const existingIds = new Set(existingSkills.map((s) => s.id));
    const missingIds = allSkillIds.filter((id) => !existingIds.has(id));
    return res.status(400).json({ error: `Skill id(s) not found: ${missingIds.join(", ")}` });
  }

  const task = await prisma.task.create({
    data: buildTaskCreateData(resolvedInput),
    include: { skills: { include: { skill: true } }, subtasks: true },
  });

  res.status(201).json(task);
}

export async function getAllTasks(req: Request, res: Response) {
  const tasks = await prisma.task.findMany({
    include: {
      skills: { include: { skill: true } },
      developer: true,
      subtasks: true,
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
      subtasks: true,
    },
  });

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
}

function isValidTaskStatus(status: string): status is TaskStatus {
  return Object.values(TaskStatus).includes(status as TaskStatus);
}

export async function updateTaskStatus(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!isValidTaskStatus) {
    return res.status(400).json({
      error: `Task status must be one of: ${Object.values(TaskStatus).join(", ")}`,
    });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      subtasks: true,
    },
  });

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (status === "DONE") {
    const allSubtasksDone = task.subtasks.every(
      (subtask) => subtask.status === "DONE",
    );
    if (!allSubtasksDone) {
      return res.status(400).json({
        error: "Cannot mark task as Done while subtasks are not Done",
      });
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status: status as TaskStatus },
    include: {
      skills: { include: { skill: true } },
      developer: true,
      subtasks: true,
    },
  });

  res.json(updatedTask);
}

export async function assignTask(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { developerId } = req.body;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
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
    include: {
      skills: { include: { skill: true } },
      developer: true,
      subtasks: true,
    },
  });

  res.json(updatedTask);
}
