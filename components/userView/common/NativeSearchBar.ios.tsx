import { useRef, useState, useEffect } from "react";
import { Animated } from "react-native";
import { Host, HStack, Image, TextField, GlassEffectContainer, TextFieldRef } from "@expo/ui/swift-ui";
import { glassEffect, padding, textFieldStyle, frame, onTapGesture } from "@expo/ui/swift-ui/modifiers";

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
    <Animated.View style={[{ paddingTop: 8, paddingHorizontal: paddingAnim }]}>
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
                onTextChange={(t) => { setText(t); onChangeText(t); }}
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
  );
}
