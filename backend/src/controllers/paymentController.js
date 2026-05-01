const Razorpay = require("razorpay");
const crypto = require("crypto");
const { asyncHandler } = require("../utils/asyncHandler");
const { mutateBalance } = require("../services/walletService");

const COIN_PACKS = [
  { code: "coin_100", coins: 100, amountPaise: 10000 },
  { code: "coin_500", coins: 500, amountPaise: 45000 },
  { code: "coin_1000", coins: 1000, amountPaise: 80000 },
];

const getCoinPacks = asyncHandler(async (_req, res) => {
  return res.json({ packs: COIN_PACKS });
});

const createCoinOrder = asyncHandler(async (req, res) => {
  const { packCode } = req.body || {};
  const pack = COIN_PACKS.find((item) => item.code === packCode);
  if (!pack) return res.status(404).json({ message: "Coin pack not found." });

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const order = await razorpay.orders.create({
    amount: pack.amountPaise,
    currency: "INR",
    receipt: `coins_${req.user._id}_${Date.now()}`,
    notes: { userId: String(req.user._id), type: "coin_purchase", packCode: pack.code },
  });
  return res.json({ order, pack });
});

const verifyCoinPayment = asyncHandler(async (req, res) => {
  const { packCode, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  const pack = COIN_PACKS.find((item) => item.code === packCode);
  if (!pack || !orderId || !paymentId || !signature) {
    return res.status(400).json({ message: "Invalid payment payload." });
  }
  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");
  if (expectedSignature !== signature) return res.status(400).json({ message: "Invalid payment signature." });

  const { user, transaction } = await mutateBalance({
    userId: req.user._id,
    amount: pack.coins,
    type: "credit",
    category: "purchase",
    reason: `Purchased ${pack.coins} coins`,
    metadata: { orderId, paymentId, packCode: pack.code },
  });

  return res.json({ coins: user.coins, transaction, purchasedCoins: pack.coins });
});

module.exports = { getCoinPacks, createCoinOrder, verifyCoinPayment };
