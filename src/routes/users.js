// backend/src/routes/users.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default function userRoutes(db) {
  const router = express.Router();

  const SECRET = process.env.JWT_SECRET;
  if (!SECRET) {
    // For safety, log here but do not throw — allow app to start and respond with 500 from handlers if needed.
    console.warn(
      "⚠️ JWT_SECRET is not defined. Login/signup will fail until it's set."
    );
  }

  // Basic helper to sign token
  function signToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");
    // 1 hour default; consider env override
    return jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
  }

  // Signup - returns token so user is logged in immediately
  router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    try {
      // Check for existing user
      const existingUser = await db.get(
        "SELECT id FROM users WHERE email = ?",
        email
      );
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashed = await bcrypt.hash(password, 10);
      const result = await db.run(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        email,
        hashed
      );

      const userId = result.lastID;
      // sign token
      let token;
      try {
        token = signToken({ id: userId, email });
      } catch (err) {
        console.error("JWT sign error:", err);
        // token signing failed — return created user info but ask client to login
        return res
          .status(201)
          .json({
            user_id: userId,
            email,
            warning: "User created; token not issued (server misconfigured)",
          });
      }

      // return token and basic user info
      return res.status(201).json({ token, user: { id: userId, email } });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Login - returns token
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    try {
      const user = await db.get(
        "SELECT id, email, password_hash FROM users WHERE email = ?",
        email
      );
      if (!user) return res.status(404).json({ error: "User not found" });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: "Incorrect password" });

      // sign token
      let token;
      try {
        token = signToken({ id: user.id, email: user.email });
      } catch (err) {
        console.error("JWT sign error:", err);
        return res.status(500).json({ error: "Server token error" });
      }

      return res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Failed to login" });
    }
  });

  return router;
}
