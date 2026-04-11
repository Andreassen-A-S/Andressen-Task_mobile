import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTaskAttachments } from "@/lib/api";
import { TaskAttachment } from "@/types/comment";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import NativeSearchBar from "@/components/userView/common/NativeSearchBar";

function getFileIcon(mimeType: string | null): string {
  if (!mimeType) return "document-outline";
  if (mimeType === "application/pdf") return "document-text-outline";
  if (mimeType.includes("word") || mimeType.includes("document")) return "document-outline";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "grid-outline";
  return "document-outline";
}

export default function TaskFiles() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const headerHeight = useModalHeaderHeight();

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
    <ModalScreen title="Filer">
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: headerHeight }}>
            <ActivityIndicator color={colors.green} size="large" />
          </View>
        ) : fetchError ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: headerHeight, paddingHorizontal: 24 }}>
            <View style={{ borderRadius: 12, padding: 16, width: "100%", alignItems: "center", borderWidth: 1, backgroundColor: colors.redLight, borderColor: colors.redBorder }}>
              <Text style={[typography.bodySm, { color: colors.redText, textAlign: "center", marginBottom: 12 }]}>{fetchError}</Text>
              <TouchableOpacity onPress={() => fetchFiles()} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.red }}>
                <Text style={typography.btnMdWhite}>Prøv igen</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : files.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: headerHeight }}>
            <Text style={[typography.bodySm, { color: colors.textMuted }]}>
              Ingen filer endnu.{"\n"}Send filer i kommentarerne.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.attachment_id}
            contentContainerStyle={{ paddingTop: headerHeight + 16, paddingHorizontal: 16, gap: 8, paddingBottom: insets.bottom + 80 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => WebBrowser.openBrowserAsync(item.url)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.muted,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                <Ionicons name={getFileIcon(item.mime_type) as any} size={22} color={colors.textPrimary} />
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodySm} numberOfLines={1}>{item.file_name ?? "Fil"}</Text>
                  {item.created_at && (
                    <Text style={[typography.bodyXs, { color: colors.textMuted, marginTop: 2 }]}>
                      {new Date(item.created_at).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}
                    </Text>
                  )}
                </View>
                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      {!isLoading && !fetchError && files.length > 0 && (
        <NativeSearchBar placeholder="Søg i filer..." onChangeText={setSearch} />
      )}
    </ModalScreen>
  );
}
