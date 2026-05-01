const mongoose = require("mongoose");

const vipPlanSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 1 },
    pricePaise: { type: Number, required: true, min: 100 },
    vipLevel: { type: Number, required: true, min: 1 },
    benefits: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const VipPlan = mongoose.model("VipPlan", vipPlanSchema);
module.exports = { VipPlan };
