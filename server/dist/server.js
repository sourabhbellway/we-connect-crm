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
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const prisma_1 = require("./lib/prisma");
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
const businessSettingsRoutes_1 = __importDefault(require("./routes/businessSettingsRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const dealRoutes_1 = __importDefault(require("./routes/dealRoutes"));
const leadAnalyticsRoutes_1 = __importDefault(require("./routes/leadAnalyticsRoutes"));
const callLogRoutes_1 = __importDefault(require("./routes/callLogRoutes"));
const communicationRoutes_1 = __importDefault(require("./routes/communicationRoutes"));
const proposalTemplateRoutes_1 = __importDefault(require("./routes/proposalTemplateRoutes"));
const quotationRoutes_1 = __importDefault(require("./routes/quotationRoutes"));
const invoiceRoutes_1 = __importDefault(require("./routes/invoiceRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production"
        ? ["http://31.97.233.21", "http://31.97.233.21:8081", "http://31.97.233.21:7001", "http://31.97.233.21:3001"]
        : [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5174",
            "http://localhost:7001",
            "http://192.168.1.247:5173",
            "http://192.168.1.247:5174",
            "http://192.168.1.4:5173",
            "http://192.168.1.4:5174",
        ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
// Rate limiting - only in production
if (process.env.NODE_ENV === "production") {
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "1") * 60 * 1000, // 1 minutes
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
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
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
// API routes - Specific paths first to avoid conflicts
app.use("/api/auth", authRoutes_1.default);
app.use("/api/auth", superAdminAuthRoutes_1.default); // Super Admin authentication routes
app.use("/api/files", fileRoutes_1.default); // Mount files route early to prevent conflicts
app.use("/api/call-logs", callLogRoutes_1.default);
app.use("/api/communication", communicationRoutes_1.default);
app.use("/api/proposal-templates", proposalTemplateRoutes_1.default);
app.use("/api/quotations", quotationRoutes_1.default);
app.use("/api/invoices", invoiceRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api", roleRoutes_1.default);
app.use("/api", userRoutes_1.default);
app.use("/api", leadRoutes_1.default);
app.use("/api", tagRoutes_1.default);
app.use("/api", leadSourceRoutes_1.default);
app.use("/api", industryRoutes_1.default);
app.use("/api", permissionRoutes_1.default);
app.use("/api", activityRoutes_1.default);
app.use("/api", businessSettingsRoutes_1.default);
app.use("/api", taskRoutes_1.default);
app.use("/api", contactRoutes_1.default);
app.use("/api", companyRoutes_1.default);
app.use("/api", dealRoutes_1.default);
app.use("/api", leadAnalyticsRoutes_1.default);
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
        console.log("Starting server initialization...");
        console.log("Attempting database connection...");
        // Test database connection
        await prisma_1.prisma.$connect();
        console.log("Database connection established successfully.");
        // Seed initial data
        // TEMPORARILY DISABLED - causing startup issues
        // await seedInitialData();
        console.log("⏭️  Skipping seed data (already exists)");
        // Initialize Integration Scheduler for automatic lead fetching
        // TEMPORARILY DISABLED - causing startup issues
        // const integrationScheduler = new IntegrationScheduler(prisma);
        // await integrationScheduler.initialize();
        console.log("🔄 Integration Scheduler temporarily disabled");
        // Start server
        app.listen(Number(PORT), "0.0.0.0", () => {
            const apiBaseUrl = process.env.API_BASE_URL || `http://31.97.233.21:3001/api`;
            console.log(`🚀 CRM API Server running on port ${PORT}`);
            // console.log(`🔗 Health check: http://31.97.233.21:8081/health`);
            // console.log(`🔗 API Base URL: ${apiBaseUrl}`);
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