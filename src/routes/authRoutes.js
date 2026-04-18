import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  // - Validate input
  let { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }
  // - Check if user exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }
  // - Hash password
  password = await bcrypt.hash(password, 10);
  console.log(password)
  // - Save user
  user = new User({
    name, email, password
  });
  await user.save();
  // - Return user (without password)
  return res.status(201).json([{ message: "User created successfully" }, user.name, user.email, user.createdAt]);
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  // - Find user
  const { email, password } = req.body;
  const user = await User.findOne({ email })
  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }
  // - Compare password
  const isMatching = await bcrypt.compare(password, user.password)
  if (!isMatching) {
    return res.status(401).json({ message: "Invalid credentials" })
  }
  // - Generate JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" })
  // - Return token
  res.cookie(
    "token",
    token,
    {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    }
  )
  return res.status(200).json([{ message: "Login successful" }, user.name, user.email, token])
});

export default router;