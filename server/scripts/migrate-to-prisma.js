#!/usr/bin/env node

/**
 * Migration Script: Sequelize to Prisma
 * This script helps migrate from Sequelize to Prisma safely
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Starting Sequelize to Prisma migration...\n");

// Step 1: Create backup
console.log("📦 Step 1: Creating database backup...");
try {
  execSync("chmod +x ./scripts/backup-database.sh", { stdio: "inherit" });
  execSync("./scripts/backup-database.sh", { stdio: "inherit" });
  console.log("✅ Backup completed successfully\n");
} catch (error) {
  console.error("❌ Backup failed:", error.message);
  process.exit(1);
}

// Step 2: Generate Prisma client
console.log("🔧 Step 2: Generating Prisma client...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma client generated successfully\n");
} catch (error) {
  console.error("❌ Prisma client generation failed:", error.message);
  process.exit(1);
}

// Step 3: Create initial migration
console.log("📝 Step 3: Creating initial migration...");
try {
  execSync("npx prisma migrate dev --name init", { stdio: "inherit" });
  console.log("✅ Initial migration created successfully\n");
} catch (error) {
  console.error("❌ Migration creation failed:", error.message);
  console.log("💡 This might be expected if the database already exists");
}

// Step 4: Create migration helper files
console.log("📁 Step 4: Creating migration helper files...");

// Create a temporary Sequelize compatibility layer
const sequelizeCompatContent = `
// Temporary Sequelize compatibility layer
// This file helps with gradual migration from Sequelize to Prisma

import { prisma } from '../lib/prisma';

// Temporary compatibility functions
export const sequelizeCompat = {
  // Add compatibility functions here as needed during migration
  async transaction(callback) {
    return await prisma.$transaction(callback);
  },
  
  async close() {
    await prisma.$disconnect();
  }
};

export default sequelizeCompat;
`;

fs.writeFileSync(
  path.join(__dirname, "../src/lib/sequelize-compat.ts"),
  sequelizeCompatContent
);

console.log("✅ Migration helper files created\n");

// Step 5: Update package.json scripts
console.log("📋 Step 5: Updating package.json scripts...");
try {
  const packageJsonPath = path.join(__dirname, "../package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Add Prisma scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "db:seed": "ts-node src/seeders/initialData.ts",
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("✅ Package.json scripts updated\n");
} catch (error) {
  console.error("❌ Failed to update package.json:", error.message);
}

console.log("🎉 Migration preparation completed!");
console.log("\n📋 Next steps:");
console.log("1. Update your .env file with DATABASE_URL");
console.log("2. Run: npm run db:migrate");
console.log("3. Start updating your controllers to use Prisma");
console.log("4. Test thoroughly before deploying");
console.log(
  "\n⚠️  Remember to keep your Sequelize code in a separate branch for rollback!"
);
