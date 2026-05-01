import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ROUTES } from "../../../navigation/routes";
import { appColors } from "../../../navigation/theme";
import { useToast } from "../../../components";
import { useAuthStore } from "../../../store";

const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const { loading, error, login, register } = useAuthStore();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
  }, [error, showToast]);

  const handleContinue = async () => {
    const payload = isRegister ? { name: name.trim(), email: email.trim(), password } : { email: email.trim(), password };
    const success = isRegister ? await register(payload) : await login(payload);
    if (success) {
      navigation.replace(ROUTES.Home);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome</Text>
      <Text style={styles.description}>{isRegister ? "Create account" : "Sign in"} with your email.</Text>

      {isRegister ? (
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={appColors.textSecondary}
          style={styles.input}
        />
      ) : null}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={appColors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={appColors.textSecondary}
        secureTextEntry
        style={styles.input}
      />

      <Pressable
        onPress={handleContinue}
        style={[styles.button, loading ? styles.buttonDisabled : null]}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Please wait..." : isRegister ? "Register" : "Login"}</Text>
      </Pressable>

      <Pressable
        onPress={() => setIsRegister((prev) => !prev)}
        style={[styles.googleButton, loading ? styles.buttonDisabled : null]}
        disabled={loading}
      >
        <Text style={styles.googleButtonText}>
          {isRegister ? "Already have an account? Login" : "New here? Register"}
        </Text>
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
    color: "#FFFFFF",
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
