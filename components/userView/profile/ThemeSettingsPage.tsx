import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PathHeader, { usePathHeaderHeight } from "@/components/userView/common/PathHeader";
import { colors } from "@/constants/colors";

const OPTIONS = [
  { label: "Lyst", value: "light" },
  { label: "Mørkt", value: "dark" },
  { label: "Følg system", value: "system" },
];

const CURRENT = "light";

export default function ThemeSettingsPage() {
  const insets = useSafeAreaInsets();
  const headerHeight = usePathHeaderHeight();

  return (
    <View className="flex-1 bg-background">
      <PathHeader title="Tema" centered />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}
      >
        <View className="bg-surface rounded-2xl overflow-hidden">
          {OPTIONS.map((option, i) => (
            <View key={option.value}>
              <TouchableOpacity className="flex-row items-center px-4 py-4">
                <Text className="body-md flex-1">{option.label}</Text>
                {option.value === CURRENT && <Check size={22} color={colors.green} strokeWidth={2.4} />}
              </TouchableOpacity>
              {i < OPTIONS.length - 1 && <View className="h-px bg-border mx-4" />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
