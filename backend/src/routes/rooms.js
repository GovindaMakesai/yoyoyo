const express = require("express");
const {
  createRoom,
  listRooms,
  joinRoom,
  leaveRoom,
  assignAdmin,
  kickUser,
  updateRoomSettings,
  listMessages,
} = require("../controllers/roomController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, listRooms);
router.post("/", authMiddleware, createRoom);
router.post("/:roomId/join", authMiddleware, joinRoom);
router.post("/:roomId/leave", authMiddleware, leaveRoom);
router.post("/:roomId/admins/:userId", authMiddleware, assignAdmin);
router.delete("/:roomId/members/:userId", authMiddleware, kickUser);
router.patch("/:roomId/settings", authMiddleware, updateRoomSettings);
router.get("/:roomId/messages", authMiddleware, listMessages);

module.exports = router;
