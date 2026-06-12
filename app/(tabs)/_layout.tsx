import { Tabs } from "expo-router";
import { Calendar, ClipboardList, UserRound } from "lucide-react-native";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

const TAB_BAR_HEIGHT = 50;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.navInactive,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: TAB_BAR_HEIGHT + bottomInset,
          paddingBottom: bottomInset,
        },
        tabBarLabel: ({ focused, children }) => (
          <Text className={focused ? "nav-item-active" : "nav-item"}>
            {children}
          </Text>
        ),
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Opgaver",
          tabBarIcon: ({ color, size, focused }) => (
            <ClipboardList size={size} color={color} strokeWidth={focused ? 2.6 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Kalender",
          tabBarIcon: ({ color, size, focused }) => (
            <Calendar size={size} color={color} strokeWidth={focused ? 2.6 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <UserRound size={size} color={color} strokeWidth={focused ? 2.6 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
