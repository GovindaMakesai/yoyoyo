const jwt = require("jsonwebtoken");
const { Room } = require("../models/Room");
const { RoomMessage } = require("../models/RoomMessage");
const { User } = require("../models/User");

const roomUsers = new Map();
const connectedUsers = new Map();

const safeUser = (socket) => ({
  id: socket.data.userId,
  name: socket.data.userName,
  socketId: socket.id,
});

const updateRoomParticipants = async (roomId, count) => {
  try {
    await Room.findByIdAndUpdate(roomId, { participants: count });
  } catch (_error) {
    // no-op
  }
};

const toRoomState = (roomDoc) => ({
  id: roomDoc._id,
  title: roomDoc.title,
  roomCode: roomDoc.roomCode,
  host: roomDoc.host,
  admins: roomDoc.admins,
  participants: roomDoc.participants,
  maxMembers: roomDoc.maxMembers,
  settings: roomDoc.settings,
  isLocked: roomDoc.isLocked,
});

const registerSocketHandlers = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = payload.sub;
      socket.data.userName = socket.handshake.auth?.name || "User";
      socket.data.role = "member";
      return next();
    } catch (_error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    connectedUsers.set(socket.data.userId, socket.id);

    socket.on("joinRoom", async ({ roomId }) => {
      if (!roomId) return;
      const room = await Room.findById(roomId);
      if (!room) return socket.emit("room:error", { roomId, message: "Room not found." });

      const isMember = room.members.some((memberId) => String(memberId) === String(socket.data.userId));
      if (!isMember) return socket.emit("room:error", { roomId, message: "Join room via API first." });
      socket.data.role =
        String(room.host) === String(socket.data.userId)
          ? "host"
          : room.admins.some((adminId) => String(adminId) === String(socket.data.userId))
            ? "admin"
            : "member";

      socket.join(roomId);
      const users = roomUsers.get(roomId) || [];
      const currentUser = safeUser(socket);
      if (!users.find((u) => u.id === currentUser.id)) {
        users.push(currentUser);
      }
      roomUsers.set(roomId, users);
      await updateRoomParticipants(roomId, users.length);
      io.to(roomId).emit("roomUsersUpdated", { roomId, users });
      io.to(roomId).emit("room:stateUpdated", { roomId, room: toRoomState(room) });
    });

    socket.on("leaveRoom", async ({ roomId }) => {
      if (!roomId) return;
      socket.leave(roomId);
      const users = (roomUsers.get(roomId) || []).filter((u) => u.socketId !== socket.id);
      roomUsers.set(roomId, users);
      await updateRoomParticipants(roomId, users.length);
      io.to(roomId).emit("roomUsersUpdated", { roomId, users });
    });

    socket.on("sendMessage", (message) => {
      if (!message?.roomId) return;
      const users = roomUsers.get(message.roomId) || [];
      if (!users.some((u) => String(u.id) === String(socket.data.userId))) return;

      const payload = {
        roomId: message.roomId,
        senderId: socket.data.userId,
        senderName: socket.data.userName,
        text: String(message.text || "").trim(),
        imageUrl: String(message.imageUrl || "").trim(),
        type: message.type || "text",
      };
      if (!payload.text && !payload.imageUrl) return;

      RoomMessage.create(payload).then((saved) => {
        io.to(message.roomId).emit("messageReceived", {
          id: saved._id,
          roomId: saved.roomId,
          senderId: saved.senderId,
          senderName: saved.senderName,
          text: saved.text,
          imageUrl: saved.imageUrl,
          type: saved.type,
          createdAt: saved.createdAt,
        });
      });
    });

    socket.on("room:broadcast", async ({ roomId, text }) => {
      if (!roomId || !text?.trim()) return;
      const room = await Room.findById(roomId);
      if (!room) return;
      const canBroadcast =
        socket.data.role === "host" || socket.data.role === "admin" || (await User.findById(socket.data.userId).select("vip")).vip?.isActive;
      if (!canBroadcast) return socket.emit("room:error", { roomId, message: "No permission for broadcast." });
      io.to(roomId).emit("messageReceived", {
        id: `broadcast_${Date.now()}`,
        roomId,
        senderId: socket.data.userId,
        senderName: socket.data.userName,
        text: `[Broadcast] ${text.trim()}`,
        type: "broadcast",
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("room:toggleLock", async ({ roomId, lockEnabled, lockPassword }) => {
      if (!roomId) return;
      const room = await Room.findById(roomId);
      if (!room) return;
      const isModerator =
        String(room.host) === String(socket.data.userId) ||
        room.admins.some((adminId) => String(adminId) === String(socket.data.userId));
      if (!isModerator) return;

      if (!lockEnabled) await room.setPassword(null);
      if (lockEnabled && lockPassword) await room.setPassword(String(lockPassword));
      await room.save();
      io.to(roomId).emit("room:stateUpdated", { roomId, room: toRoomState(room) });
    });

    socket.on("room:updateSettings", async ({ roomId, settings }) => {
      if (!roomId || !settings) return;
      const room = await Room.findById(roomId);
      if (!room) return;
      const isModerator =
        String(room.host) === String(socket.data.userId) ||
        room.admins.some((adminId) => String(adminId) === String(socket.data.userId));
      if (!isModerator) return;
      if (typeof settings.freeMode === "boolean") room.settings.freeMode = settings.freeMode;
      if (typeof settings.luckyNumberGameEnabled === "boolean") {
        room.settings.luckyNumberGameEnabled = settings.luckyNumberGameEnabled;
      }
      await room.save();
      io.to(roomId).emit("room:stateUpdated", { roomId, room: toRoomState(room) });
    });

    socket.on("typing", ({ roomId, userName, isTyping }) => {
      if (!roomId) return;
      socket.to(roomId).emit("typingUpdated", { roomId, userName, isTyping: Boolean(isTyping) });
    });

    socket.on("webrtc:signal", ({ roomId, targetUserId, signal }) => {
      if (!signal || !targetUserId) return;
      const peers = roomUsers.get(roomId) || [];
      const targetInRoom = peers.find((u) => u.id === targetUserId);
      const targetSocketId = targetInRoom?.socketId || connectedUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc:signal", {
          roomId,
          fromUserId: socket.data.userId,
          fromUserName: socket.data.userName,
          signal,
        });
      }
    });

    socket.on("call:invite", ({ targetUserId, roomId }) => {
      if (!targetUserId) return;
      const targetSocketId = connectedUsers.get(targetUserId);
      if (!targetSocketId) return;
      io.to(targetSocketId).emit("call:incoming", {
        fromUserId: socket.data.userId,
        fromUserName: socket.data.userName,
        roomId,
      });
    });

    socket.on("call:accept", ({ targetUserId, roomId }) => {
      const targetSocketId = connectedUsers.get(targetUserId);
      if (!targetSocketId) return;
      io.to(targetSocketId).emit("call:accepted", {
        fromUserId: socket.data.userId,
        fromUserName: socket.data.userName,
        roomId,
      });
    });

    socket.on("call:reject", ({ targetUserId }) => {
      const targetSocketId = connectedUsers.get(targetUserId);
      if (!targetSocketId) return;
      io.to(targetSocketId).emit("call:rejected", {
        fromUserId: socket.data.userId,
        fromUserName: socket.data.userName,
      });
    });

    socket.on("call:end", ({ targetUserId }) => {
      const targetSocketId = connectedUsers.get(targetUserId);
      if (!targetSocketId) return;
      io.to(targetSocketId).emit("call:ended", {
        fromUserId: socket.data.userId,
      });
    });

    socket.on("disconnect", async () => {
      connectedUsers.delete(socket.data.userId);
      for (const [roomId, users] of roomUsers.entries()) {
        const nextUsers = users.filter((u) => u.socketId !== socket.id);
        if (nextUsers.length !== users.length) {
          roomUsers.set(roomId, nextUsers);
          await updateRoomParticipants(roomId, nextUsers.length);
          io.to(roomId).emit("roomUsersUpdated", { roomId, users: nextUsers });
        }
      }
    });
  });
};

module.exports = { registerSocketHandlers };
