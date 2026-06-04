import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import NativeSearchBar from "@/components/userView/common/NativeSearchBar";
import KeyboardSafeAreaSpacer from "@/components/userView/common/KeyboardSafeAreaSpacer";
import { colors } from "@/constants/colors";

const KEYBOARD_GAP = 8;

interface Props {
  placeholder?: string;
  onChangeText: (text: string) => void;
  bottomInset: number;
}

export default function SearchBarOverlay({ placeholder = "Søg", onChangeText, bottomInset }: Props) {
  return (
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <LinearGradient
        colors={[`${colors.eggWhite}00`, colors.eggWhite]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      />
      <NativeSearchBar placeholder={placeholder} onChangeText={onChangeText} />
      <KeyboardSafeAreaSpacer bottomInset={bottomInset} keyboardGap={KEYBOARD_GAP} />
    </View>
  );
}
