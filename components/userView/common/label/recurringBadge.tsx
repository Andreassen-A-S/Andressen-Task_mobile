"use client";

import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { View, StyleSheet, Text } from 'react-native';

interface RecurringBadgeProps {
    size?: "sm" | "md" | "lg";

}

const sizeStyles = StyleSheet.create({
    sm: { paddingHorizontal: 8, paddingVertical: 2 },
    md: { paddingHorizontal: 10, paddingVertical: 4 },
    lg: { paddingHorizontal: 12, paddingVertical: 6 },
});

export default function RecurringBadge({ size = "md" }: RecurringBadgeProps) {
    if (size === "sm") {
        return (
            <View style={[styles.container, sizeStyles.sm]}>
                <FontAwesome6 name="repeat" size={10} color="#2C5FE0" />
                <Text style={[typography.badgeRecurring,]}>Gentages</Text>
            </View>
        );
    }

    if (size === "md") {
        return (
            <View style={[styles.container, sizeStyles.md]}>
                <FontAwesome6 name="repeat" size={16} color="#2C5FE0" />
                <Text style={[typography.badgeRecurring]}>Gentages</Text>
            </View>
        );
    }

    if (size === "lg") {
        return (
            <View style={[styles.container, sizeStyles.lg]}>
                <FontAwesome6 name="repeat" size={24} color="#2C5FE0" />
                <Text style={[typography.badgeRecurring]}>Gentages</Text>
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