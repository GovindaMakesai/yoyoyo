const roomUsers = new Map();

const getRoomUsers = (roomId) => roomUsers.get(roomId) || [];

const addUserToRoom = (roomId, user) => {
  const users = getRoomUsers(roomId);
  if (!users.find((item) => item.id === user.id)) {
    users.push(user);
  }
  roomUsers.set(roomId, users);
  return users;
};

const removeUserFromRoom = (roomId, socketId) => {
  const users = getRoomUsers(roomId).filter((user) => user.socketId !== socketId);
  roomUsers.set(roomId, users);
  return users;
};

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId || `guest_${socket.id}`;
    const userName = `User ${userId.slice(-4)}`;

    socket.on("joinRoom", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      socket.join(roomId);
      const users = addUserToRoom(roomId, {
        id: userId,
        socketId: socket.id,
        name: userName,
      });

      io.to(roomId).emit("roomUsersUpdated", { roomId, users });
      socket.to(roomId).emit("systemMessage", {
        id: `sys_${Date.now()}`,
        roomId,
        sender: "System",
        text: `${userName} joined the room`,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("leaveRoom", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      socket.leave(roomId);
      const users = removeUserFromRoom(roomId, socket.id);
      io.to(roomId).emit("roomUsersUpdated", { roomId, users });
      socket.to(roomId).emit("systemMessage", {
        id: `sys_${Date.now()}`,
        roomId,
        sender: "System",
        text: `${userName} left the room`,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("sendMessage", (message) => {
      if (!message?.roomId) {
        return;
      }
      io.to(message.roomId).emit("messageReceived", message);
    });

    socket.on("typing", ({ roomId, userName: typingUserName, isTyping }) => {
      if (!roomId) {
        return;
      }
      socket.to(roomId).emit("typingUpdated", {
        roomId,
        userName: typingUserName || userName,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("disconnect", () => {
      roomUsers.forEach((users, roomId) => {
        const nextUsers = users.filter((item) => item.socketId !== socket.id);
        if (nextUsers.length !== users.length) {
          roomUsers.set(roomId, nextUsers);
          io.to(roomId).emit("roomUsersUpdated", { roomId, users: nextUsers });
        }
      });
    });
  });
};

module.exports = { registerSocketHandlers };
