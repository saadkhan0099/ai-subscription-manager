// backend/src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import testRoutes from "./routes/test.js";
import dbPromise from "./db/sqlite.js";
import aiRoutes from "./routes/ai.js";
import paymentRoutes from "./routes/payments.js"; // corrected
import subscriptionRoutes from "./routes/subscriptions.js"; // corrected
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

// Load environment variables once
dotenv.config();

console.log("⏳ Initializing database...");
const db = await dbPromise;

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.use("/api/test", testRoutes);

// API routes
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes); // plural
app.use("/api/subscriptions", subscriptionRoutes(db)); // plural
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes(db));

// Debug: print env variables (optional)
console.log("PORT:", process.env.PORT);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// Root route
app.get("/", (req, res) =>
  res.send("🚀 Backend is running! Use Thunder Client to test APIs.")
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
