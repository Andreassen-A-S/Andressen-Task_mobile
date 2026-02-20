import { View, Text } from "react-native";
import { User } from "@/types/users";
import SingleAvatar from "../common/label/singleAvatar";

interface Props {
  user: User;
  position?: string;
}

export default function ProfileHeader({ user, position }: Props) {
  return (
    <View className="bg-[#1B1D22] px-5 pt-12 pb-6">
      <Text className="text-gray-400 text-xs uppercase tracking-widest mb-3 font-semibold">
        Andressen A/S · Task Management
      </Text>
      <View className="flex-row items-center gap-3">
        <SingleAvatar name={user.name} size="lg" />
        <View className="flex-1">
          <Text className="text-white text-xl font-bold" numberOfLines={1}>
            {user.name || "Ukendt bruger"}
          </Text>
          <Text className="text-gray-400 text-sm" numberOfLines={1}>
            {position || "Ukendt position"}
          </Text>
        </View>
      </View>
    </View>
  );
}
