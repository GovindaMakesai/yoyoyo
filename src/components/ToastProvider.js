import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../design";

const ToastContext = React.createContext({
  showToast: () => {},
});

export const useToast = () => React.useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = React.useState(null);
  const translateY = React.useRef(new Animated.Value(40)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  const showToast = React.useCallback((message, type = "info") => {
    setToast({ message, type });

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 40, duration: 180, useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, 1800);
  }, [opacity, translateY]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <Animated.View
          style={[
            styles.toast,
            toast.type === "error" ? styles.error : toast.type === "success" ? styles.success : styles.info,
            { opacity, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.icon}>{toast.type === "error" ? "⚠️" : toast.type === "success" ? "✅" : "ℹ️"}</Text>
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "92%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  info: {
    backgroundColor: "#F0FDFA",
    borderColor: "#99F6E4",
  },
  success: {
    backgroundColor: "#ECFDF3",
    borderColor: "#86EFAC",
  },
  error: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  icon: {
    fontSize: 13,
    marginRight: 8,
  },
  text: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
    flexShrink: 1,
  },
});
