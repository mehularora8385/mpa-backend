const express = require("express");
const app = express();
const rateLimiter = require("./middlewares/rateLimiter");
const ipBlocker = require("./middlewares/ipBlocker");
const requestLogger = require("./middlewares/requestLogger");

app.use(express.json());
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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/centres", centreRoutes);
app.use("/api/v1/biometric", biometricRoutes);
app.use("/api/v1/operators", operatorRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/logs", logRoutes);
app.use("/api/v1/backup", backupRoutes);

module.exports = app;
