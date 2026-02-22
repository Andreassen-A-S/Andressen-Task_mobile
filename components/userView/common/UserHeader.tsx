import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SingleAvatar from "./label/singleAvatar";
import { typography } from "@/constants/typography";

type UserHeaderProps = {
    variant: "user" | "profile";
    user?: { name?: string; email?: string } | null;
    heading?: string;
    sub?: string;
    position?: string;
};

export default function UserHeader({ variant, user, heading, sub, position }: UserHeaderProps) {
    const { top } = useSafeAreaInsets();

    if (variant === "profile") {
        return (
            <View style={{ paddingTop: top }} className="bg-[#1B1D22] px-4 pb-3">
                <Text style={typography.labelSmUppercase} className="mb-3">
                    Andreassen A/S · Task Management
                </Text>
                <View className="flex-row items-center gap-3">
                    <SingleAvatar name={user?.name || "Ukendt bruger"} size="lg" />
                    <View className="flex-1">
                        <Text style={typography.h3White} numberOfLines={1}>
                            {user?.name || "Ukendt bruger"}
                        </Text>
                        <Text style={typography.bodySm} numberOfLines={1}>
                            {position || "Ukendt position"}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={{ paddingTop: top }} className="flex-row items-center bg-[#1B1D22] border-b border-[#E8E6E1] px-4 pb-3 gap-3">
            <View className="flex-1">
                <Text style={typography.h3White}>{heading || "Mine opgaver"}</Text>
                <Text style={typography.caption}>{sub || `Velkommen, ${user?.name || user?.email}`}</Text>
            </View>
            <SingleAvatar size="lg" name={user?.name || "Ukendt bruger"} />
        </View>
    );
}
