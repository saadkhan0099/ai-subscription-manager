// backend/src/routes/subscriptions.js
import express from "express";
import { authenticate } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

export default function subscriptionRoutes(db) {
  const router = express.Router();

  // Validation rules for creating a subscription
  const createSubValidationRules = [
    body("name").notEmpty().trim().withMessage("Subscription name is required"),
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a number greater than 0"),
  ];

  // Validation rules for updating a subscription
  const updateSubValidationRules = [
    body("name")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("Name cannot be empty"),
    body("amount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a number greater than 0"),
    body("status")
      .optional()
      .isIn(["active", "inactive", "cancelled"])
      .withMessage("Invalid status"),
  ];

  // GET /api/subscriptions - Get all user's subscriptions
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

  // POST /api/subscriptions - Create a new subscription
  router.post("/", authenticate, createSubValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, amount } = req.body;
    try {
      const result = await db.run(
        "INSERT INTO subscriptions (user_id, name, amount) VALUES (?, ?, ?)",
        req.user.id,
        name,
        amount
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

  // PUT /api/subscriptions/:id - Update a subscription
  router.put(
    "/:id",
    authenticate,
    updateSubValidationRules,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, amount, status } = req.body;

      try {
        const sub = await db.get(
          "SELECT * FROM subscriptions WHERE id = ? AND user_id = ?",
          id,
          req.user.id
        );
        if (!sub) {
          return res.status(404).json({ error: "Subscription not found" });
        }

        const newName = name || sub.name;
        const newAmount = amount || sub.amount;
        const newStatus = status || sub.status;

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
    }
  );

  // DELETE /api/subscriptions/:id - Delete a subscription
  router.delete("/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.run(
        "DELETE FROM subscriptions WHERE id = ? AND user_id = ?",
        id,
        req.user.id
      );
      if (result.changes === 0) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.status(200).json({ message: "Subscription deleted successfully" });
    } catch (err) {
      console.error("Delete subscription error:", err);
      res.status(500).json({ error: "Failed to delete subscription" });
    }
  });

  return router;
}
