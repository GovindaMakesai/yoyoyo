const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const cors = require("cors");
const express = require("express");
const http = require("http");
const swaggerUi = require("swagger-ui-express");
const { Server } = require("socket.io");
const { connectDatabase } = require("./config/db");
const { swaggerSpec } = require("./config/swagger");
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
const API_ROUTE_INDEX = {
  health: ["GET /health"],
  auth: [
    "POST /auth/register",
    "POST /auth/login",
    "POST /auth/otp/request",
    "POST /auth/otp/verify",
    "GET /auth/me",
  ],
  profile: ["PATCH /profile"],
  rooms: [
    "GET /rooms",
    "POST /rooms",
    "POST /rooms/:roomId/join",
    "POST /rooms/:roomId/leave",
    "POST /rooms/:roomId/admins/:userId",
    "DELETE /rooms/:roomId/members/:userId",
    "PATCH /rooms/:roomId/settings",
    "GET /rooms/:roomId/messages",
  ],
  wallet: [
    "GET /wallet/balance",
    "POST /wallet/daily-reward/claim",
    "POST /wallet/add",
    "POST /wallet/spend",
    "GET /wallet/transactions",
  ],
  payments: [
    "GET /payments/coin-packs",
    "POST /payments/coin-order",
    "POST /payments/coin-verify",
  ],
  vip: ["GET /vip/plans", "POST /vip/order", "POST /vip/verify"],
  games: [
    "POST /games/:roomId/lucky-rounds",
    "POST /games/:roomId/lucky-rounds/:roundId/bets",
    "POST /games/:roomId/lucky-rounds/:roundId/settle",
  ],
  admin: [
    "GET /admin/rooms",
    "POST /admin/users/:userId/ban",
    "POST /admin/users/:userId/unban",
    "POST /admin/users/:userId/coins",
  ],
};

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(apiLimiter);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
  res.json({
    message: "Chateera backend running",
    docs: "/api",
    socketDocs: "/api/socket-events",
    swagger: "/swagger",
  });
});

app.get("/api", (_req, res) => {
  res.json({
    message: "Backend API route index",
    baseUrlExample: "http://localhost:4000",
    routes: API_ROUTE_INDEX,
  });
});

app.get("/api/socket-events", (_req, res) => {
  res.json({
    clientToServer: [
      "joinRoom",
      "leaveRoom",
      "sendMessage",
      "room:broadcast",
      "room:toggleLock",
      "room:updateSettings",
      "typing",
      "webrtc:signal",
      "call:invite",
      "call:accept",
      "call:reject",
      "call:end",
    ],
    serverToClient: [
      "roomUsersUpdated",
      "messageReceived",
      "typingUpdated",
      "room:stateUpdated",
      "room:error",
      "webrtc:signal",
      "call:incoming",
      "call:accepted",
      "call:rejected",
      "call:ended",
    ],
  });
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
