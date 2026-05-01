const express = require("express");
const { updateProfile } = require("../controllers/profileController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.patch("/", authMiddleware, updateProfile);

module.exports = router;
