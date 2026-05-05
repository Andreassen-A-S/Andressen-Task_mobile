import { useRef, useState, useEffect } from "react";
import { Animated, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import { Host, HStack, Image, TextField, GlassEffectContainer, TextFieldRef } from "@expo/ui/swift-ui";
import { glassEffect, padding, textFieldStyle, frame, onTapGesture } from "@expo/ui/swift-ui/modifiers";
import { colors } from "@/constants/colors";

interface Props {
  placeholder?: string;
  onChangeText: (text: string) => void;
}

export default function NativeSearchBar({ placeholder = "Søg...", onChangeText }: Props) {
  const textFieldRef = useRef<TextFieldRef>(null);
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");
  const paddingAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(paddingAnim, {
      toValue: focused ? 16 : 30,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const paddingStyle = { paddingHorizontal: paddingAnim };

  const searchBarHeight = 56;

  const handleClearText = async () => {
    await textFieldRef.current?.setText("");
    setText("");
    onChangeText("");
  };

  const handleClose = async () => {
    setFocused(false);
    await textFieldRef.current?.setText("");
    await textFieldRef.current?.blur();
    setText("");
    onChangeText("");
  };

  return (
    <View style={{ height: searchBarHeight }}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <MaskedView
          style={{ flex: 1 }}
          maskElement={
            <LinearGradient
              colors={["transparent", "black", "black"]}
              locations={[0, 0.7, 1]}
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

      <Animated.View style={[{ paddingTop: 8 }, paddingStyle]}>
        <Host style={{ height: 48, alignSelf: "stretch" }}>
          <GlassEffectContainer spacing={8}>
            <HStack spacing={8} alignment="center">
              <HStack
                spacing={0}
                alignment="center"
                modifiers={[
                  frame({ maxWidth: 99999 }),
                  glassEffect({ glass: { variant: "regular", interactive: true }, shape: "capsule" }),
                ]}
              >
                <Image
                  systemName="magnifyingglass"
                  size={16}
                  color="gray"
                  modifiers={[padding({ vertical: 12, leading: 16, trailing: 8 })]}
                />
                <TextField
                  ref={textFieldRef}
                  placeholder={placeholder}
                  onValueChange={(t: string) => { setText(t); onChangeText(t); }}
                  onFocusChange={setFocused}
                  modifiers={[
                    textFieldStyle("plain"),
                    frame({ maxWidth: 99999 }),
                    padding({ vertical: 12, trailing: focused && text.length > 0 ? 8 : 16 }),
                  ]}
                />
                {focused && text.length > 0 && (
                  <Image
                    systemName="xmark.circle.fill"
                    size={18}
                    color="gray"
                    modifiers={[
                      padding({ vertical: 12, trailing: 16 }),
                      onTapGesture(handleClearText),
                    ]}
                  />
                )}
              </HStack>

              {focused && (
                <Image
                  systemName="xmark"
                  size={16}
                  modifiers={[
                    padding({ all: 16 }),
                    glassEffect({ glass: { variant: "regular", interactive: true }, shape: "circle" }),
                    onTapGesture(handleClose),
                  ]}
                />
              )}
            </HStack>
          </GlassEffectContainer>
        </Host>
      </Animated.View>
    </View>
  );
}
