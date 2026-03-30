import { useState } from "react";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import ClearButton from "@/components/userView/common/buttons/ClearButton";
import { colors } from "@/constants/colors";

interface Props {
  title: string;
  value: Date | null;
  onConfirm: (date: Date | null) => void;
  onClose: () => void;
}

export default function DateSelectModal({ title, value, onConfirm, onClose }: Props) {
  const headerHeight = useModalHeaderHeight();
  const [date, setDate] = useState<Date>(value ?? new Date());

  return (
    <ModalScreen
      title={title}
      onClose={onClose}
      rightContent={
        <GlassIconButton systemName="checkmark" onPress={() => onConfirm(date)} size="lg" variant="active" />
      }
    >
      <View style={{ flex: 1, paddingTop: headerHeight + 16, alignItems: "center" }}>
        <DateTimePicker
          value={date}
          mode="date"
          display="inline"
          onChange={(_, newDate) => { if (newDate) setDate(newDate); }}
          accentColor={colors.green}
          style={{ backgroundColor: colors.eggWhite }}
        />
        <ClearButton label="Ryd dato" onPress={() => onConfirm(null)} />
      </View>
    </ModalScreen>
  );
}
