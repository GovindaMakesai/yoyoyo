const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Voice Social Backend API",
      version: "1.0.0",
      description: "HTTP APIs for rooms and service status.",
    },
    tags: [
      { name: "System", description: "Service health and diagnostics" },
      { name: "Rooms", description: "Room management APIs" },
    ],
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    components: {
      schemas: {
        Room: {
          type: "object",
          properties: {
            id: { type: "string", example: "room_1714058283629" },
            title: { type: "string", example: "Night Talks" },
            hostName: { type: "string", example: "Reyan" },
          },
        },
        CreateRoomBody: {
          type: "object",
          properties: {
            title: { type: "string", example: "Dev Chat" },
            hostName: { type: "string", example: "Govinda" },
          },
        },
      },
    },
  },
  apis: [],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_, res) => res.json(swaggerSpec));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || "*" } });

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    hostName: { type: String, required: true },
  },
  { timestamps: true },
);
const Room = mongoose.model("Room", roomSchema);
const participantsByRoom = new Map();
const memoryRooms = new Map();
let isMongoConnected = false;

const serializeRoom = (room) => ({
  id: room._id.toString(),
  title: room.title,
  hostName: room.hostName,
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service status
 */
app.get("/health", (_, res) => {
  res.json({ ok: true, mongoConnected: isMongoConnected });
});

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: List voice rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Rooms list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 */
app.get("/rooms", async (_, res) => {
  try {
    if (!isMongoConnected) {
      return res.json(Array.from(memoryRooms.values()).map(serializeRoom));
    }
    const rooms = await Room.find({}).sort({ createdAt: -1 }).lean();
    res.json(rooms.map(serializeRoom));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a voice room
 *     tags: [Rooms]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomBody'
 *     responses:
 *       201:
 *         description: Room created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 */
app.post("/rooms", async (req, res) => {
  try {
    const { title, hostName } = req.body;
    if (!isMongoConnected) {
      const room = {
        _id: `room_${Date.now()}`,
        title: title || "Untitled Room",
        hostName: hostName || "Host",
      };
      memoryRooms.set(room._id, room);
      return res.status(201).json(serializeRoom(room));
    }
    const room = await Room.create({
      title: title || "Untitled Room",
      hostName: hostName || "Host",
    });
    res.status(201).json(serializeRoom(room));
  } catch (error) {
    res.status(500).json({ message: "Failed to create room" });
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", async ({ roomId, userId }) => {
    const room = isMongoConnected
      ? await Room.findById(roomId).lean()
      : memoryRooms.get(roomId);
    if (!room) return;
    socket.join(roomId);
    if (!participantsByRoom.has(roomId)) {
      participantsByRoom.set(roomId, new Set());
    }
    participantsByRoom.get(roomId).add(userId);
    io.to(roomId).emit("participants", Array.from(participantsByRoom.get(roomId)));
  });

  socket.on("leave-room", async ({ roomId, userId }) => {
    const room = isMongoConnected
      ? await Room.findById(roomId).lean()
      : memoryRooms.get(roomId);
    if (!room) return;
    socket.leave(roomId);
    const participants = participantsByRoom.get(roomId);
    if (!participants) return;
    participants.delete(userId);
    io.to(roomId).emit("participants", Array.from(participants));
  });

  socket.on("send-message", ({ roomId, userName, text }) => {
    io.to(roomId).emit("message", { userName, text, createdAt: Date.now() });
  });
});

const port = Number(process.env.PORT || 3000);

const start = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      isMongoConnected = true;
      console.log("MongoDB connected.");
    } catch (error) {
      console.warn(`MongoDB unavailable, using in-memory rooms: ${error.message}`);
    }
  } else {
    console.warn("MONGODB_URI missing, using in-memory rooms.");
  }
  server.listen(port, () => {
    console.log(`voice-social backend listening on :${port}`);
  });
};

start().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});
