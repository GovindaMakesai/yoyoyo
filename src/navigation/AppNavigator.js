import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../features/splash/screens/SplashScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import MainTabNavigator from "./MainTabNavigator";
import RoomScreen from "../features/room/screens/RoomScreen";
import ChatScreen from "../features/chat/screens/ChatScreen";
import VideoCallScreen from "../features/call/screens/VideoCallScreen";
import { ROUTES } from "./routes";
import { appColors } from "./theme";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.Splash}
      screenOptions={{
        headerStyle: { backgroundColor: appColors.card },
        headerTintColor: appColors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: appColors.background },
      }}
    >
      <Stack.Screen
        name={ROUTES.Splash}
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.Login}
        component={LoginScreen}
        options={{ title: "Welcome" }}
      />
      <Stack.Screen
        name={ROUTES.Home}
        component={MainTabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name={ROUTES.Room} component={RoomScreen} options={{ title: "Room" }} />
      <Stack.Screen name={ROUTES.Chat} component={ChatScreen} options={{ title: "Chat" }} />
      <Stack.Screen name={ROUTES.VideoCall} component={VideoCallScreen} options={{ title: "Video Call" }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
