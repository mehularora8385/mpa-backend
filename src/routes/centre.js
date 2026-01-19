const express = require("express");
const router = express.Router();
const centreController = require("../controllers/centreController");
const authMiddleware = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Centre routes
router.get("/", centreController.getAllCentres);
router.get("/:id", centreController.getCentreById);
router.get("/:id/candidates", centreController.getCentreCandidates);
router.get("/:id/operators", centreController.getCentreOperators);
router.get("/:id/stats", centreController.getCentreStatsEndpoint);
router.get("/:id/capacity", centreController.checkCapacity);

module.exports = router;
