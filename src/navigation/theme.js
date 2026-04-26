import { DarkTheme } from "@react-navigation/native";

export const appColors = {
  background: "#0B0D12",
  surface: "#121723",
  card: "#161C2B",
  textPrimary: "#F5F7FF",
  textSecondary: "#97A0B8",
  border: "#232A3A",
  primary: "#6C7CFF",
  success: "#35C48E",
  danger: "#FF6B6B",
};

export const darkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: appColors.background,
    card: appColors.card,
    text: appColors.textPrimary,
    border: appColors.border,
    primary: appColors.primary,
  },
};
