import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ROUTES } from "../../../navigation/routes";
import { appColors } from "../../../navigation/theme";
import { useAuthStore } from "../../../store";

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const { loading, error, loginWithPhoneMock, loginWithGoogleMock } = useAuthStore();

  const handleContinue = async () => {
    const success = await loginWithPhoneMock(phone);
    if (success) {
      navigation.replace(ROUTES.Home);
    }
  };

  const handleGooglePress = async () => {
    const success = await loginWithGoogleMock();
    if (success) {
      navigation.replace(ROUTES.Home);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome</Text>
      <Text style={styles.description}>Login with phone (mock) or Google (mock).</Text>

      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        placeholderTextColor={appColors.textSecondary}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Pressable
        onPress={handleContinue}
        style={[styles.button, loading ? styles.buttonDisabled : null]}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Please wait..." : "Login"}</Text>
      </Pressable>

      <Pressable
        onPress={handleGooglePress}
        style={[styles.googleButton, loading ? styles.buttonDisabled : null]}
        disabled={loading}
      >
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    padding: 24,
    justifyContent: "center",
  },
  heading: {
    color: appColors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
  },
  description: {
    marginTop: 10,
    marginBottom: 18,
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 12,
    backgroundColor: appColors.surface,
    color: appColors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: appColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  googleButton: {
    marginTop: 10,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: appColors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  googleButtonText: {
    color: appColors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 14,
    color: appColors.danger,
    fontSize: 13,
  },
});

export default LoginScreen;
