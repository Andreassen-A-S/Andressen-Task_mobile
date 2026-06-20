import { useState, useCallback } from "react";
import { Platform, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { ExternalLink } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import { getTaskAttachments } from "@/lib/api";
import { TaskAttachment } from "@/types/comment";
import { colors } from "@/constants/colors";
import ModalScreen, { useCompactingModalHeader, useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import SearchBarOverlay from "@/components/userView/common/SearchBarOverlay";
import { getFileIconComponent } from "@/helpers/attachmentHelpers";

const SEARCHBAR_HEIGHT = Platform.OS === "ios" ? 56 : 64;

export default function TaskFiles() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const headerHeight = useModalHeaderHeight();
  const { headerStyle, headerPointerEvents, spacerStyle, handleFocusChange } = useCompactingModalHeader(headerHeight);

  const insets = useSafeAreaInsets();
  const [files, setFiles] = useState<TaskAttachment[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!taskId) return;
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await getTaskAttachments(taskId);
      setFiles(data.filter((a) => a.type === "FILE"));
    } catch {
      setFetchError("Kunne ikke hente filer");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useFocusEffect(useCallback(() => {
    fetchFiles();
  }, [fetchFiles]));

  const filtered = search.trim()
    ? files.filter((f) => (f.file_name ?? "").toLowerCase().includes(search.toLowerCase()))
    : files;

  return (
    <ModalScreen
      title="Filer"
      headerStyle={headerStyle}
      headerPointerEvents={headerPointerEvents}
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1" keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
        <View className="flex-1">
          <Animated.View style={spacerStyle} />
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.green} size="large" />
            </View>
          ) : fetchError ? (
            <View className="flex-1 items-center justify-center px-6">
              <View className="rounded-xl p-4 w-full items-center border bg-danger-surface border-danger-border">
                <Text className="body-sm text-danger-text text-center mb-3">{fetchError}</Text>
                <TouchableOpacity onPress={() => fetchFiles()} className="px-4 py-2 rounded-lg bg-danger">
                  <Text className="btn-md text-white">Prøv igen</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : files.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="body-sm text-muted-foreground">
                Ingen filer endnu.{"\n"}Send filer i kommentarerne.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.attachment_id}
              contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, gap: 8, paddingBottom: SEARCHBAR_HEIGHT + 20 + 16 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                (() => {
                  const FileIcon = getFileIconComponent(item.mime_type);
                  return (
                    <TouchableOpacity
                      onPress={() => WebBrowser.openBrowserAsync(item.url)}
                      activeOpacity={0.7}
                      className="flex-row items-center gap-3 bg-white rounded-xl border border-border py-3 px-4"
                    >
                      <FileIcon size={22} color={colors.textPrimary} strokeWidth={2.1} />
                      <View className="flex-1">
                        <Text className="body-sm" numberOfLines={1}>{item.file_name ?? "Fil"}</Text>
                        {item.created_at && (
                          <Text className="body-xs text-muted-foreground mt-0.5">
                            {new Date(item.created_at).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}
                          </Text>
                        )}
                      </View>
                      <ExternalLink size={16} color={colors.textMuted} strokeWidth={2.1} />
                    </TouchableOpacity>
                  );
                })()
              )}
            />
          )}
          {!isLoading && !fetchError && files.length > 0 && (
            <SearchBarOverlay placeholder="Søg i filer..." onChangeText={setSearch} onFocusChange={handleFocusChange} bottomInset={20} />
          )}
        </View>
      </KeyboardAvoidingView>
    </ModalScreen>
  );
}
