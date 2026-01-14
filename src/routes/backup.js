const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");

router.post("/", backupController.triggerBackup);

module.exports = router;
