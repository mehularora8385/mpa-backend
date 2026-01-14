const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Custom middleware
const rateLimiter = require("./middlewares/rateLimiter");
const ipBlocker = require("./middlewares/ipBlocker");
const requestLogger = require("./middlewares/requestLogger");

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply custom middleware
app.use(rateLimiter);
app.use(ipBlocker);
app.use(requestLogger);

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const centreRoutes = require("./routes/centre");
const biometricRoutes = require("./routes/biometric");
const operatorRoutes = require("./routes/operator");
const attendanceRoutes = require("./routes/attendance");
const logRoutes = require("./routes/log");
const backupRoutes = require("./routes/backup");

// Mount routes with /api/ prefix (not /api/v1/)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/centres", centreRoutes);
app.use("/api/biometric", biometricRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/backup", backupRoutes);

// Health check endpoint (without /api prefix for compatibility)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
    version: "2.0.0"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path
  });
});

module.exports = app;
