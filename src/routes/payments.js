import express from "express";
import dbp from "../db/sqlite.js";
import { createTransfer } from "../services/circleWallets.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
const db = await dbp;

// Simulate a payment
router.post("/simulate", authenticate, async (req, res) => {
  const { subscription_id, amount = 0, currency = "USD" } = req.body;
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

    res.json({ payment });
  } catch (err) {
    console.error("Simulate payment error:", err);
    res.status(500).json({ error: "Failed to simulate payment" });
  }
});

// Circle transfer
router.post("/circle-transfer", authenticate, async (req, res) => {
  const { subscription_id, fromWalletId, toAddress, amount } = req.body;
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

    res.json({ ok: true, circleResp, payment });
  } catch (err) {
    console.error("Circle transfer error:", err);
    res.status(500).json({ error: "Circle transfer failed" });
  }
});

// Arc send
router.post("/arc-send", authenticate, async (req, res) => {
  const { subscription_id, toAddress, amount_cents } = req.body;
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

    res.json({ ok: true, receipt, payment });
  } catch (err) {
    console.error("Arc send error:", err);
    res.status(500).json({ error: "Arc send failed" });
  }
});

export default router;
