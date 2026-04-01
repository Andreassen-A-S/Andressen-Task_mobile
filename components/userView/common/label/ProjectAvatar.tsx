import { View, Text, type ViewStyle } from "react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

interface Props {
  name: string;
  color?: string | null;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

const dimensions = { sm: 32, md: 44, lg: 44 };
const fontStyle = { sm: typography.initialsSm, md: typography.h6, lg: typography.h6 };

export default function ProjectAvatar({ name, color, size = "md" }: Props) {
  const dim = dimensions[size];
  return (
    <View style={{
      width: dim,
      height: dim,
      borderRadius: dim / 2,
      backgroundColor: color ?? colors.green,
      alignItems: "center",
      justifyContent: "center",
    }}>
      <Text style={[fontStyle[size], { color: colors.white }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
