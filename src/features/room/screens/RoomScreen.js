import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ROUTES } from "../../../navigation/routes";
import { appColors } from "../../../navigation/theme";
import { useToast } from "../../../components";
import socketService from "../../../services/socket";
import webrtcService from "../../../services/webrtc";
import { useAuthStore, useRoomStore } from "../../../store";

const RoomScreen = ({ navigation, route }) => {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [rtcError, setRtcError] = useState("");
  const [callType, setCallType] = useState("voice");
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const { rooms, activeRoom, clearActiveRoom, roomUsersById, updateRoomUsers, joinRoom, leaveRoom } = useRoomStore();
  const roomId = route.params?.roomId;

  const room = useMemo(
    () => activeRoom || rooms.find((item) => String(item._id || item.id) === String(roomId)) || null,
    [activeRoom, roomId, rooms]
  );

  const users = useMemo(() => roomUsersById[roomId] || [], [roomId, roomUsersById]);

  React.useEffect(() => {
    if (!roomId) {
      return;
    }

    joinRoom({ roomId }).then((joinedRoom) => {
      if (!joinedRoom) {
        showToast("Failed to join room.", "error");
        navigation.goBack();
      }
    });

    if (webrtcService.isSupported()) {
      webrtcService.initLocalStream({ audio: true, video: true }).catch(() => {
        setRtcError("Call setup failed. Check device permissions.");
      });
    }

    const onUsersUpdate = (payload) => {
      if (payload.roomId === roomId) {
        updateRoomUsers(roomId, payload.users || []);
      }
    };
    const onSignal = async ({ fromUserId, signal }) => {
      if (!fromUserId || !signal) {
        return;
      }
      if (!webrtcService.isSupported()) {
        return;
      }

      if (signal.type === "offer") {
        const answer = await webrtcService.handleRemoteOffer(fromUserId, signal, (candidate) => {
          socketService.sendSignal({ roomId, targetUserId: fromUserId, signal: candidate });
        });
        socketService.sendSignal({ roomId, targetUserId: fromUserId, signal: answer });
        return;
      }

      if (signal.type === "answer") {
        await webrtcService.handleRemoteAnswer(fromUserId, signal);
        return;
      }

      if (signal.candidate) {
        await webrtcService.addIceCandidate(fromUserId, signal);
      }
    };
    const onIncomingCall = (payload) => {
      setIncomingCall(payload);
    };
    const onCallAccepted = ({ fromUserId, fromUserName, callType: acceptedCallType }) => {
      if (!webrtcService.isSupported()) {
        setRtcError(webrtcService.getUnavailableMessage());
        return;
      }
      navigation.navigate(ROUTES.VideoCall, {
        peerUserId: fromUserId,
        peerUserName: fromUserName,
        callType: acceptedCallType || callType,
        isCaller: true,
      });
    };
    const onCallRejected = () => {
      setIncomingCall(null);
    };

    socketService.on("roomUsersUpdated", onUsersUpdate);
    socketService.on("webrtc:signal", onSignal);
    socketService.on("call:incoming", onIncomingCall);
    socketService.on("call:accepted", onCallAccepted);
    socketService.on("call:rejected", onCallRejected);
    socketService.joinRoom(roomId);
    return () => {
      socketService.off("roomUsersUpdated", onUsersUpdate);
      socketService.off("webrtc:signal", onSignal);
      socketService.off("call:incoming", onIncomingCall);
      socketService.off("call:accepted", onCallAccepted);
      socketService.off("call:rejected", onCallRejected);
      socketService.leaveRoom(roomId);
      leaveRoom({ roomId }).catch(() => null);
      webrtcService.cleanup();
    };
  }, [joinRoom, leaveRoom, navigation, roomId, showToast, updateRoomUsers]);

  const handleLeave = () => {
    if (roomId) {
      socketService.leaveRoom(roomId);
    }
    clearActiveRoom();
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.Home }],
    });
  };

  const handleOpenChat = () => {
    navigation.navigate(ROUTES.Chat, { roomId });
  };

  const handleStartCall = (member, nextCallType = "voice") => {
    if (!webrtcService.isSupported()) {
      setRtcError(webrtcService.getUnavailableMessage());
      return;
    }
    setCallType(nextCallType);
    socketService.inviteCall({ targetUserId: member.id, roomId, callType: nextCallType });
  };

  const handleAcceptIncoming = () => {
    if (!incomingCall?.fromUserId) {
      return;
    }
    if (!webrtcService.isSupported()) {
      setRtcError(webrtcService.getUnavailableMessage());
      setIncomingCall(null);
      return;
    }

    socketService.acceptCall({
      targetUserId: incomingCall.fromUserId,
      roomId,
      callType: incomingCall.callType || "voice",
    });
    navigation.navigate(ROUTES.VideoCall, {
      peerUserId: incomingCall.fromUserId,
      peerUserName: incomingCall.fromUserName,
      callType: incomingCall.callType || "voice",
      isCaller: false,
    });
    setIncomingCall(null);
  };

  const handleRejectIncoming = () => {
    if (incomingCall?.fromUserId) {
      socketService.rejectCall({ targetUserId: incomingCall.fromUserId });
    }
    setIncomingCall(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.roomTitle}>{room?.title || "Room"}</Text>
      <Text style={styles.sectionLabel}>Listeners & Speakers</Text>
      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeButton, callType === "voice" ? styles.modeButtonActive : null]}
          onPress={() => setCallType("voice")}
        >
          <Text style={[styles.modeText, callType === "voice" ? styles.modeTextActive : null]}>Voice Call</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, callType === "video" ? styles.modeButtonActive : null]}
          onPress={() => setCallType("video")}
        >
          <Text style={[styles.modeText, callType === "video" ? styles.modeTextActive : null]}>Video Call</Text>
        </Pressable>
      </View>
      {rtcError ? <Text style={styles.rtcError}>{rtcError}</Text> : null}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userName}>{item.name}</Text>
            {item.id !== user?.id ? (
              <Pressable
                style={[styles.callButton, !webrtcService.isSupported() ? styles.disabledButton : null]}
                onPress={() => handleStartCall(item)}
                disabled={!webrtcService.isSupported()}
              >
                <Text style={styles.buttonText}>{webrtcService.isSupported() ? `Call (${callType})` : "Dev build needed"}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      {incomingCall ? (
        <View style={styles.incomingCard}>
          <Text style={styles.userName}>{incomingCall.fromUserName} is calling...</Text>
          <View style={styles.row}>
            <Pressable style={styles.chatButton} onPress={handleAcceptIncoming}>
              <Text style={styles.buttonText}>Accept</Text>
            </Pressable>
            <Pressable style={styles.leaveButton} onPress={handleRejectIncoming}>
              <Text style={styles.buttonText}>Decline</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Pressable
          style={[styles.micButton, !micOn ? styles.micOff : null]}
          onPress={() =>
            setMicOn((prev) => {
              webrtcService.toggleAudio(!prev);
              return !prev;
            })
          }
        >
          <Text style={styles.buttonText}>{micOn ? "Mic On" : "Mic Off"}</Text>
        </Pressable>
        <Pressable
          style={[styles.chatButton, !cameraOn ? styles.micOff : null]}
          onPress={() =>
            setCameraOn((prev) => {
              webrtcService.toggleVideo(!prev);
              return !prev;
            })
          }
        >
          <Text style={styles.buttonText}>{cameraOn ? "Camera On" : "Camera Off"}</Text>
        </Pressable>

        <Pressable style={styles.chatButton} onPress={handleOpenChat}>
          <Text style={styles.buttonText}>Open Chat</Text>
        </Pressable>

        <Pressable style={styles.leaveButton} onPress={handleLeave}>
          <Text style={styles.buttonText}>Leave Room</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    padding: 24,
  },
  roomTitle: {
    color: appColors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  sectionLabel: {
    marginTop: 14,
    marginBottom: 10,
    color: appColors.textSecondary,
    fontSize: 14,
  },
  modeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: appColors.card,
    marginRight: 8,
  },
  modeButtonActive: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  modeText: {
    color: appColors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  modeTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 12,
  },
  userItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    color: appColors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    marginTop: "auto",
  },
  micButton: {
    backgroundColor: appColors.success,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
    marginBottom: 10,
  },
  micOff: {
    backgroundColor: appColors.border,
  },
  chatButton: {
    backgroundColor: appColors.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
    marginBottom: 10,
  },
  leaveButton: {
    backgroundColor: appColors.danger,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  callButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  incomingCard: {
    backgroundColor: appColors.card,
    borderColor: appColors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },
  rtcError: {
    color: appColors.warning,
    marginBottom: 8,
    fontSize: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default RoomScreen;
