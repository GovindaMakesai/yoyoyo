const jwt = require("jsonwebtoken");
const { Room } = require("../models/Room");

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
      return next();
    } catch (_error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    connectedUsers.set(socket.data.userId, socket.id);

    socket.on("joinRoom", async ({ roomId }) => {
      if (!roomId) return;

      socket.join(roomId);
      const users = roomUsers.get(roomId) || [];
      const currentUser = safeUser(socket);
      if (!users.find((u) => u.id === currentUser.id)) {
        users.push(currentUser);
      }
      roomUsers.set(roomId, users);
      await updateRoomParticipants(roomId, users.length);
      io.to(roomId).emit("roomUsersUpdated", { roomId, users });
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
      io.to(message.roomId).emit("messageReceived", message);
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
