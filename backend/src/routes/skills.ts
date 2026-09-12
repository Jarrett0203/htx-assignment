import { Router } from "express";
import { getAllSkills, getSkillById } from "../controllers/skills.ts";

const router = Router();

router.get("/", getAllSkills);
router.get("/:id", getSkillById);

export default router;
