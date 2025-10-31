// backend/src/middleware/auth.js
import jwt from "jsonwebtoken";

/**
 * authenticate middleware
 * - expects Authorization: Bearer <token>
 * - attaches req.user = { id, email, ...payload }
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // configuration error — send 500 because server is misconfigured
      console.error("JWT_SECRET missing in environment.");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // verify will throw if invalid or expired
    const payload = jwt.verify(token, secret);

    // attach minimal user info to request
    req.user = payload;
    return next();
  } catch (err) {
    // Do not leak internal error details to client.
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    console.error("Authentication unexpected error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
