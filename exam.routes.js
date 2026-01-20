
const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam.controller");
const upload = require("../middleware/upload");

router.post("/create", examController.createExam);
router.get("/list", examController.getExams);
router.put("/status/:id", examController.updateStatus);
router.post("/upload", upload.single("file"), examController.uploadCandidates);

module.exports = router;
