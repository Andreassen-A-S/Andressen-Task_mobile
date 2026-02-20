import { View, Text, StyleSheet } from "react-native";
import { TaskPriority, TaskStatus } from "@/types/task";
import { getPriorityColors, getStatusColors, translatePriority, translateStatus } from "@/helpers/helpers";
import { typography } from "@/constants/typography";

type BadgeVariant = "priority" | "status";

interface BadgeProps {
    variant: BadgeVariant;
    value: TaskPriority | TaskStatus;
    size?: "sm" | "md" | "lg";
}

const sizeStyles = StyleSheet.create({
    sm: { paddingHorizontal: 8, paddingVertical: 2 },
    md: { paddingHorizontal: 10, paddingVertical: 4 },
    lg: { paddingHorizontal: 12, paddingVertical: 6 },
});

export default function Badge({ variant, value, size = "md" }: BadgeProps) {
    const colors =
        variant === "priority"
            ? getPriorityColors(value as TaskPriority)
            : getStatusColors(value as TaskStatus);

    const label =
        variant === "priority"
            ? translatePriority(value as TaskPriority)
            : translateStatus(value as TaskStatus);

    return (
        <View style={[styles.container, sizeStyles[size], colors.container]}>
            <Text style={[typography.badge, colors.text]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        // borderWidth: 1,
    },
});