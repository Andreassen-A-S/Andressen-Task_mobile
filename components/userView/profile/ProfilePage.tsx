import { useContext, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PROFILE_HEADER_HEIGHT_BASE } from "@/components/userView/common/UserHeader";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Linking } from "react-native";
import { Bell, Calendar, Check, CheckCircle2, ChevronRight, ExternalLink, LogOut, Mail, Moon, Shield, UserRound } from "lucide-react-native";
import { AuthContext } from "@/contexts/AuthContext";
import { getMyStats, getUser, getUserAssignments } from "@/lib/api";
import { UserStats } from "@/types/stats";
import { User } from "@/types/users";
import { TaskAssignment } from "@/types/assignment";
import { formatNumber, getTodayAssignmentStats } from "@/helpers/helpers";
import UserHeader from "../common/UserHeader";
import { colors } from "@/constants/colors";

export default function ProfilePage() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const authContext = useContext(AuthContext);
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentUser = authContext?.user;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);

  const { assignedToday, completedToday } = getTodayAssignmentStats(assignments);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const [userData, statsData, assignmentsData] = await Promise.all([
          getUser(currentUser.user_id),
          getMyStats(),
          getUserAssignments(currentUser.user_id),
        ]);
        setUserDetails(userData);
        setStats(statsData);
        setAssignments(assignmentsData);
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentUser?.user_id]);

  const handleLogout = () => {
    Alert.alert("Log ud", "Er du sikker på at du vil logge ud?", [
      { text: "Annuller", style: "cancel" },
      { text: "Log ud", style: "destructive", onPress: () => authContext?.logout() },
    ]);
  };

  return (
    <View className="flex-1 bg-charcoal">
      <Animated.ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: top + PROFILE_HEADER_HEIGHT_BASE, paddingBottom: 32 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >

        {/* Stats Cards */}
        <View className="px-4 pt-4">
          <View className="flex-row gap-2">
            <View className="flex-1 bg-surface rounded-2xl p-3">
              <Text className="h3">
                {isLoading ? "—" : formatNumber(assignedToday || 0)}
              </Text>
              <Text className="label-sm uppercase">I dag</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-3">
              <Text className="h3 text-accent-mid">
                {isLoading ? "—" : formatNumber(completedToday || 0)}
              </Text>
              <Text className="label-sm uppercase">Færdige</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-3">
              <Text className="h3 text-danger">
                {isLoading ? "—" : formatNumber(stats?.overdue_tasks ?? 0)}
              </Text>
              <Text className="label-sm uppercase">Forfaldne</Text>
            </View>
          </View>
        </View>

        {/* This week */}
        <View className="px-4 pt-6">
          <Text className="body-md font-semibold !text-secondary mb-2">Denne uge</Text>
          <View className="bg-surface rounded-2xl overflow-hidden">
            <View className="flex-row items-center px-4 py-4">
              <View className="w-8 h-8 rounded-2xl items-center justify-center mr-3 bg-accent-surface">
                <CheckCircle2 size={16} color={colors.green} strokeWidth={2.2} />
              </View>
              <Text className="body-md flex-1">Fuldførelsesrate</Text>
              <Text className="mono-md">
                {isLoading ? "—" : stats?.weekly_stats?.completion_rate != null ? `${formatNumber(stats.weekly_stats.completion_rate)}%` : "n/a"}
              </Text>
            </View>
            <View className="h-px bg-border mx-4" />
            <View className="flex-row items-center px-4 py-4">
              <View className="w-8 h-8 rounded-2xl items-center justify-center mr-3 bg-surface-subtle">
                <Calendar size={16} color={colors.textSecondary} strokeWidth={2.2} />
              </View>
              <Text className="body-md flex-1">Opgaver tildelt</Text>
              <Text className="mono-md">
                {isLoading ? "—" : stats?.weekly_stats?.assigned_tasks != null ? formatNumber(stats.weekly_stats.assigned_tasks) : "n/a"}
              </Text>
            </View>
            <View className="h-px bg-border mx-4" />
            <View className="flex-row items-center px-4 py-4">
              <View className="w-8 h-8 rounded-2xl items-center justify-center mr-3 bg-accent-surface">
                <Check size={16} color={colors.green} strokeWidth={2.4} />
              </View>
              <Text className="body-md flex-1">Fuldført</Text>
              <Text className="mono-md">
                {isLoading ? "—" : stats?.weekly_stats?.completed_tasks != null ? formatNumber(stats.weekly_stats.completed_tasks) : "n/a"}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="px-4 pt-6">
          <Text className="body-md font-semibold !text-secondary mb-2">Indstillinger</Text>
          <View className="bg-surface rounded-2xl overflow-hidden">
            <TouchableOpacity className="flex-row items-center px-4 py-4" onPress={() => Linking.openSettings()}>
              <View className="w-8 h-8 rounded-2xl items-center justify-center mr-3 bg-surface-subtle">
                <Bell size={16} color={colors.textSecondary} strokeWidth={2.2} />
              </View>
              <Text className="body-md flex-1">Notifikationer</Text>
              <ChevronRight size={20} color={colors.textMuted} strokeWidth={2.2} />
            </TouchableOpacity>
            <View className="h-px bg-border mx-4" />
            <TouchableOpacity className="flex-row items-center px-4 py-4" onPress={() => router.push("/(tabs)/profile/theme")}>
              <View className="w-8 h-8 rounded-2xl items-center justify-center mr-3 bg-surface-subtle">
                <Moon size={16} color={colors.textSecondary} strokeWidth={2.2} />
              </View>
              <Text className="body-md flex-1">Tema</Text>
              <Text className="body-md !text-muted mr-2">Lyst</Text>
              <ChevronRight size={20} color={colors.textMuted} strokeWidth={2.2} />
            </TouchableOpacity>
            <View className="h-px bg-border mx-4" />
            <TouchableOpacity
              className="flex-row items-center px-4 py-4"
              onPress={() => router.push("/(tabs)/profile/account-settings")}
            >
              <View className="w-8 h-8 rounded-2xl items-center justify-center mr-3 bg-surface-subtle">
                <UserRound size={16} color={colors.textSecondary} strokeWidth={2.2} />
              </View>
              <Text className="body-md flex-1 text-muted" numberOfLines={1}>
                Konto
              </Text>
              <ChevronRight size={20} color={colors.textMuted} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal & Support */}
        <View className="px-4 pt-6">
          <Text className="body-md font-semibold !text-secondary mb-2">Support</Text>
          <View className="bg-surface rounded-2xl overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center px-4 py-4"
              onPress={() => Linking.openURL("https://www.mesterplan.app/legal/privacy")}
            >
              <View className="w-8 h-8 rounded-2xl items-center justify-center mr-3 bg-surface-subtle">
                <Shield size={16} color={colors.textSecondary} strokeWidth={2.2} />
              </View>
              <Text className="body-md flex-1">Privatlivspolitik</Text>
              <ExternalLink size={18} color={colors.textMuted} strokeWidth={2.2} />
            </TouchableOpacity>
            <View className="h-px bg-border mx-4" />
            <TouchableOpacity
              className="flex-row items-center px-4 py-4"
              onPress={() => Linking.openURL("mailto:henrikandreassen.ha@gmail.com")}
            >
              <View className="w-8 h-8 rounded-2xl items-center justify-center mr-3 bg-surface-subtle">
                <Mail size={16} color={colors.textSecondary} strokeWidth={2.2} />
              </View>
              <Text className="body-md flex-1">Kontakt support</Text>
              <ExternalLink size={18} color={colors.textMuted} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View className="px-4 pt-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="h-12 bg-surface rounded-2xl flex-row items-center justify-center gap-2"
          >
            <LogOut size={18} color={colors.red} strokeWidth={2.2} />
            <Text className="btn-lg text-danger">Log ud</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
      <UserHeader variant="profile" user={currentUser} position={userDetails?.position?.name ?? undefined} scrollY={scrollY} />
    </View>
  );
}
