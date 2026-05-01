const express = require("express");
const { login, me, register, requestOtp, verifyOtp } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/otp/request", authLimiter, requestOtp);
router.post("/otp/verify", authLimiter, verifyOtp);
router.get("/me", authMiddleware, me);

module.exports = router;
