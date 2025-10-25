// backend/src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import testRoutes from "./routes/test.js";
import dbPromise from "./db/sqlite.js";
import aiRoutes from "./routes/ai.js";
import paymentRoutes from "./routes/payment.js"; // make sure file name is payments.js
import subscriptionRoutes from "./routes/subscription.js"; // plural

console.log("⏳ Loading environment variables...");
dotenv.config();

console.log("⏳ Initializing database...");
const db = await dbPromise;

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.use("/api/test", testRoutes);

console.log("⏳ Setting up routes...");
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/subscription", subscriptionRoutes(db));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

app.get("/", (req, res) =>
  res.send("🚀 Backend is running! Use Thunder Client to test APIs.")
);
