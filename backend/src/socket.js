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

    socket.on("joinRoom", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      socket.join(roomId);
      const users = addUserToRoom(roomId, {
        id: userId,
        socketId: socket.id,
        name: `User ${userId.slice(-4)}`,
      });

      io.to(roomId).emit("roomUsersUpdated", { roomId, users });
    });

    socket.on("leaveRoom", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      socket.leave(roomId);
      const users = removeUserFromRoom(roomId, socket.id);
      io.to(roomId).emit("roomUsersUpdated", { roomId, users });
    });

    socket.on("sendMessage", (message) => {
      if (!message?.roomId) {
        return;
      }
      io.to(message.roomId).emit("messageReceived", message);
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
