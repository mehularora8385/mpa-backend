const express = require("express");
const router = express.Router();
const multer = require("multer");
const operatorController = require("../controllers/operatorController");
const authMiddleware = require("../middlewares/authMiddleware");

const upload = multer({ dest: "uploads/" });

router.post("/upload", authMiddleware, upload.single("file"), operatorController.upload);
router.get("/slot/candidates", authMiddleware, operatorController.getSlotCandidates);

module.exports = router;
