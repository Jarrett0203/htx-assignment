import { Router } from "express";
import { assignTask, createTask, getAllTasks, getTaskById, updateTaskStatus } from "../controllers/tasks.ts";

const router = Router();

router.post("/", createTask);
router.get("/:id", getTaskById);
router.get("/", getAllTasks);
router.patch("/:id/status", updateTaskStatus);
router.patch("/:id/assign", assignTask);

export default router;