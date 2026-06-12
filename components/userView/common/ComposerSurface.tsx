import { ReactNode } from "react";
import { View } from "react-native";
import { colors } from "@/constants/colors";

interface Props {
  children: ReactNode;
}

export default function ComposerSurface({ children }: Props) {
  return (
    <View
      className="bg-surface rounded-3xl border border-surface-subtle"
      style={{ backgroundColor: colors.surface, borderRadius: 24, elevation: 2 }}
    >
      {children}
    </View>
  );
}
