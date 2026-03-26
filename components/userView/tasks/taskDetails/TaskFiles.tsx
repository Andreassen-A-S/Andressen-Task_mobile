import { View, Text } from "react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import ModalScreen from "@/components/userView/common/ModalScreen";

interface Props {
  taskId: string;
}

export default function TaskFiles({ taskId }: Props) {
  return (
    <ModalScreen title="Filer">
      <View className="flex-1 items-center justify-center">
        <Text style={[typography.bodySm, { color: colors.textMuted }]}>Filer kommer snart</Text>
      </View>
    </ModalScreen>
  );
}
