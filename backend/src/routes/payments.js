const express = require("express");
const { createCoinOrder, getCoinPacks, verifyCoinPayment } = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/coin-packs", authMiddleware, getCoinPacks);
router.post("/coin-order", authMiddleware, createCoinOrder);
router.post("/coin-verify", authMiddleware, verifyCoinPayment);

module.exports = router;
