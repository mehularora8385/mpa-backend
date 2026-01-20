
const express = require("express");
const router = express.Router();
const verifyController = require("../controllers/verification.controller");

router.post("/verify", verifyController.verifyCandidate);
router.get("/status/:roll", verifyController.getStatus);

module.exports = router;
