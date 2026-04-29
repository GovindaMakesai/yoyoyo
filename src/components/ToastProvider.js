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
            toast.type === "error" ? styles.error : styles.info,
            { opacity, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  info: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  error: {
    backgroundColor: "#3a1f28",
    borderColor: colors.danger,
  },
  text: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
  },
});
