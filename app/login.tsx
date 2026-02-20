import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/users";
import { Ionicons } from "@expo/vector-icons";

const ROLE_OPTIONS = [
  {
    value: "USER" as UserRole,
    label: "Test Bruger",
    description: "Standard medarbejder adgang",
    icon: "person-outline" as const,
    color: "#3b82f6",
  },
  {
    value: "ADMIN" as UserRole,
    label: "Test Administrator",
    description: "Fuld system adgang",
    icon: "shield-checkmark-outline" as const,
    color: "#22c55e",
  },
];

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!selectedRole) return;
    try {
      setIsLoading(true);
      setError(null);
      await login(selectedRole);
    } catch {
      setError("Login fejlede. Prøv igen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-2xl bg-[#0f6e56] items-center justify-center mb-4">
            <Ionicons name="checkmark-done" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900">Andressen TMS</Text>
          <Text className="text-sm text-gray-500 mt-1">Vælg din rolle for at logge ind</Text>
        </View>

        {/* Role Selection */}
        <View className="gap-3 mb-6">
          {ROLE_OPTIONS.map((option) => {
            const isSelected = selectedRole === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedRole(option.value)}
                className={`flex-row items-center p-4 rounded-xl border-2 bg-white ${isSelected ? "border-[#0f6e56]" : "border-gray-200"
                  }`}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: option.color }}
                >
                  <Ionicons name={option.icon} size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900">{option.label}</Text>
                  <Text className="text-xs text-gray-500">{option.description}</Text>
                </View>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${isSelected ? "border-[#0f6e56] bg-[#0f6e56]" : "border-gray-300"
                    }`}
                >
                  {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <Text className="text-red-700 text-sm text-center">{error}</Text>
          </View>
        )}

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={!selectedRole || isLoading}
          className={`h-14 rounded-xl items-center justify-center ${!selectedRole || isLoading ? "bg-gray-300" : "bg-[#0f6e56]"
            }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {selectedRole === "ADMIN" ? "Log ind som Administrator" : selectedRole === "USER" ? "Log ind som Bruger" : "Vælg en rolle"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
