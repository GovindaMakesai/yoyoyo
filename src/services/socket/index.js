import { io } from "socket.io-client";
import { SOCKET_URL } from "../../utils/constants";

class SocketService {
  constructor() {
    this.socket = null;
    this.token = null;
    this.user = null;
    this.joinedRooms = new Set();
  }

  connect({ token, user }) {
    this.token = token;
    this.user = user;

    const auth = { token, name: user?.name };

    if (this.socket) {
      this.socket.auth = auth;
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      auth,
    });

    this.socket.on("connect", () => {
      this.joinedRooms.forEach((roomId) => {
        this.socket?.emit("joinRoom", { roomId });
      });
    });

    return this.socket;
  }

  disconnect() {
    if (!this.socket) {
      return;
    }

    this.socket.disconnect();
    this.socket = null;
    this.joinedRooms.clear();
    this.token = null;
    this.user = null;
  }

  joinRoom(roomId) {
    if (!roomId) {
      return;
    }
    this.joinedRooms.add(roomId);
    this.socket?.emit("joinRoom", { roomId });
  }

  leaveRoom(roomId) {
    if (!roomId) {
      return;
    }
    this.joinedRooms.delete(roomId);
    this.socket?.emit("leaveRoom", { roomId });
  }

  sendMessage(payload) {
    this.socket?.emit("sendMessage", payload);
  }

  sendBroadcast(payload) {
    this.socket?.emit("room:broadcast", payload);
  }

  toggleRoomLock(payload) {
    this.socket?.emit("room:toggleLock", payload);
  }

  updateRoomSettings(payload) {
    this.socket?.emit("room:updateSettings", payload);
  }

  emitTyping(payload) {
    this.socket?.emit("typing", payload);
  }

  sendSignal(payload) {
    this.socket?.emit("webrtc:signal", payload);
  }

  inviteCall(payload) {
    this.socket?.emit("call:invite", payload);
  }

  acceptCall(payload) {
    this.socket?.emit("call:accept", payload);
  }

  rejectCall(payload) {
    this.socket?.emit("call:reject", payload);
  }

  endCall(payload) {
    this.socket?.emit("call:end", payload);
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