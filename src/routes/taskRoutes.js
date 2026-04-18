import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// POST /api/tasks
router.post("/", async (req, res) => {
  // - Create task
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    completed: req.body.completed,
    owner: req.user._id,
  });
  await task.save();
  // - Attach owner = req.user._id
  return res.status(201).json(task);
});

// GET /api/tasks
router.get("/", async (req, res) => {
  // - Return only tasks belonging to req.user
  const tasks = await Task.find({ owner: req.user._id });
  return res.status(200).json(tasks);
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  // - Check ownership
  // - Delete task
  const task = await Task.findByIdAndDelete(req.params.id);
  return res.status(200).json([{ "message": "Task deleted successfully" }, task]);
});

export default router;