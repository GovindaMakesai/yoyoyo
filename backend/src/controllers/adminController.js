const { User } = require("../models/User");
const { Room } = require("../models/Room");
const { asyncHandler } = require("../utils/asyncHandler");
const { mutateBalance } = require("../services/walletService");

const banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { days = 7 } = req.body || {};
  const until = new Date();
  until.setDate(until.getDate() + Number(days));
  const user = await User.findByIdAndUpdate(userId, { isBanned: true, bannedUntil: until }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json({ message: "User banned.", userId: user._id, bannedUntil: user.bannedUntil });
});

const unbanUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(userId, { isBanned: false, bannedUntil: null }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json({ message: "User unbanned.", userId: user._id });
});

const monitorRooms = asyncHandler(async (_req, res) => {
  const rooms = await Room.find().select("-passwordHash").sort({ participants: -1 }).limit(200);
  return res.json({ rooms });
});

const adjustCoins = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { amount, type, reason } = req.body || {};
  const n = Math.floor(Number(amount));
  if (!["credit", "debit"].includes(type) || !Number.isFinite(n) || n <= 0) {
    return res.status(400).json({ message: "Valid amount and type are required." });
  }

  const { user, transaction } = await mutateBalance({
    userId,
    amount: n,
    type,
    category: "admin_adjustment",
    reason: String(reason || "Admin adjustment"),
    metadata: { byAdmin: String(req.user._id) },
  });
  return res.json({ userId: user._id, coins: user.coins, transaction });
});

module.exports = { banUser, unbanUser, monitorRooms, adjustCoins };
