const mongoose = require("mongoose");

const otpCodeSchema = new mongoose.Schema(
  {
    channel: { type: String, enum: ["email", "phone"], required: true },
    identifier: { type: String, required: true, index: true, trim: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0, min: 0 },
    consumedAt: { type: Date },
  },
  { timestamps: true }
);

otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpCode = mongoose.model("OtpCode", otpCodeSchema);
module.exports = { OtpCode };
