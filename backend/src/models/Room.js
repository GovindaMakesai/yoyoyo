const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const voiceSeatSchema = new mongoose.Schema(
  {
    seatNumber: { type: Number, required: true, min: 1 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isMuted: { type: Boolean, default: false },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    roomCode: { type: String, required: true, unique: true, index: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxMembers: { type: Number, default: 50, min: 2, max: 1000 },
    participants: { type: Number, default: 0, min: 0 },
    isLocked: { type: Boolean, default: false },
    passwordHash: { type: String, default: "" },
    settings: {
      freeMode: { type: Boolean, default: true },
      luckyNumberGameEnabled: { type: Boolean, default: false },
      allowImageMessages: { type: Boolean, default: true },
    },
    voiceSeats: {
      type: [voiceSeatSchema],
      default: () => Array.from({ length: 8 }, (_, i) => ({ seatNumber: i + 1 })),
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

roomSchema.methods.setPassword = async function setPassword(password) {
  if (!password) {
    this.isLocked = false;
    this.passwordHash = "";
    return;
  }
  this.isLocked = true;
  this.passwordHash = await bcrypt.hash(password, 10);
};

roomSchema.methods.verifyPassword = async function verifyPassword(password) {
  if (!this.isLocked) return true;
  if (!password || !this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

const Room = mongoose.model("Room", roomSchema);
module.exports = { Room };
