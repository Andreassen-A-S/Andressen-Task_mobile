import { View, Text } from "react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";

export default function TaskFiles() {
  const headerHeight = useModalHeaderHeight();
  return (
    <ModalScreen title="Filer">
      <View className="flex-1 items-center justify-center" style={{ paddingTop: headerHeight }}>
        <Text style={[typography.bodySm, { color: colors.textMuted }]}>Filer kommer snart</Text>
      </View>
    </ModalScreen>
  );
}
