import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ROUTES } from "../../../navigation/routes";
import { appColors } from "../../../navigation/theme";
import { useAuthStore } from "../../../store";

const SplashScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { hydrateSession } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        setError("");
        setIsLoading(true);
        const sessionUser = await hydrateSession();
        await new Promise((resolve) => setTimeout(resolve, 900));

        if (isMounted) {
          navigation.replace(sessionUser ? ROUTES.Home : ROUTES.Login);
        }
      } catch (bootError) {
        if (isMounted) {
          setError("Failed to initialize app.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [hydrateSession, navigation]);

  const handleRetry = () => {
    setError("");
    setIsLoading(true);
    setTimeout(async () => {
      const sessionUser = await hydrateSession();
      navigation.replace(sessionUser ? ROUTES.Home : ROUTES.Login);
    }, 700);
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../../../assets/lives.png")} style={styles.logo} />
      <Text style={styles.title}>Voice Rooms</Text>
      <Text style={styles.subtitle}>Connecting voices in real-time</Text>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={appColors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: appColors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 20,
    marginBottom: 16,
  },
  subtitle: {
    color: appColors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 30,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: appColors.textSecondary,
    fontSize: 14,
    marginLeft: 10,
  },
  errorWrap: {
    marginTop: 18,
    alignItems: "center",
  },
  errorText: {
    color: appColors.danger,
    fontSize: 13,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: appColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  retryText: {
    color: appColors.textPrimary,
    fontWeight: "600",
  },
});

export default SplashScreen;
