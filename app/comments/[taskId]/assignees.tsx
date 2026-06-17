import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { getTask, getUser } from "@/lib/api";
import { User } from "@/types/users";
import { colors } from "@/constants/colors";
import SingleAvatar from "@/components/userView/common/label/singleAvatar";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";

export default function AssigneesSheet() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [assignees, setAssignees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    (async () => {
      try {
        const task = await getTask(taskId);
        const ids = (task.assignment_users ?? []).map((u) => u.user_id);
        const users = await Promise.all(ids.map((id) => getUser(id).catch(() => null)));
        setAssignees(users.flatMap((u) => (u ? [u] : [])));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [taskId]);

  return (
    <View className="flex-1 bg-background" style={{ paddingBottom: insets.bottom }}>
      <View className="flex-row items-center px-4 pt-4 pb-5">
        <GlassIconButton icon={X} onPress={() => router.back()} size="lg" />
        <Text className="h4 flex-1 text-center mr-11">Tildelte</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.green} style={{ marginTop: 16 }} />
      ) : assignees.length === 0 ? (
        <Text className="body-sm text-muted px-4">Ingen tildelte</Text>
      ) : (
        assignees.map((u) => (
          <View key={u.user_id} className="flex-row items-center gap-3 px-4 py-3">
            <SingleAvatar name={u.name || u.email || "?"} imageUrl={u.profile_picture_url} size="md" />
            <View className="flex-1">
              <Text className="body-md">{u.name || u.email}</Text>
              {u.position?.name ? <Text className="body-xs text-muted">{u.position.name}</Text> : null}
            </View>
          </View>
        ))
      )}
    </View>
  );
}
