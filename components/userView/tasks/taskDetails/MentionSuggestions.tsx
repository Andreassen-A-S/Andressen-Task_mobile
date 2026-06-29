import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import { User } from "@/types/users";
import SingleAvatar from "@/components/userView/common/label/singleAvatar";
import { colors } from "@/constants/colors";

interface Props {
  candidates: User[];
  onSelect: (user: User) => void;
}

export default function MentionSuggestions({ candidates, onSelect }: Props) {
  if (candidates.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        maxHeight: 280,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      <ScrollView
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {candidates.map((user, index) => (
          <TouchableOpacity
            key={user.user_id}
            onPress={() => onSelect(user)}
            className="flex-row items-center gap-3 px-4 py-3"
            style={index < candidates.length - 1
              ? { borderBottomWidth: 1, borderBottomColor: colors.border }
              : undefined}
          >
            <SingleAvatar
              name={user.name || user.email || "?"}
              imageUrl={user.profile_picture_url}
              size="sm"
            />
            <Text className="body-md">{user.name || user.email}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
