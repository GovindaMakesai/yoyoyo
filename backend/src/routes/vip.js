const express = require("express");
const { createVipOrder, getVipPlans, verifyVipPayment } = require("../controllers/vipController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/plans", authMiddleware, getVipPlans);
router.post("/order", authMiddleware, createVipOrder);
router.post("/verify", authMiddleware, verifyVipPayment);

module.exports = router;
