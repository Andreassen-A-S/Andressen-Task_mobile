import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";
import { colors } from "@/constants/colors";

function RootGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inTabs = segments[0] === "(tabs)";
    if (!isAuthenticated && inTabs) {
      router.replace("/login");
    } else if (isAuthenticated && !inTabs) {
      router.replace("/(tabs)/tasks");
    }
  }, [isAuthenticated, isLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F5F1" }}>
        <ActivityIndicator size="large" color="#0f6e56" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.charcoal }}>
      <StatusBar style="light" />
      <AuthProvider>
        <RootGuard />
      </AuthProvider>
    </View>
  );
}
