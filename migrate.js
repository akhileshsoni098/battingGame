const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

// 👇 MANUALLY DEFINED MIGRATION ORDER
const MIGRATIONS = [
  "01migrations_table.sql",

  "users/02users.sql",

];
   
async function runMigrations() {
  const db = await connectDB();

  // ensure migrations table
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) UNIQUE,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const relativePath of MIGRATIONS) {
    const fullPath = path.join(__dirname, "migrations_sql", relativePath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Migration file not found: ${relativePath}`);
    }

    const [rows] = await db.query(
      "SELECT 1 FROM migrations WHERE filename = ?",
      [relativePath]
    );

    if (rows.length) {
      console.log("⏭️ Skipped:", relativePath);
      continue;
    }

    const sql = fs.readFileSync(fullPath, "utf8");

    await db.query(sql);
    await db.query(
      "INSERT INTO migrations (filename) VALUES (?)",
      [relativePath]
    );

    console.log("✅ Applied:", relativePath);
  }
}

module.exports = runMigrations;
