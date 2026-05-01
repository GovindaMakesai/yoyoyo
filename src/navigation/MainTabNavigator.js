import React from "react";
import { StyleSheet, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeScreen from "../features/home/screens/HomeScreen";
import ExploreScreen from "../features/home/screens/ExploreScreen";
import ActivityScreen from "../features/home/screens/ActivityScreen";
import ProfileScreen from "../features/home/screens/ProfileScreen";
import { appColors } from "./theme";

const Tab = createBottomTabNavigator();

const iconsByRoute = {
  Feed: "🏠",
  Explore: "🔍",
  Activity: "🔔",
  Profile: "👤",
};

const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: 62 + insets.bottom, paddingBottom: insets.bottom + 6 }],
        tabBarActiveTintColor: "#14B8A6",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => (
          <Text style={[styles.tabIcon, { color: focused ? appColors.textPrimary : color }]}>
            {iconsByRoute[route.name] || "•"}
          </Text>
        ),
      })}
    >
      <Tab.Screen
        name="Feed"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarLabel: "Explore" }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{ tabBarLabel: "Activity" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  tabIcon: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default MainTabNavigator;
