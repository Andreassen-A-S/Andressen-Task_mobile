import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import NativeSearchBar from "@/components/userView/common/NativeSearchBar";
import KeyboardSafeAreaSpacer from "@/components/userView/common/KeyboardSafeAreaSpacer";
import { colors } from "@/constants/colors";

const KEYBOARD_GAP = 8;

interface Props {
  placeholder?: string;
  onChangeText: (text: string) => void;
  onFocusChange?: (focused: boolean) => void;
  bottomInset: number;
}

export default function SearchBarOverlay({ placeholder = "Søg", onChangeText, onFocusChange, bottomInset }: Props) {
  return (
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <MaskedView
          style={{ flex: 1 }}
          maskElement={
            <LinearGradient
              colors={["transparent", "black", "black"]}
              locations={[0, 0.4, 1]}
              style={{ flex: 1 }}
            />
          }
        >
          <BlurView intensity={7.5} tint="light" style={{ flex: 1 }} />
        </MaskedView>
      </View>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <LinearGradient
          colors={[`${colors.eggWhite}00`, `${colors.eggWhite}CC`]}
          style={{ flex: 1 }}
        />
      </View>
      <NativeSearchBar placeholder={placeholder} onChangeText={onChangeText} onFocusChange={onFocusChange} />
      <KeyboardSafeAreaSpacer bottomInset={bottomInset} keyboardGap={KEYBOARD_GAP} />
    </View>
  );
}
