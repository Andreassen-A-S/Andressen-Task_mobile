import { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { AuthContext } from "@/contexts/AuthContext";
import { getUser } from "@/lib/api";
import { User } from "@/types/users";
import { colors } from "@/constants/colors";
import SingleAvatar from "@/components/userView/common/label/singleAvatar";
import PathHeader, { usePathHeaderHeight } from "@/components/userView/common/PathHeader";

export default function AccountSettingsPage() {
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const headerHeight = usePathHeaderHeight();

  useEffect(() => {
    if (!currentUser?.user_id) return;
    getUser(currentUser.user_id).then(setUserDetails).catch(() => {});
  }, [currentUser?.user_id]);

  const rows: { label: string; value: string | null | undefined }[] = [
    { label: "Navn", value: userDetails?.name ?? currentUser?.name },
    { label: "E-mail", value: userDetails?.email ?? currentUser?.email },
    { label: "Stilling", value: userDetails?.position?.name ?? "—" },
    { label: "Organisation", value: userDetails?.organization?.name ?? "—" },
  ];

  return (
    <View className="flex-1 bg-background">
      <PathHeader title="Konto" centered />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + 16, paddingBottom: 32, paddingHorizontal: 16, gap: 24 }}
      >
        <View className="items-center gap-3">
          <SingleAvatar
            name={userDetails?.name ?? currentUser?.name ?? "?"}
            imageUrl={userDetails?.profile_picture_url ?? currentUser?.profile_picture_url}
            size="xl"
          />
          <Text className="h4">{userDetails?.name ?? currentUser?.name}</Text>
        </View>

        <View className="bg-surface rounded-2xl overflow-hidden">
          {rows.map((row, i) => (
            <View key={row.label}>
              <View className="flex-row items-center px-4 py-4">
                <Text className="body-md flex-1" style={{ color: colors.textSecondary }}>{row.label}</Text>
                <Text className="body-md" style={{ color: colors.textPrimary }} numberOfLines={1}>{row.value ?? "—"}</Text>
              </View>
              {i < rows.length - 1 && <View className="h-px bg-border mx-4" />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
