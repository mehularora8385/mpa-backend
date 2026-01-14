const express = require("express");
const router = express.Router();
const operatorController = require("../controllers/operatorController");

router.post("/upload", operatorController.bulkUpload);

module.exports = router;
