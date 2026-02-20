"use client";

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
        xs: "w-6 h-6 initials-sm",
        sm: "w-8 h-8 text-[12px] initials-md",
        md: "w-[26px] h-[26px] initials-md",
        lg: "w-[34px] h-[34px] initials-lg ",
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
            <Text style={[typography.initialsLg]}>{getInitials(name)}</Text>
        </View>
    );
}