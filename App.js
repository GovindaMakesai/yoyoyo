import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { darkNavigationTheme } from "./src/navigation/theme";
import { ToastProvider } from "./src/components";

const App = () => {
  return (
    <ToastProvider>
      <NavigationContainer theme={darkNavigationTheme}>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </ToastProvider>
  );
};

export default App;
