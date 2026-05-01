const express = require("express");
const { adjustCoins, banUser, monitorRooms, unbanUser } = require("../controllers/adminController");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware, requireRole("admin", "super_admin"));
router.get("/rooms", monitorRooms);
router.post("/users/:userId/ban", banUser);
router.post("/users/:userId/unban", unbanUser);
router.post("/users/:userId/coins", adjustCoins);

module.exports = router;
