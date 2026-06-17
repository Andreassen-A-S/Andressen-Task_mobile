import { View } from "react-native";
import { Image } from "expo-image";
import { getInitials, getAvatarColor } from "@/helpers/helpers";
import { Text } from "react-native";
import { colors } from "@/constants/colors";

interface AvatarUser {
    name: string;
    imageUrl?: string | null;
}

interface Props {
    users: AvatarUser[];
    size?: number;
    overlap?: number;
    borderColor?: string;
    max?: number;
}

const BORDER = 2.5;

export default function StackedAvatars({ users, size = 40, overlap = 14, borderColor = colors.eggWhite, max = 4 }: Props) {
    const visible = users.slice(0, max);
    const total = size + (visible.length - 1) * (size - overlap);

    return (
        <View style={{ width: total, height: size }}>
            {visible.map((user, i) => {
                const left = i * (size - overlap);
                const zIndex = visible.length - i;
                const avatarInner = size - BORDER * 2;
                return (
                    <View
                        key={i}
                        style={{
                            position: "absolute",
                            left,
                            top: 0,
                            zIndex,
                            width: size,
                            height: size,
                            borderRadius: 999,
                            backgroundColor: borderColor,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {user.imageUrl ? (
                            <Image
                                source={{ uri: user.imageUrl }}
                                style={{ width: avatarInner, height: avatarInner, borderRadius: 999 }}
                                contentFit="cover"
                            />
                        ) : (
                            <View
                                style={{
                                    width: avatarInner,
                                    height: avatarInner,
                                    borderRadius: 999,
                                    backgroundColor: getAvatarColor(user.name),
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text className="initials-sm">{getInitials(user.name)}</Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}
