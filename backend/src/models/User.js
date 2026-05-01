const mongoose = require("mongoose");

const userVipSchema = new mongoose.Schema(
  {
    level: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date },
    isActive: { type: Boolean, default: false },
  },
  { _id: false }
);

const userNobleSchema = new mongoose.Schema(
  {
    level: { type: Number, default: 0, min: 0 },
    title: { type: String, default: "Commoner" },
    totalCoinsSpent: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String },
    coins: { type: Number, default: 0, min: 0 },
    avatarUrl: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin", "super_admin"], default: "user" },
    vip: { type: userVipSchema, default: () => ({}) },
    noble: { type: userNobleSchema, default: () => ({}) },
    dailyReward: {
      lastClaimAt: { type: Date },
      streak: { type: Number, default: 0, min: 0 },
    },
    isBanned: { type: Boolean, default: false },
    bannedUntil: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = { User };
