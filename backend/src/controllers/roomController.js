const { Room } = require("../models/Room");
const { RoomMessage } = require("../models/RoomMessage");
const { asyncHandler } = require("../utils/asyncHandler");

const generateRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const canModerate = (room, userId) =>
  String(room.host) === String(userId) || room.admins.some((adminId) => String(adminId) === String(userId));

const listRooms = asyncHandler(async (_req, res) => {
  const rooms = await Room.find().select("-passwordHash").sort({ participants: -1, createdAt: -1 }).limit(100);
  return res.json({ rooms });
});

const createRoom = asyncHandler(async (req, res) => {
  const { title, maxMembers, lockPassword } = req.body || {};
  if (!title || String(title).trim().length < 3) {
    return res.status(400).json({ message: "Room title must be at least 3 characters." });
  }

  const room = await Room.create({
    title: String(title).trim(),
    roomCode: generateRoomCode(),
    host: req.user._id,
    admins: [],
    members: [req.user._id],
    maxMembers: Number(maxMembers) || 50,
    participants: 1,
    createdBy: req.user._id,
  });
  if (lockPassword) {
    await room.setPassword(String(lockPassword));
    await room.save();
  }

  return res.status(201).json({ room: await Room.findById(room._id).select("-passwordHash") });
});

const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { password } = req.body || {};
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });
  const userId = req.user._id;
  const alreadyMember = room.members.some((m) => String(m) === String(userId));

  if (!alreadyMember) {
    const isVipBypass = req.user.vip?.isActive && (req.user.vip?.endsAt ? req.user.vip.endsAt > new Date() : true);
    if (!isVipBypass && room.members.length >= room.maxMembers) {
      return res.status(400).json({ message: "Room is full." });
    }
    const isValidPassword = await room.verifyPassword(password);
    if (!isValidPassword) return res.status(403).json({ message: "Invalid room password." });
    room.members.push(userId);
    room.participants = room.members.length;
    await room.save();
  }

  return res.json({ room: await Room.findById(roomId).select("-passwordHash") });
});

const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });
  const userId = String(req.user._id);

  room.members = room.members.filter((memberId) => String(memberId) !== userId);
  room.admins = room.admins.filter((adminId) => String(adminId) !== userId);
  if (String(room.host) === userId && room.members.length > 0) {
    room.host = room.members[0];
  }
  room.participants = room.members.length;
  await room.save();
  return res.json({ room: await Room.findById(roomId).select("-passwordHash") });
});

const assignAdmin = asyncHandler(async (req, res) => {
  const { roomId, userId } = req.params;
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });
  if (String(room.host) !== String(req.user._id)) return res.status(403).json({ message: "Only host can assign admins." });
  if (!room.members.some((memberId) => String(memberId) === String(userId))) {
    return res.status(400).json({ message: "User is not in room." });
  }
  if (!room.admins.some((id) => String(id) === String(userId))) room.admins.push(userId);
  await room.save();
  return res.json({ room: await Room.findById(roomId).select("-passwordHash") });
});

const kickUser = asyncHandler(async (req, res) => {
  const { roomId, userId } = req.params;
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });
  if (!canModerate(room, req.user._id)) return res.status(403).json({ message: "No permission to kick user." });
  if (String(room.host) === String(userId)) return res.status(400).json({ message: "Host cannot be kicked." });
  room.members = room.members.filter((memberId) => String(memberId) !== String(userId));
  room.admins = room.admins.filter((adminId) => String(adminId) !== String(userId));
  room.participants = room.members.length;
  await room.save();
  return res.json({ room: await Room.findById(roomId).select("-passwordHash") });
});

const updateRoomSettings = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { freeMode, lockEnabled, lockPassword, luckyNumberGameEnabled } = req.body || {};
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });
  if (!canModerate(room, req.user._id)) return res.status(403).json({ message: "No permission to update room." });

  if (typeof freeMode === "boolean") room.settings.freeMode = freeMode;
  if (typeof luckyNumberGameEnabled === "boolean") room.settings.luckyNumberGameEnabled = luckyNumberGameEnabled;
  if (typeof lockEnabled === "boolean") {
    if (!lockEnabled) {
      await room.setPassword(null);
    } else if (lockPassword) {
      await room.setPassword(String(lockPassword));
    } else {
      return res.status(400).json({ message: "lockPassword required to enable lock." });
    }
  }
  await room.save();
  return res.json({ room: await Room.findById(roomId).select("-passwordHash") });
});

const listMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const messages = await RoomMessage.find({ roomId }).sort({ createdAt: -1 }).limit(100);
  return res.json({ messages: messages.reverse() });
});

module.exports = {
  listRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  assignAdmin,
  kickUser,
  updateRoomSettings,
  listMessages,
};
