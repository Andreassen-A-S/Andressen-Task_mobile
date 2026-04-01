import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import NativeSearchBar from "@/components/userView/common/NativeSearchBar";
import { getProjects } from "@/lib/api";
import { Project } from "@/types/project";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import ProjectAvatar from "@/components/userView/common/label/ProjectAvatar";

export default function AddProjectPicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setError("Kunne ikke hente projekter"))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = search.trim()
    ? projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : projects;

  return (
    <ModalScreen title="Tilføj en ny opgave" sub="Vælg et projekt">
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
            data={filtered}
            keyExtractor={(item) => item.project_id}
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 80 + insets.bottom, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <View style={{ height: 1, backgroundColor: colors.border }} />
            )}
            ListFooterComponent={() => (
              <View style={{ height: 1, backgroundColor: colors.border }} />
            )}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 72 }} />
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/tasks/add-task-form",
                    params: { projectId: item.project_id, projectName: item.name },
                  })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <View style={{ marginRight: 12 }}>
                  <ProjectAvatar name={item.name} color={item.color} size="md" />
                </View>
                <View style={{ flex: 1 }}>
                  {item.description ? (
                    <Text style={[typography.bodyXs, { marginBottom: 1 }]} numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                  <Text style={typography.h6} numberOfLines={1}>{item.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48 }}>
                <Text style={typography.bodySm}>Ingen projekter fundet</Text>
              </View>
            }
          />
        )}
      </View>

      <NativeSearchBar placeholder="Søg" onChangeText={setSearch} />
    </ModalScreen>
  );
}
