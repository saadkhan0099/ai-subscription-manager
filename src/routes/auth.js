// backend/src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import dbPromise from "../db/sqlite.js";

const router = express.Router();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

/** Helper to sign JWT tokens */
function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });
}

// --- SIGNUP ---
router.post(
  "/signup",
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    // Normalize email
    const rawEmail = req.body.email || "";
    const email = rawEmail.trim().toLowerCase();
    const password = req.body.password;

    try {
      const db = await dbPromise;

      // Check existing user
      const existingUser = await db.get(
        "SELECT id FROM users WHERE email = ?",
        email
      );
      if (existingUser)
        return res.status(400).json({ error: "Email already registered" });

      // Hash password
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      // Insert user
      let result;
      try {
        result = await db.run(
          "INSERT INTO users (email, password_hash) VALUES (?, ?)",
          email,
          password_hash
        );
      } catch (dbErr) {
        // handle unique constraint / race conditions more gracefully
        const msg = String(dbErr?.message || "").toLowerCase();
        if (msg.includes("unique") || msg.includes("constraint")) {
          return res.status(400).json({ error: "Email already registered" });
        }
        console.error("DB insert error on signup:", dbErr);
        throw dbErr;
      }

      const userId = result.lastID;
      const token = signToken({ id: userId, email });

      return res.status(201).json({ token, user: { id: userId, email } });
    } catch (err) {
      console.error("Signup error:", err);
      if (err.message === "JWT_SECRET not configured") {
        return res.status(500).json({ error: "Server configuration error" });
      }
      return res.status(500).json({ error: "Failed to create user" });
    }
  }
);

// --- LOGIN ---
router.post(
  "/login",
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const rawEmail = req.body.email || "";
    const email = rawEmail.trim().toLowerCase();
    const password = req.body.password;

    try {
      const db = await dbPromise;
      const user = await db.get(
        "SELECT id, email, password_hash FROM users WHERE email = ?",
        email
      );
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: "Invalid credentials" });

      const token = signToken({ id: user.id, email: user.email });
      return res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
      console.error("Login error:", err);
      if (err.message === "JWT_SECRET not configured") {
        return res.status(500).json({ error: "Server configuration error" });
      }
      return res.status(500).json({ error: "Failed to login" });
    }
  }
);

export default router;
