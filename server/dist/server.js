"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("./lib/prisma");
const initialData_1 = require("./seeders/initialData");
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const superAdminAuthRoutes_1 = __importDefault(require("./routes/superAdminAuthRoutes"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const leadRoutes_1 = __importDefault(require("./routes/leadRoutes"));
const tagRoutes_1 = __importDefault(require("./routes/tagRoutes"));
const leadSourceRoutes_1 = __importDefault(require("./routes/leadSourceRoutes"));
const industryRoutes_1 = __importDefault(require("./routes/industryRoutes"));
const permissionRoutes_1 = __importDefault(require("./routes/permissionRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production"
        ? ["http://31.97.233.21", "http://31.97.233.21:8081"]
        : [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5174",
        ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
// Rate limiting - only in production
if (process.env.NODE_ENV === "production") {
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15") * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // limit each IP to 100 requests per windowMs
        message: {
            success: false,
            message: "Too many requests from this IP, please try again later.",
        },
    });
    app.use("/api/", limiter);
    console.log("🔒 Rate limiting enabled (production mode)");
}
else {
    console.log("🚀 Rate limiting disabled (development mode)");
}
// Body parsing middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Logging
app.use((0, morgan_1.default)("combined"));
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "CRM API is running",
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/auth", superAdminAuthRoutes_1.default); // Super Admin authentication routes
app.use("/api", roleRoutes_1.default);
app.use("/api", userRoutes_1.default);
app.use("/api", leadRoutes_1.default);
app.use("/api", tagRoutes_1.default);
app.use("/api", leadSourceRoutes_1.default);
app.use("/api", industryRoutes_1.default);
app.use("/api", permissionRoutes_1.default);
app.use("/api", activityRoutes_1.default);
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
    });
});
// Global error handler
app.use((error, req, res, next) => {
    console.error("Global error:", error);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
});
// Database connection and server start
const startServer = async () => {
    try {
        // Test database connection
        await prisma_1.prisma.$connect();
        console.log("Database connection established successfully.");
        // Seed initial data
        await (0, initialData_1.seedInitialData)();
        // Start server
        app.listen(Number(PORT), "0.0.0.0", () => {
            const apiBaseUrl = process.env.API_BASE_URL || `http://31.97.233.21:8081/api`;
            console.log(`🚀 CRM API Server running on port ${PORT}`);
            console.log(`🔗 Health check: http://31.97.233.21:8081/health`);
            console.log(`🔗 API Base URL: ${apiBaseUrl}`);
            console.log(`📚 Environment: ${process.env.NODE_ENV || "development"}`);
        });
    }
    catch (error) {
        console.error("Unable to start server:", error);
        process.exit(1);
    }
};
// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
startServer();
//# sourceMappingURL=server.js.map