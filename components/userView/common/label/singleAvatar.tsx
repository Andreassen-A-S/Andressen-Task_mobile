import { Image } from "expo-image";
import { getInitials, getAvatarColor } from "@/helpers/helpers";
import { View, Text } from "react-native";

interface SingleAvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-[26px] h-[26px]",
    lg: "w-[34px] h-[34px]",
};

const sizePx = {
    xs: 24,
    sm: 32,
    md: 26,
    lg: 34,
};

const initialsClass = {
    xs: "initials-sm",
    sm: "initials-sm",
    md: "initials-md",
    lg: "initials-lg",
};

export default function SingleAvatar({
    name,
    imageUrl,
    size = "md",
    className = ""
}: SingleAvatarProps) {
    const px = sizePx[size];

    if (imageUrl) {
        return (
            <Image
                source={{ uri: imageUrl }}
                style={{ width: px, height: px, borderRadius: 999 }}
                contentFit="cover"
            />
        );
    }

    return (
        <View
            className={`
                ${sizeClasses[size]}
                rounded-full
                flex items-center justify-center
                ${className}
            `}
            style={{ backgroundColor: getAvatarColor(name) }}
        >
            <Text className={initialsClass[size]}>{getInitials(name)}</Text>
        </View>
    );
}
