const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { connectDatabase } = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const roomRouter = require("./routes/rooms");
const walletRouter = require("./routes/wallet");
const profileRouter = require("./routes/profile");
const vipRouter = require("./routes/vip");
const gameRouter = require("./routes/game");
const adminRouter = require("./routes/admin");
const paymentsRouter = require("./routes/payments");
const { apiLimiter } = require("./middleware/rateLimit");
const { registerSocketHandlers } = require("./sockets");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(apiLimiter);
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/rooms", roomRouter);
app.use("/wallet", walletRouter);
app.use("/profile", profileRouter);
app.use("/vip", vipRouter);
app.use("/games", gameRouter);
app.use("/admin", adminRouter);
app.use("/payments", paymentsRouter);

app.get("/", (_req, res) => {
  res.json({ message: "Voice social backend running" });
});

const PORT = process.env.PORT || 4000;
app.use(errorHandler);
registerSocketHandlers(io);

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it to backend/.env");
  }
  await connectDatabase();
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
