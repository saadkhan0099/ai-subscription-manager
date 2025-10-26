import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default function userRoutes(db) {
  const router = express.Router();

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  const SECRET = process.env.JWT_SECRET;

  // Signup
  router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    try {
      // Check for existing user
      const existingUser = await db.get(
        "SELECT * FROM users WHERE email = ?",
        email
      );
      if (existingUser)
        return res.status(400).json({ error: "Email already registered" });

      const hashed = await bcrypt.hash(password, 10);
      const result = await db.run(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        email,
        hashed
      );

      res.status(201).json({ user_id: result.lastID, email });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Login
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    try {
      const user = await db.get("SELECT * FROM users WHERE email = ?", email);
      if (!user) return res.status(404).json({ error: "User not found" });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: "Incorrect password" });

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  return router;
}
