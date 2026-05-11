import { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export default function LoginForm() {
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
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View className="items-center mb-10">
            <Image
              source={require("@/assets/logo.png")}
              className="mb-2"
              style={{ height: 80, width: 150 }}
              resizeMode="contain"
            />
            <Text style={typography.h2}>Andreassen TMS</Text>
            <Text className="mt-1" style={typography.bodySm}>Log ind for at fortsætte</Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <View className="gap-1.5">
              <Text style={typography.labelLg}>E-mail</Text>
              <View
                className="flex-row items-center bg-white border rounded-[10px] px-3"
                style={{ borderColor: colors.border, height: 48 }}
              >
                {/* height: 20 works around a Fabric stale-view bug that clips the TextInput after navigating away and back */}
                <View className="flex-1 flex-row items-center" style={{ height: 20 }}>
                  <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <View className="flex-1">
                    {!email && (
                      <Text
                        style={[typography.labelLgGray, { position: "absolute", color: colors.textMuted, lineHeight: undefined }]}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        pointerEvents="none"
                        allowFontScaling={false}
                      >
                        navn@andreassen.dk
                      </Text>
                    )}
                    <TextInput
                      className="flex-1"
                      style={[typography.labelLgGray, { lineHeight: undefined }]}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoComplete="email"
                      returnKeyType="next"
                      accessibilityLabel="E-mail"
                      allowFontScaling={false}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View className="gap-1.5">
              <Text style={typography.labelLg}>Adgangskode</Text>
              <View
                className="flex-row items-center bg-white border rounded-[10px] px-3"
                style={{ borderColor: colors.border, height: 48 }}
              >
                {/* height: 20 works around a Fabric stale-view bug that clips the TextInput after navigating away and back */}
                <View className="flex-1 flex-row items-center" style={{ height: 20 }}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    className="flex-1"
                    style={[typography.labelLgGray, { lineHeight: undefined }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    accessibilityLabel="Adgangskode"
                    textContentType="password"
                    autoComplete="current-password"
                    allowFontScaling={false}
                  />
                </View>
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
              <View className="border rounded-[10px] p-3" style={{ backgroundColor: colors.redLight, borderColor: colors.redBorder }}>
                <Text className="text-center" style={[typography.bodySm, { color: colors.red }]}>
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

          <Text className="text-center mt-6" style={[typography.bodySm, { color: colors.textMuted }]}>
            Har du ikke en konto? Kontakt din administrator.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
