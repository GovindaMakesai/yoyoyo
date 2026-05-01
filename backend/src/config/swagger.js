const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "YoYo Backend API",
    version: "1.0.0",
    description: "API docs for YoYo social chat backend",
  },
  servers: [{ url: "http://localhost:4000", description: "Local dev server" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const routeIndex = {
  "/health": { get: { tags: ["Health"], summary: "Health check", responses: { 200: { description: "OK" } } } },
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register user",
      responses: { 201: { description: "Registered" }, 400: { description: "Invalid payload" } },
    },
  },
  "/auth/login": {
    post: { tags: ["Auth"], summary: "Login user", responses: { 200: { description: "Logged in" } } },
  },
  "/auth/otp/request": {
    post: { tags: ["Auth"], summary: "Request OTP", responses: { 200: { description: "OTP sent" } } },
  },
  "/auth/otp/verify": {
    post: { tags: ["Auth"], summary: "Verify OTP", responses: { 200: { description: "OTP verified" } } },
  },
  "/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Current user profile",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "User profile" } },
    },
  },
  "/rooms": {
    get: { tags: ["Rooms"], summary: "List rooms", security: [{ bearerAuth: [] }], responses: { 200: { description: "Room list" } } },
    post: { tags: ["Rooms"], summary: "Create room", security: [{ bearerAuth: [] }], responses: { 201: { description: "Room created" } } },
  },
  "/rooms/{roomId}/join": {
    post: { tags: ["Rooms"], summary: "Join room", security: [{ bearerAuth: [] }], responses: { 200: { description: "Joined room" } } },
  },
  "/rooms/{roomId}/leave": {
    post: { tags: ["Rooms"], summary: "Leave room", security: [{ bearerAuth: [] }], responses: { 200: { description: "Left room" } } },
  },
  "/rooms/{roomId}/settings": {
    patch: {
      tags: ["Rooms"],
      summary: "Update room settings",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Settings updated" } },
    },
  },
  "/rooms/{roomId}/messages": {
    get: { tags: ["Rooms"], summary: "List room messages", security: [{ bearerAuth: [] }], responses: { 200: { description: "Messages" } } },
  },
  "/wallet/balance": {
    get: { tags: ["Wallet"], summary: "Get balance", security: [{ bearerAuth: [] }], responses: { 200: { description: "Balance" } } },
  },
  "/wallet/daily-reward/claim": {
    post: { tags: ["Wallet"], summary: "Claim daily reward", security: [{ bearerAuth: [] }], responses: { 200: { description: "Reward claimed" } } },
  },
  "/wallet/add": {
    post: { tags: ["Wallet"], summary: "Credit wallet", security: [{ bearerAuth: [] }], responses: { 200: { description: "Coins added" } } },
  },
  "/wallet/spend": {
    post: { tags: ["Wallet"], summary: "Spend wallet coins", security: [{ bearerAuth: [] }], responses: { 200: { description: "Coins spent" } } },
  },
  "/wallet/transactions": {
    get: { tags: ["Wallet"], summary: "Transaction history", security: [{ bearerAuth: [] }], responses: { 200: { description: "Transactions" } } },
  },
  "/payments/coin-packs": {
    get: { tags: ["Payments"], summary: "Coin packs", security: [{ bearerAuth: [] }], responses: { 200: { description: "Coin packs" } } },
  },
  "/payments/coin-order": {
    post: { tags: ["Payments"], summary: "Create coin Razorpay order", security: [{ bearerAuth: [] }], responses: { 200: { description: "Order created" } } },
  },
  "/payments/coin-verify": {
    post: { tags: ["Payments"], summary: "Verify coin payment", security: [{ bearerAuth: [] }], responses: { 200: { description: "Payment verified" } } },
  },
  "/vip/plans": {
    get: { tags: ["VIP"], summary: "List VIP plans", security: [{ bearerAuth: [] }], responses: { 200: { description: "VIP plans" } } },
  },
  "/vip/order": {
    post: { tags: ["VIP"], summary: "Create VIP order", security: [{ bearerAuth: [] }], responses: { 200: { description: "Order created" } } },
  },
  "/vip/verify": {
    post: { tags: ["VIP"], summary: "Verify VIP payment", security: [{ bearerAuth: [] }], responses: { 200: { description: "VIP activated" } } },
  },
  "/games/{roomId}/lucky-rounds": {
    post: { tags: ["Game"], summary: "Open lucky round", security: [{ bearerAuth: [] }], responses: { 201: { description: "Round opened" } } },
  },
  "/games/{roomId}/lucky-rounds/{roundId}/bets": {
    post: { tags: ["Game"], summary: "Place lucky bet", security: [{ bearerAuth: [] }], responses: { 200: { description: "Bet placed" } } },
  },
  "/games/{roomId}/lucky-rounds/{roundId}/settle": {
    post: { tags: ["Game"], summary: "Settle lucky round", security: [{ bearerAuth: [] }], responses: { 200: { description: "Round settled" } } },
  },
  "/admin/rooms": {
    get: { tags: ["Admin"], summary: "Monitor rooms", security: [{ bearerAuth: [] }], responses: { 200: { description: "Room monitor" } } },
  },
  "/admin/users/{userId}/ban": {
    post: { tags: ["Admin"], summary: "Ban user", security: [{ bearerAuth: [] }], responses: { 200: { description: "User banned" } } },
  },
  "/admin/users/{userId}/unban": {
    post: { tags: ["Admin"], summary: "Unban user", security: [{ bearerAuth: [] }], responses: { 200: { description: "User unbanned" } } },
  },
  "/admin/users/{userId}/coins": {
    post: { tags: ["Admin"], summary: "Adjust user coins", security: [{ bearerAuth: [] }], responses: { 200: { description: "Coins adjusted" } } },
  },
};

const swaggerSpec = swaggerJsdoc({
  definition: {
    ...swaggerDefinition,
    paths: routeIndex,
  },
  apis: [],
});

module.exports = { swaggerSpec };
