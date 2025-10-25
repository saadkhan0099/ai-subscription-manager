import express from "express";
import { analyzeSubscription } from "../services/cloudflareAI.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { subscription } = req.body;
    const result = await analyzeSubscription(subscription);
    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
export default router;
