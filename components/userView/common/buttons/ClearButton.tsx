import { Pressable, Text } from "react-native";

interface Props {
  label: string;
  onPress: () => void;
  className?: string;
  disabled?: boolean;
}

export default function ClearButton({ label, onPress, className, disabled }: Props) {
  return (
    <Pressable
      className={`flex px-5 py-4 rounded-2xl ${className ?? ""}`}
      onPress={disabled ? undefined : onPress}
    >
      <Text className={`ease-in body-md ${disabled ? "!text-muted" : "!text-danger"}`}>{label}</Text>
    </Pressable>
  );
}
