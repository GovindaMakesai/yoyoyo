const express = require("express");
const { openLuckyRound, placeLuckyBet, settleLuckyRound } = require("../controllers/gameController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/:roomId/lucky-rounds", authMiddleware, openLuckyRound);
router.post("/:roomId/lucky-rounds/:roundId/bets", authMiddleware, placeLuckyBet);
router.post("/:roomId/lucky-rounds/:roundId/settle", authMiddleware, settleLuckyRound);

module.exports = router;
