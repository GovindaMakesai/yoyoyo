const { GameRound } = require("../models/GameRound");
const { Room } = require("../models/Room");
const { asyncHandler } = require("../utils/asyncHandler");
const { mutateBalance } = require("../services/walletService");

const openLuckyRound = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });
  if (!room.settings?.luckyNumberGameEnabled) return res.status(400).json({ message: "Lucky game disabled in room." });
  if (String(room.host) !== String(req.user._id) && !room.admins.some((id) => String(id) === String(req.user._id))) {
    return res.status(403).json({ message: "Only host/admin can open round." });
  }

  const existing = await GameRound.findOne({ roomId, status: "open" });
  if (existing) return res.status(400).json({ message: "An open round already exists." });

  const round = await GameRound.create({ roomId });
  return res.status(201).json({ round });
});

const placeLuckyBet = asyncHandler(async (req, res) => {
  const { roomId, roundId } = req.params;
  const { guess, amount } = req.body || {};
  const g = Number(guess);
  const a = Math.floor(Number(amount));
  if (!Number.isInteger(g) || g < 1 || g > 10 || !Number.isFinite(a) || a <= 0) {
    return res.status(400).json({ message: "Guess must be 1-10 and amount must be >0." });
  }

  const round = await GameRound.findOne({ _id: roundId, roomId, status: "open" });
  if (!round) return res.status(404).json({ message: "Open round not found." });
  await mutateBalance({
    userId: req.user._id,
    amount: a,
    type: "debit",
    category: "game_bet",
    reason: `Lucky game bet ${g}`,
    metadata: { roomId, roundId, guess: g },
  });

  round.bets.push({ userId: req.user._id, guess: g, amount: a });
  await round.save();
  return res.json({ round });
});

const settleLuckyRound = asyncHandler(async (req, res) => {
  const { roomId, roundId } = req.params;
  const { luckyNumber } = req.body || {};
  const n = Number(luckyNumber);
  if (!Number.isInteger(n) || n < 1 || n > 10) return res.status(400).json({ message: "Lucky number must be 1-10." });
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });
  if (String(room.host) !== String(req.user._id) && !room.admins.some((id) => String(id) === String(req.user._id))) {
    return res.status(403).json({ message: "Only host/admin can settle round." });
  }

  const round = await GameRound.findOne({ _id: roundId, roomId, status: "open" });
  if (!round) return res.status(404).json({ message: "Open round not found." });
  const winners = round.bets.filter((bet) => bet.guess === n);

  for (const winnerBet of winners) {
    const reward = winnerBet.amount * round.multiplier;
    await mutateBalance({
      userId: winnerBet.userId,
      amount: reward,
      type: "credit",
      category: "game_reward",
      reason: `Lucky game reward ${n}`,
      metadata: { roomId, roundId, guess: n, multiplier: round.multiplier },
    });
  }

  round.status = "settled";
  round.luckyNumber = n;
  round.winners = winners.map((winner) => winner.userId);
  round.settledAt = new Date();
  await round.save();
  return res.json({ round, winnerCount: winners.length });
});

module.exports = { openLuckyRound, placeLuckyBet, settleLuckyRound };
