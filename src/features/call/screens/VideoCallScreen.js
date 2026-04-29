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
  const callRoomId = getCallRoomId(user?.id, peerUserId);
  const [micOn, setMicOn] = React.useState(true);
  const [cameraOn, setCameraOn] = React.useState(true);
  const [status, setStatus] = React.useState(isCaller ? "Calling..." : "Connecting...");

  React.useEffect(() => {
    let mounted = true;

    const setup = async () => {
      await webrtcService.initLocalStream({ audio: true, video: true });
      if (isCaller) {
        const offer = await webrtcService.createOffer(peerUserId, (candidate) => {
          socketService.sendSignal({ roomId: callRoomId, targetUserId: peerUserId, signal: candidate });
        });
        socketService.sendSignal({ roomId: callRoomId, targetUserId: peerUserId, signal: offer });
      }
      if (mounted) {
        setStatus("In call");
      }
    };

    const onSignal = async ({ fromUserId, signal }) => {
      if (fromUserId !== peerUserId || !signal) return;
      if (signal.type === "offer") {
        const answer = await webrtcService.handleRemoteOffer(peerUserId, signal, (candidate) => {
          socketService.sendSignal({ roomId: callRoomId, targetUserId: peerUserId, signal: candidate });
        });
        socketService.sendSignal({ roomId: callRoomId, targetUserId: peerUserId, signal: answer });
        return;
      }

      if (signal.type === "answer") {
        await webrtcService.handleRemoteAnswer(peerUserId, signal);
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
    setup().catch(() => {
      setStatus("Failed to connect");
    });

    return () => {
      mounted = false;
      socketService.off("webrtc:signal", onSignal);
      socketService.off("call:ended", onCallEnded);
      webrtcService.cleanup();
    };
  }, [callRoomId, isCaller, navigation, peerUserId]);

  const endCall = () => {
    socketService.endCall({ targetUserId: peerUserId });
    webrtcService.cleanup();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        <Text style={styles.previewText}>Video stream active</Text>
      </View>
      <Text style={styles.name}>{peerUserName}</Text>
      <Text style={styles.status}>{status}</Text>

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
        <Pressable style={styles.endButton} onPress={endCall}>
          <Text style={styles.controlText}>End</Text>
        </Pressable>
      </View>
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
  },
  previewText: { color: appColors.textSecondary },
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
  controlText: { color: appColors.textPrimary, fontWeight: "700" },
});

export default VideoCallScreen;
