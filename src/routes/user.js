const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.put("/profile", userController.updateProfile);
router.put("/role", userController.updateRole);

module.exports = router;
