import { Image } from "expo-image";
import { getInitials, getAvatarColor } from "@/helpers/helpers";
import { View, Text } from "react-native";

interface SingleAvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-10 h-10",
    xl: "w-20 h-20",
};

const sizePx = {
    xs: 24,
    sm: 32,
    md: 36,
    lg: 40,
    xl: 80,
};

const initialsClass = {
    xs: "initials-sm",
    sm: "initials-sm",
    md: "initials-md",
    lg: "initials-lg",
    xl: "initials-lg",
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
