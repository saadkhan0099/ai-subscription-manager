// backend/src/routes/subscriptions.js
import express from "express";

export default function subscriptionRoutes(db) {
  const router = express.Router();

  // ✅ Get all subscriptions
  router.get("/", (req, res) => {
    try {
      const rows = db
        .prepare("SELECT * FROM subscriptions ORDER BY created_at DESC")
        .all();
      res.json({ subscriptions: rows });
    } catch (err) {
      console.error("GET error:", err);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  // ✅ Create a new subscription
  router.post("/", (req, res) => {
    const { vendor, amount } = req.body;

    if (!vendor || !amount) {
      return res.status(400).json({ error: "vendor and amount are required" });
    }

    try {
      const stmt = db.prepare(
        "INSERT INTO subscriptions (user_id, name, amount, status) VALUES (?, ?, ?, ?)"
      );
      const info = stmt.run(null, vendor, amount, "active");
      const created = db
        .prepare("SELECT * FROM subscriptions WHERE id = ?")
        .get(info.lastInsertRowid);
      res.status(201).json({ subscription: created });
    } catch (err) {
      console.error("POST error:", err);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  // ✅ Update a subscription (PUT)
  router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, amount, status } = req.body;

    try {
      const existing = db
        .prepare("SELECT * FROM subscriptions WHERE id = ?")
        .get(id);
      if (!existing) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      const stmt = db.prepare(`
        UPDATE subscriptions
        SET name = COALESCE(?, name),
            amount = COALESCE(?, amount),
            status = COALESCE(?, status)
        WHERE id = ?
      `);
      stmt.run(name, amount, status, id);

      const updated = db
        .prepare("SELECT * FROM subscriptions WHERE id = ?")
        .get(id);
      res.json({ subscription: updated });
    } catch (err) {
      console.error("PUT error:", err);
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  // ✅ Delete a subscription (DELETE)
  router.delete("/:id", (req, res) => {
    const { id } = req.params;

    try {
      const existing = db
        .prepare("SELECT * FROM subscriptions WHERE id = ?")
        .get(id);
      if (!existing) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      db.prepare("DELETE FROM subscriptions WHERE id = ?").run(id);
      res.json({ message: "Subscription deleted successfully" });
    } catch (err) {
      console.error("DELETE error:", err);
      res.status(500).json({ error: "Failed to delete subscription" });
    }
  });

  // ✅ Quick seed (for testing)
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
      console.error("Seed error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
