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

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", superAdminAuthRoutes); // Super Admin authentication routes
app.use("/api", roleRoutes);
app.use("/api", userRoutes);
app.use("/api", leadRoutes);
app.use("/api", tagRoutes);
app.use("/api", leadSourceRoutes);
app.use("/api", industryRoutes);
app.use("/api", permissionRoutes);
app.use("/api", activityRoutes);

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
    // Test database connection
    await prisma.$connect();
    console.log("Database connection established successfully.");

    // Seed initial data
    await seedInitialData();

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
