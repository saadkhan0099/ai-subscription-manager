import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const dbPath = path.resolve("./data.db");

console.log("⏳ Opening SQLite database...");

const dbPromise = open({
  filename: dbPath,
  driver: sqlite3.Database,
});

async function initDB() {
  try {
    const db = await dbPromise;
    console.log("⏳ Creating tables if they don't exist...");

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        wallet_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subscription_name TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subscription_id INTEGER NOT NULL,
        tx_hash TEXT,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(subscription_id) REFERENCES subscriptions(id)
      );
    `);

    console.log("✅ SQLite database initialized");
  } catch (err) {
    console.error("❌ SQLite init error:", err);
    process.exit(1); // stop app if DB fails
  }
}

// initialize on import
initDB();

export default dbPromise;
