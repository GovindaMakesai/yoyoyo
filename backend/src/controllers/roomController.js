const { Room } = require("../models/Room");
const { asyncHandler } = require("../utils/asyncHandler");

const listRooms = asyncHandler(async (_req, res) => {
  const rooms = await Room.find().sort({ participants: -1, createdAt: -1 }).limit(100);
  return res.json({ rooms });
});

const createRoom = asyncHandler(async (req, res) => {
  const { title } = req.body || {};
  if (!title || String(title).trim().length < 3) {
    return res.status(400).json({ message: "Room title must be at least 3 characters." });
  }

  const room = await Room.create({
    title: String(title).trim(),
    createdBy: req.user._id,
  });

  return res.status(201).json({ room });
});

module.exports = { listRooms, createRoom };
