import { Router } from "express";
import developersRouter from "./developers.ts";
import tasksRouter from "./tasks.ts";
import skillsRouter from "./skills.ts";

const router = Router();

router.use("/developers", developersRouter);
router.use("/tasks", tasksRouter);
router.use("/skills", skillsRouter);

export default router;