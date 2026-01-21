const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const app = express();

/* =====================
   BASIC MIDDLEWARE
===================== */
app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =====================
   ROOT TEST ROUTES
===================== */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MPA Backend API Root Working"
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API is running successfully 🚀"
  });
});

/* =====================
   HEALTH CHECK
===================== */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
    version: "2.0.0"
  });
});

/* =====================
   LOAD CUSTOM MIDDLEWARE
===================== */
const rateLimiter = require("./middlewares/rateLimiter");
const ipBlocker = require("./middlewares/ipBlocker");
const requestLogger = require("./middlewares/requestLogger");

/* 
   IMPORTANT FIX:
   Allow localhost always
*/
app.use((req, res, next) => {
  if (
    req.ip === "127.0.0.1" ||
    req.ip === "::1" ||
    req.ip === "::ffff:127.0.0.1"
  ) {
    return next();
  }
  next();
});

app.use(rateLimiter);
app.use(ipBlocker);
app.use(requestLogger);

/* =====================
   ROUTES
===================== */
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const centreRoutes = require("./routes/centre");
const biometricRoutes = require("./routes/biometric");
const operatorRoutes = require("./routes/operator");
const attendanceRoutes = require("./routes/attendance");
const logRoutes = require("./routes/log");
const backupRoutes = require("./routes/backup");
const downloadPasswordRoutes = require("./routes/downloadPassword");
const faceRecognitionRoutes = require("./routes/faceRecognition");
const fingerprintRoutes = require("./routes/fingerprint");
const omrRoutes = require("./routes/omr");
const slotRoutes = require("./routes/slot");
const syncRoutes = require("./routes/sync");
const examRoutes = require("./routes/examRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

/* =====================
   API PREFIX
===================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/centres", centreRoutes);
app.use("/api/biometric", biometricRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/download-password", downloadPasswordRoutes);
app.use("/api/face-recognition", faceRecognitionRoutes);
app.use("/api/fingerprint", fingerprintRoutes);
app.use("/api/omr", omrRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

/* =====================
   404 HANDLER (LAST)
===================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl
  });
});

module.exports = app;

