import { DarkTheme } from "@react-navigation/native";
import { colors } from "../design";

export const appColors = {
  ...colors,
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
