import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { appColors } from "../../../navigation/theme";
import socketService from "../../../services/socket";
import webrtcService from "../../../services/webrtc";
import { useAuthStore } from "../../../store";

const getCallRoomId = (a, b) => `call_${[String(a), String(b)].sort().join("_")}`;

const VideoCallScreen = ({ navigation, route }) => {
  const { user } = useAuthStore();
  const peerUserId = route.params?.peerUserId;
  const peerUserName = route.params?.peerUserName || "Participant";
  const isCaller = Boolean(route.params?.isCaller);
  const callType = route.params?.callType || "voice";
  const callRoomId = getCallRoomId(user?.id, peerUserId);
  const [micOn, setMicOn] = React.useState(true);
  const [cameraOn, setCameraOn] = React.useState(true);
  const [status, setStatus] = React.useState(isCaller ? "Ringing..." : "Connecting...");
  const [localStreamURL, setLocalStreamURL] = React.useState(null);
  const [remoteStreamURL, setRemoteStreamURL] = React.useState(null);
  const rtcModule = React.useMemo(() => {
    try {
      // eslint-disable-next-line global-require
      return require("react-native-webrtc");
    } catch (_error) {
      return null;
    }
  }, []);
  const RTCView = rtcModule?.RTCView;

  React.useEffect(() => {
    let mounted = true;

    const syncStreams = () => {
      setLocalStreamURL(webrtcService.getLocalStreamURL());
      setRemoteStreamURL(webrtcService.getRemoteStreamURL(peerUserId));
    };
    const unsubscribe = webrtcService.subscribe(syncStreams);

    const setup = async () => {
      if (!webrtcService.isSupported()) {
        throw new Error(webrtcService.getUnavailableMessage());
      }
      await webrtcService.initLocalStream({ audio: true, video: callType === "video" });
      syncStreams();
      if (isCaller) {
        const offer = await webrtcService.createOffer(peerUserId, (candidate) => {
          socketService.sendSignal({ roomId: callRoomId, targetUserId: peerUserId, signal: candidate });
        });
        socketService.sendSignal({ roomId: callRoomId, targetUserId: peerUserId, signal: offer });
        if (mounted) setStatus("Ringing...");
        return;
      }
      if (mounted) setStatus("Connecting...");
    };

    const onSignal = async ({ fromUserId, signal }) => {
      if (fromUserId !== peerUserId || !signal) return;
      if (signal.type === "offer") {
        const answer = await webrtcService.handleRemoteOffer(peerUserId, signal, (candidate) => {
          socketService.sendSignal({ roomId: callRoomId, targetUserId: peerUserId, signal: candidate });
        });
        socketService.sendSignal({ roomId: callRoomId, targetUserId: peerUserId, signal: answer });
        if (mounted) setStatus("Connected");
        return;
      }

      if (signal.type === "answer") {
        await webrtcService.handleRemoteAnswer(peerUserId, signal);
        if (mounted) setStatus("Connected");
        return;
      }

      if (signal.candidate) {
        await webrtcService.addIceCandidate(peerUserId, signal);
      }
    };

    const onCallEnded = ({ fromUserId }) => {
      if (fromUserId === peerUserId) {
        navigation.goBack();
      }
    };

    socketService.on("webrtc:signal", onSignal);
    socketService.on("call:ended", onCallEnded);
    setup().catch((error) => {
      setStatus(error?.message || "Failed to connect");
    });

    return () => {
      mounted = false;
      unsubscribe();
      socketService.off("webrtc:signal", onSignal);
      socketService.off("call:ended", onCallEnded);
      webrtcService.cleanup();
    };
  }, [callRoomId, callType, isCaller, navigation, peerUserId]);

  const endCall = () => {
    socketService.endCall({ targetUserId: peerUserId });
    webrtcService.cleanup();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {!webrtcService.isSupported() ? (
        <View style={styles.preview}>
          <Text style={styles.previewText}>Voice/Video calls are unavailable in Expo Go.</Text>
          <Text style={styles.previewSubText}>Use development build: expo run:android / expo run:ios</Text>
          <Pressable style={styles.endButton} onPress={() => navigation.goBack()}>
            <Text style={styles.controlText}>Back</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.preview}>
          {callType === "video" && RTCView ? (
            <>
              {remoteStreamURL ? (
                <RTCView streamURL={remoteStreamURL} style={styles.remoteVideo} objectFit="cover" />
              ) : (
                <View style={styles.waitingLayer}>
                  <Text style={styles.previewText}>Waiting for remote video...</Text>
                </View>
              )}
              {localStreamURL ? <RTCView streamURL={localStreamURL} style={styles.localVideo} objectFit="cover" /> : null}
            </>
          ) : (
            <Text style={styles.previewText}>{callType === "video" ? "Video stream active" : "Voice call connected"}</Text>
          )}
        </View>
      )}
      <Text style={styles.name}>{peerUserName}</Text>
      <Text style={styles.status}>{callType.toUpperCase()} • {status}</Text>

      {webrtcService.isSupported() ? (
        <View style={styles.footer}>
          <Pressable
            style={[styles.controlButton, !micOn && styles.controlOff]}
            onPress={() =>
              setMicOn((prev) => {
                webrtcService.toggleAudio(!prev);
                return !prev;
              })
            }
          >
            <Text style={styles.controlText}>{micOn ? "Mute" : "Unmute"}</Text>
          </Pressable>
          {callType === "video" ? (
            <Pressable
              style={[styles.controlButton, !cameraOn && styles.controlOff]}
              onPress={() =>
                setCameraOn((prev) => {
                  webrtcService.toggleVideo(!prev);
                  return !prev;
                })
              }
            >
              <Text style={styles.controlText}>{cameraOn ? "Camera Off" : "Camera On"}</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.endButton} onPress={endCall}>
            <Text style={styles.controlText}>End</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appColors.background, padding: 20 },
  preview: {
    flex: 1,
    borderRadius: 16,
    borderColor: appColors.border,
    borderWidth: 1,
    backgroundColor: appColors.card,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
  },
  localVideo: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 120,
    height: 170,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  waitingLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: { color: appColors.textSecondary },
  previewSubText: { color: appColors.textSecondary, fontSize: 12, marginTop: 8, marginBottom: 12, textAlign: "center" },
  name: { color: appColors.textPrimary, fontSize: 22, fontWeight: "700", marginTop: 16, textAlign: "center" },
  status: { color: appColors.textSecondary, fontSize: 14, textAlign: "center", marginTop: 8 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: appColors.primary,
    alignItems: "center",
  },
  controlOff: { backgroundColor: appColors.border },
  endButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: appColors.danger,
    alignItems: "center",
  },
  controlText: { color: "#FFFFFF", fontWeight: "700" },
});

export default VideoCallScreen;
