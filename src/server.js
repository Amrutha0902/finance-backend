require("dotenv").config();

const app = require("./app");
const { initializeSchema, seedAdmin } = require("./config/database");

const PORT = process.env.PORT || 3000;

// Initialize database schema and seed default admin
initializeSchema();
seedAdmin();

app.listen(PORT, () => {
  console.log(`🚀 Finance Backend running on http://localhost:${PORT}`);
  console.log(`📋 Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
