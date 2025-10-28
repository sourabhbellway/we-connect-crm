import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

import { prisma } from "./lib/prisma";
import { seedInitialData } from "./seeders/initialData";
import { IntegrationScheduler } from "./services/IntegrationScheduler";

// Routes
import authRoutes from "./routes/authRoutes";
import superAdminAuthRoutes from "./routes/superAdminAuthRoutes";
import roleRoutes from "./routes/roleRoutes";
import userRoutes from "./routes/userRoutes";
import leadRoutes from "./routes/leadRoutes";
import tagRoutes from "./routes/tagRoutes";
import leadSourceRoutes from "./routes/leadSourceRoutes";
import industryRoutes from "./routes/industryRoutes";
import permissionRoutes from "./routes/permissionRoutes";
import activityRoutes from "./routes/activityRoutes";
import businessSettingsRoutes from "./routes/businessSettingsRoutes";
import taskRoutes from "./routes/taskRoutes";
import contactRoutes from "./routes/contactRoutes";
import companyRoutes from "./routes/companyRoutes";
import dealRoutes from "./routes/dealRoutes";
import leadAnalyticsRoutes from "./routes/leadAnalyticsRoutes";
import callLogRoutes from "./routes/callLogRoutes";
import communicationRoutes from "./routes/communicationRoutes";
import proposalTemplateRoutes from "./routes/proposalTemplateRoutes";
import quotationRoutes from "./routes/quotationRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import productRoutes from "./routes/productRoutes";
import fileRoutes from "./routes/fileRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
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
  })
);

// Rate limiting - only in production
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "1") * 60 * 1000, // 1 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
    },
  });
  app.use("/api/", limiter);  
  console.log("🔒 Rate limiting enabled (production mode)");
} else {
  console.log("🚀 Rate limiting disabled (development mode)");
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Logging
app.use(morgan("combined"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CRM API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes - Specific paths first to avoid conflicts
app.use("/api/auth", authRoutes);
app.use("/api/auth", superAdminAuthRoutes); // Super Admin authentication routes
app.use("/api/files", fileRoutes); // Mount files route early to prevent conflicts
app.use("/api/call-logs", callLogRoutes);
app.use("/api/communication", communicationRoutes);
app.use("/api/proposal-templates", proposalTemplateRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/products", productRoutes);
app.use("/api", roleRoutes);
app.use("/api", userRoutes);
app.use("/api", leadRoutes);
app.use("/api", tagRoutes);
app.use("/api", leadSourceRoutes);
app.use("/api", industryRoutes);
app.use("/api", permissionRoutes);
app.use("/api", activityRoutes);
app.use("/api", businessSettingsRoutes);
app.use("/api", taskRoutes);
app.use("/api", contactRoutes);
app.use("/api", companyRoutes);
app.use("/api", dealRoutes);
app.use("/api", leadAnalyticsRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
);

// Database connection and server start
const startServer = async () => {
  try {
    console.log("Starting server initialization...");
    console.log("Attempting database connection...");
    // Test database connection
    await prisma.$connect();
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
      const apiBaseUrl =
      process.env.API_BASE_URL || `http://31.97.233.21:3001/api`;
      console.log(`🚀 CRM API Server running on port ${PORT}`);
      // console.log(`🔗 Health check: http://31.97.233.21:8081/health`);
      // console.log(`🔗 API Base URL: ${apiBaseUrl}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
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
