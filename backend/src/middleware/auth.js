const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select(
      "_id name email phone avatarUrl coins role vip noble dailyReward isBanned bannedUntil"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    if (user.isBanned && (!user.bannedUntil || user.bannedUntil > new Date())) {
      return res.status(403).json({ message: "Your account is banned." });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permission." });
  }
  return next();
};

module.exports = { authMiddleware, requireRole };
