const express=require("express");
const r=express.Router();
const c=require("../controllers/main.controller");

r.get("/candidates",c.getCandidates);
r.post("/present",c.markPresent);
r.post("/verify",c.verifyCandidate);
r.get("/stats",c.dashboardStats);
r.get("/client-stats/:exam",c.clientDashboard);
r.get("/reports/:type",c.reports);
r.get("/export",c.exportCSV);
r.post("/sync-all",c.syncAll);
r.post("/logout-all",c.logoutAll);

module.exports=r;
