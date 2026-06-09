import { View, Text, ViewStyle } from "react-native";
import { colors } from "@/constants/colors";

interface Props {
  name: string;
  color?: string | null;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

const dimensions = { sm: 32, md: 44, lg: 44 };
const initialsClass = { sm: "initials-sm", md: "initials-lg", lg: "initials-lg" };

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
      <Text className={initialsClass[size]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
