import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import NativeSearchBar from "@/components/userView/common/NativeSearchBar";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton.ios";
import { getUsers } from "@/lib/api";
import { assigneesStore } from "@/lib/assigneesStore";
import { User } from "@/types/users";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import SingleAvatar from "@/components/userView/common/label/singleAvatar";

type ListItem =
  | { type: "header"; title: string }
  | { type: "border"; id: string }
  | { type: "placeholder"; id: string }
  | { type: "divider"; id: string }
  | { type: "user"; user: User; isSelected: boolean; isLast: boolean };

export default function AddAssigneesPicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight(true);

  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<string[]>(() => assigneesStore.getInitial());
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => setError("Kunne ikke hente brugere"))
      .finally(() => setIsLoading(false));
  }, []);

  const add = (userId: string) => setSelected((prev) => [...prev, userId]);
  const remove = (userId: string) => setSelected((prev) => prev.filter((id) => id !== userId));

  const handleConfirm = () => {
    assigneesStore.call(selected);
    assigneesStore.clear();
    router.back();
  };

  const handleClose = () => {
    assigneesStore.clear();
    router.back();
  };

  const selectedUsers = users.filter((u) => selected.includes(u.user_id));
  const unselectedUsers = users
    .filter((u) => !selected.includes(u.user_id))
    .filter((u) => !search.trim() || u.name.toLowerCase().includes(search.toLowerCase()));

  const data: ListItem[] = [
    { type: "header", title: "Valgte" },
    { type: "border", id: "selected-top" },
    ...(selectedUsers.length === 0
      ? [{ type: "placeholder", id: "placeholder" } as ListItem]
      : selectedUsers.map((u, i) => ({ type: "user", user: u, isSelected: true, isLast: i === selectedUsers.length - 1 } as ListItem))),
    { type: "border", id: "selected-bottom" },
    { type: "divider", id: "divider" },
    { type: "border", id: "unselected-top" },
    ...unselectedUsers.map((u, i) => ({ type: "user", user: u, isSelected: false, isLast: i === unselectedUsers.length - 1 } as ListItem)),
    { type: "border", id: "unselected-bottom" },
  ];

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "header") {
      return (
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6, backgroundColor: colors.eggWhite }}>
          <Text style={typography.overline}>{item.title}</Text>
        </View>
      );
    }
    if (item.type === "border") {
      return <View style={{ height: 1, backgroundColor: colors.border }} />;
    }
    if (item.type === "placeholder") {
      return (
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.white }}>
          <Text style={[typography.bodySm, { color: colors.textMuted }]}>Ingen tildelt</Text>
        </View>
      );
    }
    if (item.type === "divider") {
      return <View style={{ height: 16, backgroundColor: colors.eggWhite }} />;
    }
    const { user, isSelected } = item;
    return (
      <TouchableOpacity
        onPress={() => isSelected ? remove(user.user_id) : add(user.user_id)}
        style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white }}
      >
        <View style={{ marginRight: 16 }}>
          <SingleAvatar name={user.name} size="lg" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={typography.h6} numberOfLines={1}>{user.name}</Text>
          {user.position ? <Text style={typography.bodyXs} numberOfLines={1}>{user.position}</Text> : null}
        </View>
        {isSelected
          ? <Ionicons name="close-circle" size={22} color={colors.textMuted} />
          : <Ionicons name="add-circle-outline" size={22} color={colors.green} />
        }
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: ListItem) => {
    if (item.type === "user") return item.user.user_id;
    if (item.type === "header") return `header-${item.title}`;
    return (item as { id: string }).id;
  };

  return (
    <ModalScreen
      title="Tildelt"
      onClose={handleClose}
      rightContent={
        <GlassIconButton variant="active" systemName="checkmark" onPress={handleConfirm} />
      }
    >
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={colors.green} />
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
            <Text style={[typography.bodySm, { textAlign: "center" }]}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + 80 }}
            ItemSeparatorComponent={({ leadingItem }) => {
              if (leadingItem.type !== "user" || leadingItem.isLast) return null;
              return (
                <View style={{ backgroundColor: colors.white }}>
                  <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 68 }} />
                </View>
              );
            }}
          />
        )}
      </View>
      <NativeSearchBar placeholder="Søg" onChangeText={setSearch} />
    </ModalScreen>
  );
}
