import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";

interface Props {
  children: ReactNode;
}

const canUseGlass = isGlassEffectAPIAvailable();

export default function ComposerSurface({ children }: Props) {
  return (
    <View style={styles.container}>
      {canUseGlass ? (
        <GlassView
          pointerEvents="none"
          glassEffectStyle="regular"
          tintColor="rgba(255,255,255,0.14)"
          style={styles.glass}
        />
      ) : (
        <View pointerEvents="none" style={[styles.glass, styles.fallback]} />
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
  },
  glass: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  fallback: {
    backgroundColor: "rgba(255,255,255,0.68)",
  },
  content: {
    borderRadius: 24,
  },
});
