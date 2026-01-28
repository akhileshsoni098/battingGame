require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const runMigrations = require("./migrate"); // 👈 add this

const PORT = process.env.PORT || 3000;
 
(async () => {
  try {
    // connect database (mysql2 pool)
    const db = await connectDB();

    // make db global (as you already do)
    global.db = db;

    console.log("✅ Database connected");

    // 🔥 run migrations ONCE on server start
    await runMigrations();
    console.log("✅ Migrations completed");

    // 🚀 start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();


 