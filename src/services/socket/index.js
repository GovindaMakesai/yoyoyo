import { io } from "socket.io-client";
import { SOCKET_URL } from "../../utils/constants";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        userId,
      },
    });

    return this.socket;
  }

  disconnect() {
    if (!this.socket) {
      return;
    }

    this.socket.disconnect();
    this.socket = null;
  }

  joinRoom(roomId) {
    this.socket?.emit("joinRoom", { roomId });
  }

  leaveRoom(roomId) {
    this.socket?.emit("leaveRoom", { roomId });
  }

  sendMessage(payload) {
    this.socket?.emit("sendMessage", payload);
  }

  on(eventName, callback) {
    this.socket?.on(eventName, callback);
  }

  off(eventName, callback) {
    this.socket?.off(eventName, callback);
  }
}

const socketService = new SocketService();
export default socketService;