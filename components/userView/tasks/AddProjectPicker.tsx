import { useState, useEffect } from "react";
import { Platform, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import ModalScreen, { useCompactingModalHeader, useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import SearchBarOverlay from "@/components/userView/common/SearchBarOverlay";
import { getProjects } from "@/lib/api";
import { Project } from "@/types/project";
import { colors } from "@/constants/colors";
import ProjectAvatar from "@/components/userView/common/label/ProjectAvatar";

const SEARCHBAR_HEIGHT = Platform.OS === "ios" ? 56 : 64;

export default function AddProjectPicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight(true);
  const { headerStyle, headerPointerEvents, spacerStyle, handleFocusChange } = useCompactingModalHeader(headerHeight);
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
    <ModalScreen
      title="Tilføj en ny opgave"
      sub="Vælg et projekt"
      headerStyle={headerStyle}
      headerPointerEvents={headerPointerEvents}
    >
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
        <View className="flex-1">
          <Animated.View style={spacerStyle} />
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.green} />
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="body-sm text-center">{error}</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.project_id}
              contentContainerStyle={{ paddingBottom: SEARCHBAR_HEIGHT + insets.bottom + 16, flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={() => (
                <View className="h-px bg-border" />
              )}
              ListFooterComponent={() => (
                <View className="h-px bg-border" />
              )}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-border ml-[72px]" />
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/tasks/add-task-form",
                      params: { projectId: item.project_id, projectName: item.name },
                    })
                  }
                  className="flex-row items-center px-4 py-3"
                >
                  <View className="mr-3">
                    <ProjectAvatar name={item.name} color={item.color} size="md" />
                  </View>
                  <View className="flex-1">
                    {item.description ? (
                      <Text className="body-xs mb-px" numberOfLines={1}>
                        {item.description}
                      </Text>
                    ) : null}
                    <Text className="h6" numberOfLines={1}>{item.name}</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} strokeWidth={2.2} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center py-12">
                  <Text className="body-sm">Ingen projekter fundet</Text>
                </View>
              }
            />
          )}
          <SearchBarOverlay onChangeText={setSearch} onFocusChange={handleFocusChange} bottomInset={insets.bottom} />
        </View>
      </KeyboardAvoidingView>
    </ModalScreen>
  );
}
