const express = require("express");
const {
  addCoins,
  getBalance,
  listTransactions,
  spendCoins,
} = require("../controllers/walletController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/balance", authMiddleware, getBalance);
router.post("/add", authMiddleware, addCoins);
router.post("/spend", authMiddleware, spendCoins);
router.get("/transactions", authMiddleware, listTransactions);

module.exports = router;
