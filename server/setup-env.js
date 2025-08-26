const fs = require("fs");
const path = require("path");

// Check if .env file exists
const envPath = path.join(__dirname, ".env");
const envBackupPath = path.join(__dirname, ".env.backup");

if (!fs.existsSync(envPath)) {
  console.log("Creating .env file...");

  const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_db
DB_USER=postgres
DB_PASSWORD=Sourabh@123

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://31.97.233.21:8081

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# API Configuration
API_BASE_URL=http://31.97.233.21:8081/api
`;

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file created successfully!");
} else {
  console.log("✅ .env file already exists");
}

// Check if .env.backup exists and restore if needed
if (fs.existsSync(envBackupPath)) {
  console.log("📋 .env.backup file found");
  console.log("If you need to restore the backup, copy .env.backup to .env");
}

console.log("\n🔧 Environment setup complete!");
console.log(
  "📝 Make sure to update the database credentials in .env if needed"
);
console.log("🚀 You can now start the server with: npm run dev");
