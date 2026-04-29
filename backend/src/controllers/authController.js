const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

const signToken = (userId) => jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  coins: user.coins,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password || String(password).length < 6) {
    return res.status(400).json({ message: "Name, email and min 6-char password are required." });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    return res.status(409).json({ message: "Email already registered." });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: String(name).trim(),
    email: cleanEmail,
    password: hash,
  });

  const token = signToken(user._id);
  return res.status(201).json({ token, user: sanitizeUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
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

const me = asyncHandler(async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

module.exports = { register, login, me };
