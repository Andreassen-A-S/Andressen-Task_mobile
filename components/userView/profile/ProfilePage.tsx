import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
import ProfileHeader from "./ProfileHeader";

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

  if (!currentUser) {
    return (
      <SafeAreaView className="flex-1 bg-[#1B1D22]" edges={["top", "left", "right"]}>
        <View className="flex-1 bg-[#F6F5F1] w-full items-center justify-center">
          <ActivityIndicator size="large" color="#0f6e56" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#1B1D22]" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1 bg-[#F6F5F1]" showsVerticalScrollIndicator={false}>
        <ProfileHeader user={currentUser} position={userDetails?.position} />

        {/* Stats Cards */}
        <View className="px-5 pt-4">
          <View className="flex-row gap-2">
            <View className="flex-1 bg-white border border-[#E8E6E1] rounded-xl p-3">
              <Text className="text-2xl font-bold text-[#1B1D22]">
                {isLoading ? "—" : assignedToday || "0"}
              </Text>
              <Text className="text-xs font-bold uppercase tracking-widest text-gray-500">I dag</Text>
            </View>
            <View className="flex-1 bg-white border border-[#E8E6E1] rounded-xl p-3">
              <Text className="text-2xl font-bold text-[#2D9F6F]">
                {isLoading ? "—" : completedToday || "0"}
              </Text>
              <Text className="text-xs font-bold uppercase tracking-widest text-gray-500">Færdige</Text>
            </View>
            <View className="flex-1 bg-white border border-[#E8E6E1] rounded-xl p-3">
              <Text className="text-2xl font-bold text-[#D64545]">
                {isLoading ? "—" : stats?.overdue_tasks ?? "0"}
              </Text>
              <Text className="text-xs font-bold uppercase tracking-widest text-gray-500">Forfaldne</Text>
            </View>
          </View>
        </View>

        {/* This week */}
        <View className="px-5 pt-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Denne uge</Text>
          <View className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden">
            <View className="flex-row items-center px-4 py-3 border-b border-[#E8E6E1]">
              <View className="w-8 h-8 rounded-lg items-center justify-center bg-[#E8F7F0] mr-3">
                <Ionicons name="checkmark-circle-outline" size={16} color="#0f6e56" />
              </View>
              <Text className="text-sm font-medium flex-1 text-[#1B1D22]">Fuldførelsesrate</Text>
              <Text className="text-sm font-semibold text-[#1B1D22]">
                {isLoading ? "—" : `${stats?.weekly_stats?.completion_rate ?? "n/a"}%`}
              </Text>
            </View>
            <View className="flex-row items-center px-4 py-3 border-b border-[#E8E6E1]">
              <View className="w-8 h-8 rounded-lg items-center justify-center bg-[#F3F3F0] mr-3">
                <Ionicons name="calendar-outline" size={16} color="#6B7084" />
              </View>
              <Text className="text-sm font-medium flex-1 text-[#1B1D22]">Opgaver tildelt</Text>
              <Text className="text-sm font-semibold text-[#1B1D22]">
                {isLoading ? "—" : stats?.weekly_stats?.assigned_tasks ?? "n/a"}
              </Text>
            </View>
            <View className="flex-row items-center px-4 py-3">
              <View className="w-8 h-8 rounded-lg items-center justify-center bg-[#E8F7F0] mr-3">
                <Ionicons name="checkmark" size={16} color="#0f6e56" />
              </View>
              <Text className="text-sm font-medium flex-1 text-[#1B1D22]">Fuldført</Text>
              <Text className="text-sm font-semibold text-[#1B1D22]">
                {isLoading ? "—" : stats?.weekly_stats?.completed_tasks ?? "n/a"}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="px-5 pt-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Indstillinger</Text>
          <View className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden">
            <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-[#E8E6E1]">
              <View className="w-8 h-8 rounded-lg items-center justify-center bg-[#F3F3F0] mr-3">
                <Ionicons name="notifications-outline" size={16} color="#6B7084" />
              </View>
              <Text className="text-sm font-medium flex-1 text-[#1B1D22]">Notifikationer</Text>
              <Ionicons name="chevron-forward" size={14} color="#9DA1B4" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-[#E8E6E1]">
              <View className="w-8 h-8 rounded-lg items-center justify-center bg-[#F3F3F0] mr-3">
                <Ionicons name="moon-outline" size={16} color="#6B7084" />
              </View>
              <Text className="text-sm font-medium flex-1 text-[#1B1D22]">Tema</Text>
              <Text className="text-sm text-gray-400 mr-2">Lyst</Text>
              <Ionicons name="chevron-forward" size={14} color="#9DA1B4" />
            </TouchableOpacity>
            <View className="flex-row items-center px-4 py-3">
              <View className="w-8 h-8 rounded-lg items-center justify-center bg-[#F3F3F0] mr-3">
                <Ionicons name="person-outline" size={16} color="#6B7084" />
              </View>
              <Text className="text-sm font-medium flex-1 text-[#1B1D22]" numberOfLines={1}>
                {currentUser.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View className="px-5 pt-4 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="h-12 bg-transparent border border-[#D64545] rounded-xl flex-row items-center justify-center gap-2"
          >
            <Ionicons name="log-out-outline" size={18} color="#D64545" />
            <Text className="text-[#D64545] font-semibold">Log ud</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
