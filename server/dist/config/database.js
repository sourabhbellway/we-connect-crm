"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// For now, use SQLite to get the server running
// You can switch back to PostgreSQL later
const useSQLite = true; // Set to false to use PostgreSQL
let sequelize;
if (useSQLite) {
    // Use SQLite for development/testing
    const dbPath = path_1.default.join(__dirname, '../../database.sqlite');
    sequelize = new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
    console.log('📱 Using SQLite database:', dbPath);
}
else {
    // PostgreSQL configuration (original)
    const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
            console.warn(`Warning: ${envVar} environment variable is not set, using default value`);
        }
    }
    sequelize = new sequelize_1.Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'crm_db',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'Sourabh@123',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        retry: {
            max: 3,
            timeout: 5000
        }
    });
    console.log('🐘 Using PostgreSQL database');
}
exports.default = sequelize;
//# sourceMappingURL=database.js.map