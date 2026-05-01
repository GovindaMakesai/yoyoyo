const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const WEBRTC_UNAVAILABLE_MESSAGE =
  "WebRTC native module is unavailable. Use a development build (expo run:android / ios).";

let cachedModule = null;
let moduleLoadTried = false;

const getWebRTCModule = () => {
  if (cachedModule) {
    return cachedModule;
  }

  if (moduleLoadTried) {
    return null;
  }

  moduleLoadTried = true;
  try {
    // Keep this lazy so Expo Go can still boot.
    // eslint-disable-next-line global-require
    cachedModule = require("react-native-webrtc");
    return cachedModule;
  } catch (_error) {
    return null;
  }
};

class WebRTCService {
  constructor() {
    this.localStream = null;
    this.peers = new Map();
  }

  async initLocalStream({ audio = true, video = true } = {}) {
    if (this.localStream) {
      return this.localStream;
    }

    const module = getWebRTCModule();
    if (!module?.mediaDevices) {
      throw new Error(WEBRTC_UNAVAILABLE_MESSAGE);
    }

    const { mediaDevices } = module;
    this.localStream = await mediaDevices.getUserMedia({
      audio,
      video,
    });
    return this.localStream;
  }

  isSupported() {
    const module = getWebRTCModule();
    return Boolean(module?.mediaDevices && module?.RTCPeerConnection);
  }

  getUnavailableMessage() {
    return WEBRTC_UNAVAILABLE_MESSAGE;
  }

  toggleAudio(enabled) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  toggleVideo(enabled) {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  async createPeer(userId, onIceCandidate) {
    if (this.peers.has(userId)) {
      return this.peers.get(userId);
    }

    const module = getWebRTCModule();
    if (!module?.RTCPeerConnection) {
      throw new Error(WEBRTC_UNAVAILABLE_MESSAGE);
    }

    const { RTCPeerConnection } = module;
    const peer = new RTCPeerConnection(rtcConfig);
    this.localStream?.getTracks().forEach((track) => {
      peer.addTrack(track, this.localStream);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    this.peers.set(userId, peer);
    return peer;
  }

  async createOffer(userId, onIceCandidate) {
    const peer = await this.createPeer(userId, onIceCandidate);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  }

  async handleRemoteOffer(userId, offer, onIceCandidate) {
    const module = getWebRTCModule();
    if (!module?.RTCSessionDescription) {
      throw new Error(WEBRTC_UNAVAILABLE_MESSAGE);
    }
    const { RTCSessionDescription } = module;
    const peer = await this.createPeer(userId, onIceCandidate);
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  }

  async handleRemoteAnswer(userId, answer) {
    const module = getWebRTCModule();
    if (!module?.RTCSessionDescription) {
      throw new Error(WEBRTC_UNAVAILABLE_MESSAGE);
    }
    const { RTCSessionDescription } = module;
    const peer = this.peers.get(userId);
    if (!peer) return;
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(userId, candidate) {
    const module = getWebRTCModule();
    if (!module?.RTCIceCandidate) {
      throw new Error(WEBRTC_UNAVAILABLE_MESSAGE);
    }
    const { RTCIceCandidate } = module;
    const peer = this.peers.get(userId);
    if (!peer) return;
    await peer.addIceCandidate(new RTCIceCandidate(candidate));
  }

  cleanup() {
    this.peers.forEach((peer) => peer.close());
    this.peers.clear();
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
  }
}

const webrtcService = new WebRTCService();
export default webrtcService;
