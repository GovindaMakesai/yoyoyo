const jwt = require("jsonwebtoken");

const signToken = (userId) => jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email || null,
  phone: user.phone || null,
  avatarUrl: user.avatarUrl || "",
  coins: user.coins,
  role: user.role,
  vip: user.vip,
  noble: user.noble,
});

module.exports = { signToken, sanitizeUser };
