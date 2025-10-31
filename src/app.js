import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbPromise from "./db/sqlite.js";

// Routes
import authRoutes from "./routes/auth.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import paymentRoutes from "./routes/payments.js";
import aiRoutes from "./routes/ai.js";

// Load environment variables
dotenv.config();

// Ensure PORT is set
const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️ JWT_SECRET not set. Set it in your .env before deploying to production."
  );
}

// Initialize database
console.log("⏳ Initializing database...");
const db = await dbPromise;

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) =>
  res.send("🚀 Backend is running! Use Thunder Client or curl to test APIs.")
);

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes(db));
app.use("/api/payments", paymentRoutes(db));
app.use("/api/ai", aiRoutes(db));

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
