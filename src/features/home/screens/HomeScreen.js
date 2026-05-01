import React from "react";
import {
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ROUTES } from "../../../navigation/routes";
import { appColors } from "../../../navigation/theme";
import { useToast } from "../../../components";
import { useAuthStore, useRoomStore, useWalletStore } from "../../../store";

const HomeScreen = ({ navigation }) => {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [roomTitle, setRoomTitle] = React.useState("");
  const [maxMembers, setMaxMembers] = React.useState("50");
  const [lockPassword, setLockPassword] = React.useState("");
  const { showToast } = useToast();
  const { user, logout, loading: authLoading } = useAuthStore();
  const { rooms, createRoom, selectRoom, loadRooms, loading: roomLoading, error } = useRoomStore();
  const { coins, loadWallet, claimDailyReward, loading: walletLoading } = useWalletStore();

  React.useEffect(() => {
    if (user) {
      loadRooms();
      loadWallet();
    }
  }, [user, loadRooms, loadWallet]);

  const handleOpenRoom = (room) => {
    selectRoom(room);
    navigation.navigate(ROUTES.Room, { roomId: room._id || room.id });
  };

  const handleCreateRoom = async () => {
    const title = roomTitle.trim() || `Room by ${user?.name || "Host"}`;
    const newRoom = await createRoom({
      title,
      maxMembers: Number(maxMembers) || 50,
      lockPassword: lockPassword.trim() || undefined,
    });
    if (newRoom) {
      setIsCreateOpen(false);
      setRoomTitle("");
      setLockPassword("");
      setMaxMembers("50");
      handleOpenRoom(newRoom);
      showToast("Room created");
      return;
    }
    showToast("Failed to create room.", "error");
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.Login }],
    });
  };

  const renderRoom = ({ item }) => (
    <Pressable style={styles.roomCard} onPress={() => handleOpenRoom(item)}>
      <View style={styles.roomTopRow}>
        <Text style={styles.roomEmoji}>🎙️</Text>
        <Text style={styles.roomTitle}>{item.title}</Text>
      </View>
      <Text style={styles.roomMeta}>{item.participants} listening</Text>
    </Pressable>
  );

  const handleClaimDaily = async () => {
    const result = await claimDailyReward();
    if (result?.rewardAmount) {
      showToast(`Daily reward +${result.rewardAmount} coins`);
      return;
    }
    if (!result) {
      showToast("Could not claim daily reward.", "error");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrap}>
      <View style={styles.heroCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Meet New Friends</Text>
            <Text style={styles.subtitle}>Welcome back, {user?.name || "Guest"} 👋</Text>
          </View>
          <TouchableOpacity
            style={[styles.logoutButton, authLoading ? styles.disabled : null]}
            onPress={handleLogout}
            disabled={authLoading}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Wallet</Text>
          <Text style={styles.walletCoins}>🪙 {coins}</Text>
          <Text style={styles.walletMeta}>
            VIP {user?.vip?.level || 0} • {user?.noble?.title || "Commoner"}
          </Text>
          <Pressable
            style={[styles.claimButton, walletLoading ? styles.disabled : null]}
            onPress={handleClaimDaily}
            disabled={walletLoading}
          >
            <Text style={styles.claimText}>{walletLoading ? "Processing..." : "Claim Daily Reward"}</Text>
          </Pressable>
        </View>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={() => setIsCreateOpen(true)}>
        <Text style={styles.createButtonText}>+ Create Room</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Join Chat Rooms</Text>
      <View style={styles.listContent}>
        {error ? <Text style={styles.emptyText}>{error}</Text> : null}
        {rooms.length === 0 ? <Text style={styles.emptyText}>No rooms yet.</Text> : null}
        {rooms.map((room) => (
          <View key={room._id || room.id}>{renderRoom({ item: room })}</View>
        ))}
      </View>

      <Modal visible={isCreateOpen} transparent animationType="fade" onRequestClose={() => setIsCreateOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Room</Text>
            <TextInput
              value={roomTitle}
              onChangeText={setRoomTitle}
              placeholder="Room title"
              placeholderTextColor={appColors.textSecondary}
              style={styles.input}
            />
            <TextInput
              value={maxMembers}
              onChangeText={setMaxMembers}
              placeholder="Max members (e.g. 50)"
              keyboardType="numeric"
              placeholderTextColor={appColors.textSecondary}
              style={styles.input}
            />
            <TextInput
              value={lockPassword}
              onChangeText={setLockPassword}
              placeholder="Room lock password (optional)"
              placeholderTextColor={appColors.textSecondary}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setIsCreateOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalCreate, roomLoading ? styles.disabled : null]}
                onPress={handleCreateRoom}
                disabled={roomLoading}
              >
                <Text style={styles.modalCreateText}>{roomLoading ? "Creating..." : "Create"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  contentWrap: {
    padding: 24,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: "#DDF8EF",
    borderRadius: 24,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#111827",
    fontSize: 36,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    color: "#4B5563",
    fontSize: 14,
  },
  walletCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
  },
  walletLabel: {
    color: "#14B8A6",
    fontSize: 14,
    fontWeight: "700",
  },
  walletCoins: {
    marginTop: 6,
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "700",
  },
  walletMeta: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
  claimButton: {
    marginTop: 10,
    backgroundColor: "#14B8A6",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  claimText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: appColors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  createButton: {
    marginTop: 18,
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    paddingTop: 12,
  },
  roomCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  roomTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomEmoji: {
    marginRight: 8,
    fontSize: 15,
  },
  roomTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
  },
  roomMeta: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
  emptyText: {
    color: appColors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
  },
  modalTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    color: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  modalCancel: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
  },
  modalCancelText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  modalCreate: {
    backgroundColor: "#7C3AED",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCreateText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.7,
  },
});

export default HomeScreen;
