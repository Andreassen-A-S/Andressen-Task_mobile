import { useState, useEffect } from "react";
import { Platform, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import SearchBarOverlay from "@/components/userView/common/SearchBarOverlay";
import { getProjects } from "@/lib/api";
import { Project } from "@/types/project";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import ProjectAvatar from "@/components/userView/common/label/ProjectAvatar";

const SEARCHBAR_HEIGHT = Platform.OS === "ios" ? 56 : 64;

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
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
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
              contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: SEARCHBAR_HEIGHT + insets.bottom + 16, flexGrow: 1 }}
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
          <SearchBarOverlay onChangeText={setSearch} bottomInset={insets.bottom} />
        </View>
      </KeyboardAvoidingView>
    </ModalScreen>
  );
}
