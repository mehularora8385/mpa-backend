
const express=require("express");
const router=express.Router();
const c=require("../controllers/attendance.controller");

router.post("/present",c.markPresent);
router.post("/verify",c.verifyCandidate);
router.get("/download",c.downloadCandidates);
router.get("/stats",c.dashboardStats);

module.exports=router;
