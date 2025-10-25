// backend/src/routes/subscriptions.js
import express from "express";

export default function subscriptionRoutes(db) {
  const router = express.Router();

  // List all subscriptions
  router.get("/", (req, res) => {
    const rows = db
      .prepare("SELECT * FROM subscriptions ORDER BY created_at DESC")
      .all();
    res.json({ subscriptions: rows });
  });

  // Create subscription
  router.post("/", (req, res) => {
    const { vendor, amount } = req.body;

    if (!vendor || !amount) {
      return res.status(400).json({ error: "vendor and amount are required" });
    }

    const stmt = db.prepare(
      "INSERT INTO subscriptions (name, amount, status) VALUES (?,?,?)"
    );
    const info = stmt.run(vendor, amount, "active");

    const created = db
      .prepare("SELECT * FROM subscriptions WHERE id = ?")
      .get(info.lastInsertRowid);
    res.json({ subscription: created });
  });
  router.post("/seed", (req, res) => {
    try {
      const stmt = db.prepare(
        "INSERT INTO subscriptions (user_id, name, amount, status) VALUES (?, ?, ?, ?)"
      );
      const info = stmt.run(null, "Netflix", 15.99, "active");
      const row = db
        .prepare("SELECT * FROM subscriptions WHERE id = ?")
        .get(info.lastInsertRowid);
      res.json({ inserted: row });
    } catch (err) {
      console.error("seed error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
