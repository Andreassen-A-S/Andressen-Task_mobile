import { typography } from "@/constants/typography";
import { getInitials, getAvatarColor } from "@/helpers/helpers";
import { View, Text } from "react-native";

interface SingleAvatarProps {
    name: string;
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

export default function SingleAvatar({
    name,
    size = "md",
    className = ""
}: SingleAvatarProps) {
    const sizeClasses = {
        xs: "w-6 h-6",
        sm: "w-8 h-8",
        md: "w-[26px] h-[26px]",
        lg: "w-[34px] h-[34px]",
    };
    const fontSize = {
        xs: typography.initialsSm,
        sm: typography.initialsSm,
        md: typography.initialsMd,
        lg: typography.initialsLg,
    };

    return (
        <View
            className={`
                ${sizeClasses[size]}
                rounded-lg
                flex items-center justify-center
                ${className}
            `}
            style={{ backgroundColor: getAvatarColor(name) }}
        >
            <Text style={[fontSize[size]]}>{getInitials(name)}</Text>
        </View>
    );
}