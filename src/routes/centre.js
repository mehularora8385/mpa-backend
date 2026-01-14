const express = require("express");
const router = express.Router();
const centreController = require("../controllers/centreController");

router.get("/:id/capacity", centreController.checkCapacity);

module.exports = router;
