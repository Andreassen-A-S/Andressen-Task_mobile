import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import ImageView from "react-native-image-viewing";
import { getTaskAttachments } from "@/lib/api";
import { TaskAttachment } from "@/types/comment";
import { colors } from "@/constants/colors";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";

const COLUMNS = 3;
const GAP = 2;
const SCREEN_WIDTH = Dimensions.get("window").width;
const TILE_SIZE = (SCREEN_WIDTH - GAP * (COLUMNS + 1)) / COLUMNS;

export default function TaskPhotos() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const headerHeight = useModalHeaderHeight();

  const [images, setImages] = useState<TaskAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const fetchImages = useCallback(async () => {
    if (!taskId) return;
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await getTaskAttachments(taskId);
      setImages(data.filter((a) => a.type === "IMAGE"));
    } catch {
      setFetchError("Kunne ikke hente billeder");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useFocusEffect(useCallback(() => {
    fetchImages();
  }, [fetchImages]));

  const imageUris = images.map((img) => ({ uri: img.url }));

  return (
    <ModalScreen title="Billeder">
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center" style={{ paddingTop: headerHeight }}>
            <ActivityIndicator color={colors.green} size="large" />
          </View>
        ) : fetchError ? (
          <View className="flex-1 items-center justify-center px-6" style={{ paddingTop: headerHeight }}>
            <View className="rounded-xl p-4 w-full items-center border bg-danger-surface border-danger-border">
              <Text className="body-sm text-danger-text text-center mb-3">{fetchError}</Text>
              <TouchableOpacity onPress={() => fetchImages()} className="px-4 py-2 rounded-lg bg-danger">
                <Text className="btn-md text-white">Prøv igen</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : images.length === 0 ? (
          <View className="flex-1 items-center justify-center" style={{ paddingTop: headerHeight }}>
            <Text className="body-sm text-muted-foreground">
              Ingen billeder endnu.{"\n"}Send billeder i kommentarerne.
            </Text>
          </View>
        ) : (
          <FlatList
            data={images}
            keyExtractor={(item) => item.attachment_id}
            numColumns={COLUMNS}
            contentContainerStyle={{ paddingTop: headerHeight + GAP, paddingHorizontal: GAP }}
            columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setViewerIndex(index)} activeOpacity={0.9}>
                <Image
                  source={{ uri: item.url, cacheKey: item.attachment_id }}
                  cachePolicy="memory-disk"
                  style={{ width: TILE_SIZE, height: TILE_SIZE, backgroundColor: colors.border }}
                  contentFit="cover"
                  transition={200}
                />
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <ImageView
        images={imageUris}
        imageIndex={viewerIndex ?? 0}
        visible={viewerIndex !== null}
        onRequestClose={() => setViewerIndex(null)}
      />
    </ModalScreen>
  );
}
