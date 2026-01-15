const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");

router.post("/", backupController.trigger);

module.exports = router;
