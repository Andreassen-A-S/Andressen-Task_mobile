import { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    try {
      setIsLoading(true);
      setError(null);
      await login(email.trim(), password);
    } catch {
      setError("Forkert e-mail eller adgangskode. Prøv igen.");
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !email.trim() || !password || isLoading;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.eggWhite }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 justify-center px-6">
          {/* Logo */}
          <View className="items-center mb-10">
            <Image
              source={require("@/assets/icon.png")}
              style={{ width: 140, height: 70 }}
              resizeMode="contain"
              className="mb-2"
            />
            <Text style={typography.h2}>Andreassen TMS</Text>
            <Text style={[typography.bodySm, { marginTop: 4 }]}>Log ind for at fortsætte</Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <View className="gap-1.5">
              <Text style={typography.labelLg}>E-mail</Text>
              <View
                className="flex-row items-center bg-white border rounded-[10px] px-3 h-12"
                style={{ borderColor: colors.border }}
              >
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  className="flex-1"
                  style={[typography.labelLgGray, { lineHeight: undefined, textAlignVertical: "center" }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="navn@andreassen.dk"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View className="gap-1.5">
              <Text style={typography.labelLg}>Adgangskode</Text>
              <View
                className="flex-row items-center bg-white border rounded-[10px] px-3 h-12"
                style={{ borderColor: colors.border }}
              >
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  className="flex-1"
                  style={[typography.labelLgGray, { flex: 1, lineHeight: undefined, textAlignVertical: "center" }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} className="p-1">
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <View className="border rounded-[10px] p-3" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}>
                <Text style={[typography.bodySm, { color: colors.red, textAlign: "center" }]}>
                  {error}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isDisabled}
              className="h-[52px] rounded-[10px] items-center justify-center mt-1"
              style={{ backgroundColor: isDisabled ? colors.border : colors.green }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={[typography.btnLg, { color: "white" }]}>Log ind</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
