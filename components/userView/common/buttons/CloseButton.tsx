import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface CloseButtonProps {
    onClick: () => void;
    className?: string;
    ariaLabel?: string;
}

export default function CloseButton({
    onClick,
    className = "rounded-lg w-10 h-10 border border-gray-200 items-center justify-center",
    ariaLabel = "Luk",
}: CloseButtonProps) {
    return (
        <TouchableOpacity
            onPress={onClick}
            className={className}
            accessibilityLabel={ariaLabel}
        >
            <Text className="text-2xl text-gray-500">×</Text>
        </TouchableOpacity>
    );
}