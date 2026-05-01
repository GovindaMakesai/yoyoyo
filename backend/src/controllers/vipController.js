const Razorpay = require("razorpay");
const crypto = require("crypto");
const { VipPlan } = require("../models/VipPlan");
const { User } = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

const getVipPlans = asyncHandler(async (_req, res) => {
  const plans = await VipPlan.find({ isActive: true }).sort({ vipLevel: 1 });
  return res.json({ plans });
});

const createVipOrder = asyncHandler(async (req, res) => {
  const { planCode } = req.body || {};
  const plan = await VipPlan.findOne({ code: planCode, isActive: true });
  if (!plan) return res.status(404).json({ message: "VIP plan not found." });

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const order = await razorpay.orders.create({
    amount: plan.pricePaise,
    currency: "INR",
    receipt: `vip_${req.user._id}_${Date.now()}`,
    notes: { planCode, userId: String(req.user._id), type: "vip_subscription" },
  });
  return res.json({ order, plan });
});

const verifyVipPayment = asyncHandler(async (req, res) => {
  const { planCode, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  if (!planCode || !orderId || !paymentId || !signature) {
    return res.status(400).json({ message: "Missing payment verification fields." });
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");
  if (expectedSignature !== signature) return res.status(400).json({ message: "Invalid payment signature." });

  const plan = await VipPlan.findOne({ code: planCode, isActive: true });
  if (!plan) return res.status(404).json({ message: "VIP plan not found." });

  const user = await User.findById(req.user._id);
  const now = new Date();
  const currentEnd = user.vip?.endsAt && user.vip.endsAt > now ? new Date(user.vip.endsAt) : now;
  currentEnd.setDate(currentEnd.getDate() + plan.durationDays);

  user.vip = { level: plan.vipLevel, startsAt: user.vip?.startsAt || now, endsAt: currentEnd, isActive: true };
  await user.save();
  return res.json({ message: "VIP activated.", vip: user.vip });
});

module.exports = { getVipPlans, createVipOrder, verifyVipPayment };
