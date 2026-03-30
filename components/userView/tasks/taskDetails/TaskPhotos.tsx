import { View, Text } from "react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";

export default function TaskPhotos() {
  const headerHeight = useModalHeaderHeight();
  return (
    <ModalScreen title="Billeder">
      <View className="flex-1 items-center justify-center" style={{ paddingTop: headerHeight }}>
        <Text style={[typography.bodySm, { color: colors.textMuted }]}>Billeder kommer snart</Text>
      </View>
    </ModalScreen>
  );
}
