import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { appColors } from "../../../navigation/theme";
import { useRoomStore } from "../../../store";

const ExploreScreen = () => {
  const { rooms } = useRoomStore();
  const [followed, setFollowed] = React.useState({});
  const creators = [
    "Queen M",
    "A&A",
    "Sara Live",
    "Twinkle",
    "Naina",
    "Anjali",
    "Pooja",
    "Riya",
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrap}>
      <Text style={styles.title}>Meet New Friends</Text>
      <View style={styles.recoCard}>
        <Text style={styles.recoTitle}>Recommended</Text>
        {creators.map((creator, index) => (
          <View key={creator} style={styles.creatorRow}>
            <View>
              <Text style={styles.creatorName}>👤 {creator}</Text>
              <Text style={styles.creatorTag}>YOYOFAM</Text>
            </View>
            <Pressable
              style={[styles.followButton, followed[creator] ? styles.following : null]}
              onPress={() => setFollowed((prev) => ({ ...prev, [creator]: !prev[creator] }))}
            >
              <Text style={[styles.followText, followed[creator] ? styles.followTextActive : null]}>
                {followed[creator] ? "Following" : "Follow"}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={styles.subtitle}>Trending rooms</Text>
      {rooms.map((room, index) => (
        <Pressable key={room._id || room.id || index} style={styles.card}>
          <Text style={styles.cardTitle}>🎙️ {room.title}</Text>
          <Text style={styles.cardMeta}>
            {room.participants || 0} listening • Host {index + 1}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DDF8EF",
  },
  contentWrap: {
    padding: 20,
    paddingBottom: 24,
  },
  title: {
    color: "#0F172A",
    fontSize: 44,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 12,
    marginBottom: 16,
    color: "#4B5563",
    fontSize: 14,
  },
  recoCard: {
    marginTop: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
  },
  recoTitle: {
    color: "#14B8A6",
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 8,
  },
  creatorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  creatorName: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  creatorTag: {
    color: "#0EA5E9",
    fontSize: 11,
    marginTop: 2,
  },
  followButton: {
    borderWidth: 1,
    borderColor: "#14B8A6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  following: {
    backgroundColor: "#14B8A6",
  },
  followText: {
    color: "#14B8A6",
    fontWeight: "700",
  },
  followTextActive: {
    color: "#FFFFFF",
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 15,
  },
  cardMeta: {
    color: "#6B7280",
    marginTop: 5,
    fontSize: 13,
  },
});

export default ExploreScreen;
