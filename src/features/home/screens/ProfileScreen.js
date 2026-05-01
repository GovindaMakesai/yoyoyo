import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { appColors } from "../../../navigation/theme";
import { useToast } from "../../../components";
import { useAuthStore, useRoomStore, useWalletStore } from "../../../store";

const ProfileScreen = () => {
  const { user, updateProfile, loading: authLoading, error: authError } = useAuthStore();
  const { rooms } = useRoomStore();
  const { coins, addCoins, spendCoins, claimDailyReward, loadWallet, loading: walletLoading, error: walletError } =
    useWalletStore();
  const { showToast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [discoverable, setDiscoverable] = React.useState(true);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [displayName, setDisplayName] = React.useState(user?.name || "Voice User");
  const [bio, setBio] = React.useState(
    "Building communities through live voice rooms and real-time conversations."
  );

  const interests = ["Startups", "Music", "AI", "Design", "Tech Talks"];
  const recentRooms = rooms.slice(0, 3);

  React.useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  React.useEffect(() => {
    setDisplayName(user?.name || "Voice User");
  }, [user?.name]);

  React.useEffect(() => {
    if (authError) {
      showToast(authError, "error");
    }
  }, [authError, showToast]);

  React.useEffect(() => {
    if (walletError) {
      showToast(walletError, "error");
    }
  }, [showToast, walletError]);

  const handleSaveProfile = async () => {
    const success = await updateProfile({ name: displayName.trim() });
    if (success) {
      setIsEditOpen(false);
      showToast("Profile updated");
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Join me on YoYo Voice Rooms!\nUser: ${displayName || user?.name || "Voice User"}`,
      });
    } catch (_error) {
      showToast("Unable to open share dialog.", "error");
    }
  };

  const handleAddCoins = async () => {
    const success = await addCoins(50, "Profile top-up");
    if (success) showToast("Added 50 coins");
  };

  const handleSpendCoins = async () => {
    const success = await spendCoins(20, "Feature unlock");
    if (success) showToast("Spent 20 coins");
  };

  const handleClaimReward = async () => {
    const result = await claimDailyReward();
    if (result?.rewardAmount) {
      showToast(`Daily reward +${result.rewardAmount} coins`);
      return;
    }
    if (result) {
      showToast("Daily reward claimed");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrap}>
      <View style={styles.headerCard}>
        <Text style={styles.avatar}>🧑‍🚀</Text>
        <Text style={styles.name}>{displayName || user?.name || "Voice User"}</Text>
        <Text style={styles.handle}>
          @{(displayName || user?.name || "voice user").toLowerCase().replace(/\s+/g, "_")}
        </Text>
        <Text style={styles.bio}>{bio}</Text>
        <View style={styles.actionRow}>
          <Pressable style={styles.primaryAction} onPress={() => setIsEditOpen(true)}>
            <Text style={styles.primaryActionText}>Edit Profile</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={handleShareProfile}>
            <Text style={styles.secondaryActionText}>Share</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{Math.max(rooms.length * 3, 24)}</Text>
          <Text style={styles.statLabel}>Rooms Joined</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{coins}</Text>
          <Text style={styles.statLabel}>Coins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>322</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <Pressable style={styles.primaryAction} onPress={handleAddCoins} disabled={walletLoading}>
          <Text style={styles.primaryActionText}>Add 50</Text>
        </Pressable>
        <Pressable style={styles.secondaryAction} onPress={handleSpendCoins} disabled={walletLoading}>
          <Text style={styles.secondaryActionText}>Spend 20</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.chipsWrap}>
          {interests.map((interest) => (
            <View key={interest} style={styles.chip}>
              <Text style={styles.chipText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Rooms</Text>
        {recentRooms.length === 0 ? (
          <Text style={styles.emptyText}>You have not joined any rooms yet.</Text>
        ) : (
          recentRooms.map((room) => (
            <View key={room._id || room.id} style={styles.roomItem}>
              <View>
                <Text style={styles.roomTitle}>{room.title}</Text>
                <Text style={styles.roomMeta}>{room.participants} listening</Text>
              </View>
              <Text style={styles.roomBadge}>Live</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Push Notifications</Text>
            <Text style={styles.toggleHelp}>Get notified when followed hosts go live</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(value) => {
              setNotificationsEnabled(value);
              showToast(value ? "Notifications on" : "Notifications off");
            }}
            thumbColor={notificationsEnabled ? appColors.primary : "#A7AFC2"}
            trackColor={{ false: appColors.border, true: appColors.primaryMuted || appColors.primary }}
          />
        </View>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Discoverable Profile</Text>
            <Text style={styles.toggleHelp}>Allow others to find your profile in search</Text>
          </View>
          <Switch
            value={discoverable}
            onValueChange={(value) => {
              setDiscoverable(value);
              showToast(value ? "Profile is discoverable" : "Profile hidden from discovery");
            }}
            thumbColor={discoverable ? appColors.primary : "#A7AFC2"}
            trackColor={{ false: appColors.border, true: appColors.primaryMuted || appColors.primary }}
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.primaryAction} onPress={handleSaveProfile} disabled={authLoading}>
          <Text style={styles.primaryActionText}>{authLoading ? "Saving..." : "Save Profile"}</Text>
        </Pressable>
        <Pressable style={styles.secondaryAction} onPress={handleClaimReward} disabled={walletLoading}>
          <Text style={styles.secondaryActionText}>{walletLoading ? "Please wait..." : "Daily Reward"}</Text>
        </Pressable>
      </View>

      <Modal visible={isEditOpen} transparent animationType="fade" onRequestClose={() => setIsEditOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor={appColors.textSecondary}
              style={styles.input}
            />
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              placeholderTextColor={appColors.textSecondary}
              multiline
              style={[styles.input, styles.inputMultiline]}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalSecondary} onPress={() => setIsEditOpen(false)}>
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalPrimary} onPress={handleSaveProfile} disabled={authLoading}>
                <Text style={styles.modalPrimaryText}>{authLoading ? "Saving..." : "Save"}</Text>
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
    padding: 16,
    paddingBottom: 30,
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    alignItems: "center",
    padding: 18,
  },
  avatar: {
    fontSize: 64,
  },
  name: {
    marginTop: 8,
    color: appColors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  handle: {
    marginTop: 4,
    color: appColors.textSecondary,
    fontSize: 14,
  },
  bio: {
    marginTop: 12,
    color: appColors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  actionRow: {
    marginTop: 14,
    flexDirection: "row",
    width: "100%",
  },
  primaryAction: {
    flex: 1,
    backgroundColor: appColors.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
    marginRight: 6,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
    marginLeft: 6,
  },
  secondaryActionText: {
    color: appColors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
  },
  statsRow: {
    marginTop: 16,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    alignItems: "center",
    paddingVertical: 14,
    marginHorizontal: 4,
  },
  statNumber: {
    color: appColors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  statLabel: {
    marginTop: 4,
    color: appColors.textSecondary,
    fontSize: 12,
  },
  section: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    padding: 14,
  },
  sectionTitle: {
    color: appColors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: appColors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  roomItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  roomTitle: {
    color: appColors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  roomMeta: {
    color: appColors.textSecondary,
    marginTop: 3,
    fontSize: 12,
  },
  roomBadge: {
    color: appColors.success,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    color: appColors.textSecondary,
    fontSize: 13,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 12,
    backgroundColor: appColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  toggleLabel: {
    color: appColors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  toggleHelp: {
    color: appColors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    padding: 14,
  },
  modalTitle: {
    color: appColors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.surface,
    borderRadius: 10,
    color: appColors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  inputMultiline: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  modalSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  modalSecondaryText: {
    color: appColors.textSecondary,
    fontWeight: "600",
  },
  modalPrimary: {
    backgroundColor: appColors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default ProfileScreen;
