
import { typography } from '@/constants/typography';
import { TaskPriority } from '@/types/task';
import { getPriorityAccentColor, getPriorityColors, translatePriority } from '@/helpers/helpers';
import { View, StyleSheet, Text } from 'react-native';

interface DetailsPriorityBadgeProps {
    priority: TaskPriority;
    size?: "sm" | "md" | "lg";

}

const sizeStyles = StyleSheet.create({
    sm: { paddingHorizontal: 8, paddingVertical: 2 },
    md: { paddingHorizontal: 10, paddingVertical: 4 },
    lg: { paddingHorizontal: 12, paddingVertical: 6 },
});

export default function DetailsPriorityBadge({ size = "md", priority }: DetailsPriorityBadgeProps) {

    const colors = getPriorityColors(priority)


    if (size === "sm") {
        return (
            <View style={[styles.container, sizeStyles.sm, colors.container]}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: getPriorityAccentColor(priority) }} />
                <Text style={[typography.badgeRecurring, colors.text]}>{translatePriority(priority)} prioritet</Text>
            </View>
        );
    }

    if (size === "md") {
        return (
            <View style={[styles.container, sizeStyles.md, colors.container]}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: getPriorityAccentColor(priority) }} />
                <Text style={[typography.badgeRecurring, colors.text]}>{translatePriority(priority)} prioritet</Text>
            </View>
        );
    }

    if (size === "lg") {
        return (
            <View style={[styles.container, sizeStyles.lg, colors.container]}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: getPriorityAccentColor(priority) }} />
                <Text style={[typography.badgeRecurring, colors.text]}>{translatePriority(priority)} prioritet</Text>
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 8,
        backgroundColor: '#EBF0FD',
    },
});