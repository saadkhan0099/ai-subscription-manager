// backend/src/routes/payments.js
import express from "express";
import dbp from "../db/sqlite.js";
import { createTransfer } from "../services/circleWallets.js";
// import { sendUSDC } from "../services/arc.js";

const router = express.Router();
const db = await dbp; // dbp is a Promise from sqlite open()

// Simulate a payment (no real transfer)
router.post("/simulate", (req, res) => {
  const { subscription_id, amount, currency = "USD" } = req.body;
  const stmt = db.prepare(
    "INSERT INTO payments (subscription_id, amount, currency, status) VALUES (?,?,?,?)"
  );
  const info = stmt.run(subscription_id, amount || 0, currency, "simulated");
  const payment = db
    .prepare("SELECT * FROM payments WHERE id = ?")
    .get(info.lastInsertRowid);
  res.json({ payment });
});

// Circle transfer skeleton
router.post("/circle-transfer", async (req, res) => {
  const { subscription_id, fromWalletId, toAddress, amount } = req.body;
  try {
    const circleResp = await createTransfer(
      fromWalletId,
      toAddress,
      amount,
      "USD"
    );
    const stmt = db.prepare(
      "INSERT INTO payments (subscription_id, amount, currency, status, circle_tx_id) VALUES (?,?,?,?,?)"
    );
    const info = stmt.run(
      subscription_id,
      amount,
      "USD",
      "pending",
      circleResp.id || null
    );
    const payment = db
      .prepare("SELECT * FROM payments WHERE id = ?")
      .get(info.lastInsertRowid);
    res.json({ ok: true, circleResp, payment });
  } catch (err) {
    console.error(
      "circle-transfer error:",
      err?.response?.data || err.message || err
    );
    res
      .status(500)
      .json({ error: "Circle transfer failed", details: err.message || err });
  }
});

// Send USDC on Arc (uses local private key)
router.post("/arc-send", async (req, res) => {
  const { subscription_id, toAddress, amount_cents } = req.body;
  try {
    const receipt = await sendUSDC(toAddress, amount_cents);
    const stmt = db.prepare(
      "INSERT INTO payments (subscription_id, amount, currency, status, arc_tx_hash) VALUES (?,?,?,?,?)"
    );
    const info = stmt.run(
      subscription_id,
      (amount_cents / 100).toFixed(2),
      "USD",
      "succeeded",
      receipt.transactionHash || receipt.hash
    );
    const payment = db
      .prepare("SELECT * FROM payments WHERE id = ?")
      .get(info.lastInsertRowid);
    res.json({ ok: true, receipt, payment });
  } catch (err) {
    console.error("arc-send error:", err);
    res
      .status(500)
      .json({ error: "Arc send failed", details: err.message || err });
  }
});

export default router;
