import { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";

export async function getAllDevelopers(req: Request, res: Response) {
  const developers = await prisma.developer.findMany({
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });
  res.json(developers);
}

export async function getDeveloperById(req: Request, res: Response) {
  const id = Number(req.params.id);

  const developer = await prisma.developer.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!developer) {
    return res.status(404).json({ error: "Developer not found" });
  }

  res.json(developer);
}
