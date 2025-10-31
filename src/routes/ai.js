import express from "express";
import { authenticate } from "../middleware/auth.js";
import { analyzeSubscription } from "../services/cloudflareAI.js";
import { body, validationResult } from "express-validator";

export default function aiRoutes(db) {
  const router = express.Router();

  router.post(
    "/analyze",
    authenticate,
    body("subscription")
      .notEmpty()
      .withMessage("Subscription data is required"),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      try {
        const { subscription } = req.body;
        const result = await analyzeSubscription(subscription);

        // Optional: save AI analysis to DB
        await db.run(
          "INSERT INTO ai_analyses (user_id, data) VALUES (?, ?)",
          req.user.id,
          JSON.stringify(result)
        );

        res.status(200).json({ success: true, result });
      } catch (err) {
        console.error("AI analyze error:", err);
        res.status(500).json({ error: "Failed to analyze subscription" });
      }
    }
  );

  return router;
}
