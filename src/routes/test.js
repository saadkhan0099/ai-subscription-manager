import dbPromise from "../db/sqlite.js"; // Adjust path

async function testDatabase() {
  try {
    const db = await dbPromise;

    const users = await db.all("SELECT * FROM users");
    console.log("Users:", users);

    const subscriptions = await db.all("SELECT * FROM subscriptions");
    console.log("Subscriptions:", subscriptions);

    // Optional: close DB
    await db.close();
  } catch (error) {
    console.error("Error accessing the database:", error);
  }
}

testDatabase();

export default testDatabase;
