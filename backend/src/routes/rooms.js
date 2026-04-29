const express = require("express");
const { createRoom, listRooms } = require("../controllers/roomController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, listRooms);
router.post("/", authMiddleware, createRoom);

module.exports = router;
