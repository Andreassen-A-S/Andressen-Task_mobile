import { useState } from "react";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import { pickerStore } from "@/lib/pickerStore";
import { toDateParam, parseDateParam } from "@/helpers/helpers";
import { colors } from "@/constants/colors";
import ClearButton from "@/components/userView/common/buttons/ClearButton";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";

export default function DatePickerScreen() {
  const router = useRouter();
  const headerHeight = useModalHeaderHeight();
  const { title, selected } = useLocalSearchParams<{ title: string; selected: string }>();

  const [date, setDate] = useState(() => selected ? parseDateParam(selected) : new Date());

  const back = () => {
    pickerStore.clear();
    router.back();
  };

  const handleConfirm = () => {
    pickerStore.call(toDateParam(date));
    back();
  };

  const handleChange = (_: unknown, newDate?: Date) => {
    if (!newDate) return;
    setDate(newDate);
  };

  const handleClear = () => {
    pickerStore.call("");
    back();
  };

  return (
    <ModalScreen title={title} onClose={back} rightContent={<GlassIconButton systemName="checkmark" onPress={handleConfirm} size="lg" variant="active" />}>
      <View style={{ flex: 1, paddingTop: headerHeight + 16, alignItems: "center" }}>
        <DateTimePicker
          value={date}
          mode="date"
          display="inline"
          onChange={handleChange}
          accentColor={colors.green}
          style={{ backgroundColor: colors.eggWhite }}
        />
        <ClearButton label="Ryd dato" onPress={handleClear} />
      </View>
    </ModalScreen>
  );
}
