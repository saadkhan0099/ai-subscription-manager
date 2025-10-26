import express from "express";
import { authenticate } from "../middleware/auth.js";

export default function subscriptionRoutes(db) {
  const router = express.Router();

  // Get all subscriptions for logged-in user
  router.get("/", authenticate, async (req, res) => {
    try {
      const subscriptions = await db.all(
        "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC",
        req.user.id
      );
      res.json({ subscriptions });
    } catch (err) {
      console.error("Get subscriptions error:", err);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  // Create subscription
  router.post("/", authenticate, async (req, res) => {
    const { vendor, amount } = req.body;
    if (!vendor || typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Valid vendor and amount required" });
    }

    try {
      const result = await db.run(
        "INSERT INTO subscriptions (user_id, name, amount, status) VALUES (?,?,?,?)",
        req.user.id,
        vendor,
        amount,
        "active"
      );

      const subscription = await db.get(
        "SELECT * FROM subscriptions WHERE id = ?",
        result.lastID
      );

      res.status(201).json({ subscription });
    } catch (err) {
      console.error("Create subscription error:", err);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  // Update subscription
  router.put("/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    const { name, amount, status } = req.body;

    try {
      const subscription = await db.get(
        "SELECT * FROM subscriptions WHERE id = ? AND user_id = ?",
        id,
        req.user.id
      );
      if (!subscription)
        return res.status(404).json({ error: "Subscription not found" });

      const newName = name || subscription.name;
      const newAmount =
        typeof amount === "number" && amount > 0 ? amount : subscription.amount;
      const newStatus = status || subscription.status;

      await db.run(
        "UPDATE subscriptions SET name = ?, amount = ?, status = ? WHERE id = ? AND user_id = ?",
        newName,
        newAmount,
        newStatus,
        id,
        req.user.id
      );

      const updated = await db.get(
        "SELECT * FROM subscriptions WHERE id = ?",
        id
      );
      res.json({ subscription: updated });
    } catch (err) {
      console.error("Update subscription error:", err);
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  // Delete subscription
  router.delete("/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    try {
      const subscription = await db.get(
        "SELECT * FROM subscriptions WHERE id = ? AND user_id = ?",
        id,
        req.user.id
      );
      if (!subscription)
        return res.status(404).json({ error: "Subscription not found" });

      await db.run(
        "DELETE FROM subscriptions WHERE id = ? AND user_id = ?",
        id,
        req.user.id
      );

      res.json({ message: "Subscription deleted successfully" });
    } catch (err) {
      console.error("Delete subscription error:", err);
      res.status(500).json({ error: "Failed to delete subscription" });
    }
  });

  return router;
}
