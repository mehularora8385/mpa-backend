const express = require("express");
const router = express.Router();
const biometricController = require("../controllers/biometricController");

router.post("/reverify", biometricController.reverify);

module.exports = router;
