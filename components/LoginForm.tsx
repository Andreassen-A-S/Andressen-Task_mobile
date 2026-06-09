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
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/constants/colors";

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
    } catch (err) {
      const status = (err as { status?: number }).status;
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Super admin accounts")) {
        setError("Super admin-konti kan kun bruges i webportalen.");
      } else if (status === 401 || status === 403) {
        setError("Forkert e-mail eller adgangskode. Prøv igen.");
      } else {
        setError("Kunne ikke forbinde til serveren. Prøv igen senere.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !email.trim() || !password || isLoading;

  return (
    <SafeAreaView className="flex-1 bg-background">
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
            <Text className="h2">Andreassen TMS</Text>
            <Text className="mt-1 body-sm">Log ind for at fortsætte</Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="label-lg">E-mail</Text>
              <View
                className="flex-row items-center bg-white border-border border rounded-[10px] px-3"
                style={{ height: 48 }}
              >
                {/* height: 20 works around a Fabric stale-view bug that clips the TextInput after navigating away and back */}
                <View className="flex-1 flex-row items-center" style={{ height: 20 }}>
                  <Mail size={18} color={colors.textMuted} style={{ marginRight: 8 }} strokeWidth={2.2} />
                  <View className="flex-1">
                    {!email && (
                      <Text
                        className="label-lg-gray text-muted"
                        style={{ position: "absolute", lineHeight: undefined }}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        pointerEvents="none"
                        allowFontScaling={false}
                      >
                        navn@andreassen.dk
                      </Text>
                    )}
                    <TextInput
                      className="flex-1 label-lg-gray"
                      style={{ lineHeight: undefined }}
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
              <Text className="label-lg">Adgangskode</Text>
              <View
                className="flex-row items-center bg-white border-border border rounded-[10px] px-3"
                style={{ height: 48 }}
              >
                {/* height: 20 works around a Fabric stale-view bug that clips the TextInput after navigating away and back */}
                <View className="flex-1 flex-row items-center" style={{ height: 20 }}>
                  <Lock size={18} color={colors.textMuted} style={{ marginRight: 8 }} strokeWidth={2.2} />
                  <View className="flex-1">
                    {!password && (
                      <Text
                        className="label-lg-gray text-muted"
                        style={{ position: "absolute", lineHeight: undefined }}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        pointerEvents="none"
                        allowFontScaling={false}
                      >
                        ••••••••
                      </Text>
                    )}
                    <TextInput
                      className="flex-1 label-lg-gray"
                      style={{ lineHeight: undefined }}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      accessibilityLabel="Adgangskode"
                      textContentType="password"
                      autoComplete="current-password"
                      allowFontScaling={false}
                    />
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} className="p-1">
                  {showPassword
                    ? <EyeOff size={18} color={colors.textMuted} strokeWidth={2.2} />
                    : <Eye size={18} color={colors.textMuted} strokeWidth={2.2} />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <View className="bg-danger-surface border-danger-border border rounded-[10px] p-3">
                <Text className="body-sm text-danger text-center">
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
                <Text className="btn-lg" style={{ color: "white" }}>Log ind</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text className="body-sm text-muted text-center mt-6">
            Har du glemt dine loginoplysninger eller mangler du en konto?{"\n"}Kontakt din administrator.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
