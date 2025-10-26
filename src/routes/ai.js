import express from "express";
import { analyzeSubscription } from "../services/cloudflareAI.js";
import { authenticate } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

router.post(
  "/analyze",
  authenticate,
  body("subscription").notEmpty().withMessage("Subscription data is required"),
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { subscription } = req.body;
      const result = await analyzeSubscription(subscription);
      res.json({ success: true, result });
    } catch (err) {
      console.error("AI analyze error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

export default router;
