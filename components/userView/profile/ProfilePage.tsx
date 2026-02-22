import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/contexts/AuthContext";
import { getMyStats, getUser, getUserAssignments } from "@/lib/api";
import { UserStats } from "@/types/stats";
import { User } from "@/types/users";
import { TaskAssignment } from "@/types/assignment";
import { getTodayAssignmentStats } from "@/helpers/helpers";
import UserHeader from "../common/UserHeader";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

export default function ProfilePage() {
  const authContext = useContext(AuthContext);
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.charcoal }} edges={["left", "right"]}>
      <UserHeader variant="profile" user={currentUser} position={userDetails?.position} />
      <ScrollView className="flex-1" style={{ backgroundColor: colors.eggWhite }} showsVerticalScrollIndicator={false}>

        {/* Stats Cards */}
        <View className="px-5 pt-4">
          <View className="flex-row gap-2">
            <View className="flex-1 bg-white border rounded-lg p-3" style={{ borderColor: colors.border }}>
              <Text style={typography.h3}>
                {isLoading ? "—" : assignedToday || "0"}
              </Text>
              <Text style={typography.labelSmUppercase}>I dag</Text>
            </View>
            <View className="flex-1 bg-white border rounded-lg p-3" style={{ borderColor: colors.border }}>
              <Text style={[typography.h3, { color: colors.greenMid }]}>
                {isLoading ? "—" : completedToday || "0"}
              </Text>
              <Text style={typography.labelSmUppercase}>Færdige</Text>
            </View>
            <View className="flex-1 bg-white border rounded-lg p-3" style={{ borderColor: colors.border }}>
              <Text style={[typography.h3, { color: colors.red }]}>
                {isLoading ? "—" : stats?.overdue_tasks ?? "0"}
              </Text>
              <Text style={typography.labelSmUppercase}>Forfaldne</Text>
            </View>
          </View>
        </View>

        {/* This week */}
        <View className="px-5 pt-6">
          <Text style={typography.labelSmUppercase} className="mb-3">Denne uge</Text>
          <View className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: colors.border }}>
            <View className="flex-row items-center px-4 py-3 border-b" style={{ borderColor: colors.border }}  >
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: colors.greenLight }}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.green} />
              </View>
              <Text style={typography.labelLg} className="flex-1">Fuldførelsesrate</Text>
              <Text style={typography.monoMd}>
                {isLoading ? "—" : `${stats?.weekly_stats?.completion_rate ?? "n/a"}%`}
              </Text>
            </View>
            <View className="flex-row items-center px-4 py-3 border-b" style={{ borderColor: colors.border }}>
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: colors.muted }}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              </View>
              <Text style={typography.labelLg} className="flex-1">Opgaver tildelt</Text>
              <Text style={typography.monoMd}>
                {isLoading ? "—" : stats?.weekly_stats?.assigned_tasks ?? "n/a"}
              </Text>
            </View>
            <View className="flex-row items-center px-4 py-3">
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: colors.greenLight }}>
                <Ionicons name="checkmark" size={16} color={colors.green} />
              </View>
              <Text style={typography.labelLg} className="flex-1">Fuldført</Text>
              <Text style={typography.monoMd}>
                {isLoading ? "—" : stats?.weekly_stats?.completed_tasks ?? "n/a"}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="px-5 pt-6">
          <Text style={typography.labelSmUppercase} className="mb-3">Indstillinger</Text>
          <View className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: colors.border }}>
            <TouchableOpacity className="flex-row items-center px-4 py-3 border-b" style={{ borderColor: colors.border }}>
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: colors.muted }}>
                <Ionicons name="notifications-outline" size={16} color={colors.textSecondary} />
              </View>
              <Text style={typography.labelLg} className="flex-1">Notifikationer</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center px-4 py-3 border-b" style={{ borderColor: colors.border }}>
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: colors.muted }}>
                <Ionicons name="moon-outline" size={16} color={colors.textSecondary} />
              </View>
              <Text style={typography.labelLg} className="flex-1">Tema</Text>
              <Text style={typography.labelLgGray} className="mr-2">Lyst</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </TouchableOpacity>
            <View className="flex-row items-center px-4 py-3">
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: colors.muted }}>
                <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
              </View>
              <Text style={typography.labelLg} className="flex-1" numberOfLines={1}>
                {currentUser?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View className="px-5 pt-4 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="h-12 bg-transparent border rounded-lg flex-row items-center justify-center gap-2"
            style={{ borderColor: colors.red }}>
            <Ionicons name="log-out-outline" size={18} color={colors.red} />
            <Text style={[typography.btnLg, { color: colors.red }]}>Log ud</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
