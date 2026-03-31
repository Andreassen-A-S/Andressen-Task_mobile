import { useRef, useState } from "react";
import { View, Text, TextInput, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SingleAvatar from "./label/singleAvatar";
import GlassIconButton from "./buttons/GlassIconButton";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

type UserHeaderProps = {
    variant: "user" | "profile" | "admin";
    user?: { name?: string; email?: string } | null;
    heading?: string;
    sub?: string;
    position?: string;
    onAdd?: () => void;
    onSearchChange?: (query: string) => void;
};

export default function UserHeader({ variant, user, heading, sub, position, onAdd, onSearchChange }: UserHeaderProps) {
    const { top } = useSafeAreaInsets();
    const [searchActive, setSearchActive] = useState(false);
    const [query, setQuery] = useState("");
    const searchAnim = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);

    const activateSearch = () => {
        setSearchActive(true);
        Animated.timing(searchAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
            inputRef.current?.focus();
        });
    };

    const deactivateSearch = () => {
        inputRef.current?.blur();
        Animated.timing(searchAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
            setSearchActive(false);
            setQuery("");
            onSearchChange?.("");
        });
    };

    const titleOpacity = searchAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

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

    if (variant === "admin") {
        return (
            <View style={{ paddingTop: top }} className="flex-row items-center bg-[#1B1D22] border-b border-[#E8E6E1] px-4 pb-3 gap-3">
                <View style={{ flex: 1, height: 40, justifyContent: "center" }}>
                    {/* Default state: title + plus — fades out together */}
                    <Animated.View
                        style={{ opacity: titleOpacity, position: "absolute", left: 0, right: 0, flexDirection: "row", alignItems: "center" }}
                        pointerEvents={searchActive ? "none" : "auto"}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={typography.h3White}>{heading || "Alle opgaver"}</Text>
                            <Text style={typography.caption}>{sub || "Admin oversigt"}</Text>
                        </View>
                        <GlassIconButton systemName="plus" onPress={onAdd ?? (() => {})} size="lg" />
                    </Animated.View>
                    {/* Search state: text input — fades in */}
                    <Animated.View
                        style={{ opacity: searchAnim, position: "absolute", left: 0, right: 0 }}
                        pointerEvents={searchActive ? "auto" : "none"}
                    >
                        <TextInput
                            ref={inputRef}
                            value={query}
                            onChangeText={(text) => { setQuery(text); onSearchChange?.(text); }}
                            placeholder="Søg opgaver..."
                            placeholderTextColor={colors.textMuted}
                            style={[typography.h3White, { padding: 0 }]}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                        />
                    </Animated.View>
                </View>
                <GlassIconButton
                    systemName={searchActive ? "xmark" : "magnifyingglass"}
                    variant={searchActive ? "active" : "default"}
                    onPress={searchActive ? deactivateSearch : activateSearch}
                    size="lg"
                />
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
