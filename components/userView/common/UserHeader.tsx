import { View, Text, StyleSheet } from "react-native";
import SingleAvatar from "./label/singleAvatar";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

type UserTaskHeaderProps = {
    user?: { name?: string; email?: string } | null;
    heading?: string;
    sub?: string;
};

export default function UserTaskHeader({ user, heading, sub }: UserTaskHeaderProps) {
    return (
        <View style={styles.headerWrapper}>
            <View style={styles.textContainer}>
                <Text style={styles.headerText}>{heading || "Mine opgaver"}</Text>
                <Text style={styles.subText}>{sub || `Velkommen, ${user?.name || user?.email}`}</Text>
            </View>
            <SingleAvatar
                size="lg"
                name={user?.name || "ukendt bruger"}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    headerWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.charcoal,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    textContainer: {
        flex: 1,
    },

    headerText: {
        ...typography.h3White,
    },
    subText: {
        ...typography.caption,
    }
});