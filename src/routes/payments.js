import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createTransfer } from "../services/circleWallets.js";
import { sendUSDC } from "../services/arc.js";

export default function paymentRoutes(db) {
  const router = express.Router();

  // ------------------------------
  // Simulate a payment (for testing/demo)
  // POST /api/payments/simulate
  // ------------------------------
  router.post("/simulate", authenticate, async (req, res) => {
    const { subscription_id, amount = 0, currency = "USD" } = req.body;
    if (!subscription_id || typeof amount !== "number" || amount <= 0)
      return res
        .status(400)
        .json({ error: "Valid subscription_id and amount required" });

    try {
      const result = await db.run(
        "INSERT INTO payments (subscription_id, amount, currency, status) VALUES (?,?,?,?)",
        subscription_id,
        amount,
        currency,
        "simulated"
      );

      const payment = await db.get(
        "SELECT * FROM payments WHERE id = ?",
        result.lastID
      );
      res.status(201).json({ payment });
    } catch (err) {
      console.error("Simulate payment error:", err);
      res.status(500).json({ error: "Failed to simulate payment" });
    }
  });

  // ------------------------------
  // Circle wallet transfer
  // POST /api/payments/circle-transfer
  // ------------------------------
  router.post("/circle-transfer", authenticate, async (req, res) => {
    const { subscription_id, fromWalletId, toAddress, amount } = req.body;

    if (
      !subscription_id ||
      !fromWalletId ||
      !toAddress ||
      typeof amount !== "number"
    )
      return res
        .status(400)
        .json({ error: "Missing required fields or invalid amount" });

    try {
      const circleResp = await createTransfer(
        fromWalletId,
        toAddress,
        amount,
        "USD"
      );

      const result = await db.run(
        "INSERT INTO payments (subscription_id, amount, currency, status, circle_tx_id) VALUES (?,?,?,?,?)",
        subscription_id,
        amount,
        "USD",
        "pending",
        circleResp.id || null
      );

      const payment = await db.get(
        "SELECT * FROM payments WHERE id = ?",
        result.lastID
      );
      res.status(201).json({ payment, circleResp });
    } catch (err) {
      console.error("Circle transfer error:", err);
      res.status(500).json({ error: "Circle transfer failed" });
    }
  });

  // ------------------------------
  // Arc USDC send
  // POST /api/payments/arc-send
  // ------------------------------
  router.post("/arc-send", authenticate, async (req, res) => {
    const { subscription_id, toAddress, amount_cents } = req.body;

    if (!subscription_id || !toAddress || !Number.isInteger(amount_cents))
      return res
        .status(400)
        .json({ error: "Missing required fields or invalid amount_cents" });

    try {
      const receipt = await sendUSDC(toAddress, amount_cents);

      const result = await db.run(
        "INSERT INTO payments (subscription_id, amount, currency, status, arc_tx_hash) VALUES (?,?,?,?,?)",
        subscription_id,
        (amount_cents / 100).toFixed(2),
        "USD",
        "succeeded",
        receipt.transactionHash || receipt.hash
      );

      const payment = await db.get(
        "SELECT * FROM payments WHERE id = ?",
        result.lastID
      );
      res.status(201).json({ payment, receipt });
    } catch (err) {
      console.error("Arc send error:", err);
      res.status(500).json({ error: "Arc send failed" });
    }
  });

  return router;
}
