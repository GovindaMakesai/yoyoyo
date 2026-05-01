const { User } = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const { sanitizeUser } = require("../utils/auth");

const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatarUrl } = req.body || {};
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found." });

  if (name) user.name = String(name).trim();
  if (typeof avatarUrl === "string") user.avatarUrl = avatarUrl.trim();
  await user.save();
  return res.json({ user: sanitizeUser(user) });
});

module.exports = { updateProfile };
