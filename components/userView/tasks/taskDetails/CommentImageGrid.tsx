import { View, Image } from "react-native";
import { TaskAttachment } from "@/types/comment";

interface Props {
  images: TaskAttachment[];
  align?: "flex-start" | "flex-end";
}

export default function CommentImageGrid({ images, align = "flex-start" }: Props) {
  if (images.length === 0) return null;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, alignSelf: align }}>
      {images.map((img) => (
        <Image
          key={img.attachment_id}
          source={{ uri: img.public_url }}
          style={{ width: 160, height: 160, borderRadius: 10 }}
          resizeMode="cover"
        />
      ))}
    </View>
  );
}
