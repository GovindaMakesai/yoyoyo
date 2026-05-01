const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const { OtpCode } = require("../models/OtpCode");
const { asyncHandler } = require("../utils/asyncHandler");
const { sanitizeUser, signToken } = require("../utils/auth");

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body || {};
  if (!name || !password || String(password).length < 6 || (!email && !phone)) {
    return res.status(400).json({ message: "Name, password and email/phone are required." });
  }

  const cleanEmail = email ? String(email).toLowerCase().trim() : null;
  const cleanPhone = phone ? String(phone).trim() : null;
  const existing = await User.findOne({
    $or: [{ email: cleanEmail || undefined }, { phone: cleanPhone || undefined }],
  });
  if (existing) {
    return res.status(409).json({ message: "Email or phone already registered." });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: String(name).trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: hash,
  });

  const token = signToken(user._id);
  return res.status(201).json({ token, user: sanitizeUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body || {};
  if (!password || (!email && !phone)) {
    return res.status(400).json({ message: "Password and email/phone are required." });
  }

  const cleanEmail = email ? String(email).toLowerCase().trim() : null;
  const cleanPhone = phone ? String(phone).trim() : null;
  const user = await User.findOne({
    $or: [{ email: cleanEmail || undefined }, { phone: cleanPhone || undefined }],
  });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = signToken(user._id);
  return res.json({ token, user: sanitizeUser(user) });
});

const requestOtp = asyncHandler(async (req, res) => {
  const { channel, identifier } = req.body || {};
  if (!channel || !identifier || !["email", "phone"].includes(channel)) {
    return res.status(400).json({ message: "Valid channel and identifier are required." });
  }

  const normalizedIdentifier =
    channel === "email" ? String(identifier).toLowerCase().trim() : String(identifier).trim();
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OtpCode.create({ channel, identifier: normalizedIdentifier, code, expiresAt });
  // In production, integrate SMS/email provider. For now we return code in non-prod for testing.
  return res.json({
    message: "OTP sent.",
    ...(process.env.NODE_ENV !== "production" ? { otp: code } : {}),
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { channel, identifier, code, name } = req.body || {};
  if (!channel || !identifier || !code || !["email", "phone"].includes(channel)) {
    return res.status(400).json({ message: "channel, identifier and code are required." });
  }

  const normalizedIdentifier =
    channel === "email" ? String(identifier).toLowerCase().trim() : String(identifier).trim();
  const otpDoc = await OtpCode.findOne({
    channel,
    identifier: normalizedIdentifier,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpDoc) return res.status(400).json({ message: "OTP expired or invalid." });
  if (otpDoc.attempts >= 5) return res.status(429).json({ message: "Too many attempts." });
  if (otpDoc.code !== String(code)) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    return res.status(400).json({ message: "Invalid OTP." });
  }

  otpDoc.consumedAt = new Date();
  await otpDoc.save();

  let user = await User.findOne(
    channel === "email" ? { email: normalizedIdentifier } : { phone: normalizedIdentifier }
  );
  if (!user) {
    user = await User.create({
      name: String(name || "New User").trim(),
      ...(channel === "email" ? { email: normalizedIdentifier } : { phone: normalizedIdentifier }),
      password: await bcrypt.hash(generateOtp(), 10),
    });
  }

  const token = signToken(user._id);
  return res.json({ token, user: sanitizeUser(user) });
});

const me = asyncHandler(async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

module.exports = { register, login, requestOtp, verifyOtp, me };
