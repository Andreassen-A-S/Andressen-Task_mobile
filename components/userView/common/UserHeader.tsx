import { useRef, useState, useEffect } from "react";
import { View, Text, TextInput, Animated, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SingleAvatar from "./label/singleAvatar";
import { Plus, Search, X } from "lucide-react-native";
import GlassIconButton from "./buttons/GlassIconButton";
import { colors } from "@/constants/colors";

const CHARCOAL = "#1B1D22";
export const PROFILE_HEADER_HEIGHT_BASE = 58;

type UserHeaderProps = {
    variant: "user" | "profile" | "admin";
    user?: { name?: string; email?: string; profile_picture_url?: string | null } | null;
    heading?: string;
    sub?: string;
    position?: string;
    scrollY?: Animated.Value;
    onAdd?: () => void;
    onSearchChange?: (query: string) => void;
    searchResetKey?: number;
};

export default function UserHeader({ variant, user, heading, sub, position, scrollY, onAdd, onSearchChange, searchResetKey }: UserHeaderProps) {
    const { top } = useSafeAreaInsets();
    const [searchActive, setSearchActive] = useState(false);
    const [query, setQuery] = useState("");
    const searchAnim = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);
    const router = useRouter();

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

    useEffect(() => {
        if (searchResetKey !== undefined && searchActive) deactivateSearch();
    }, [searchResetKey]);

    if (variant === "profile") {
        const expandedOpacity = scrollY?.interpolate({ inputRange: [0, 50], outputRange: [1, 0], extrapolate: "clamp" }) ?? 1;
        const compactOpacity = scrollY?.interpolate({ inputRange: [30, 70], outputRange: [0, 1], extrapolate: "clamp" }) ?? 0;
        const solidOpacity = scrollY?.interpolate({ inputRange: [0, 60], outputRange: [1, 0], extrapolate: "clamp" }) ?? 1;
        const glassOpacity = scrollY?.interpolate({ inputRange: [0, 60], outputRange: [0, 1], extrapolate: "clamp" }) ?? 0;
        const headerHeight = scrollY?.interpolate({ inputRange: [0, 60], outputRange: [top + PROFILE_HEADER_HEIGHT_BASE, top + 44], extrapolate: "clamp" }) ?? top + PROFILE_HEADER_HEIGHT_BASE;

        return (
            <Animated.View style={{ position: "absolute", top: 0, left: 0, right: 0, height: headerHeight, zIndex: 10, overflow: "hidden" }}>

                {/* Expanded: solid charcoal */}
                <Animated.View style={{ position: "absolute", inset: 0, opacity: solidOpacity, backgroundColor: CHARCOAL }} />

                {/* Compact: same frosted glass as ModalHeader */}
                <Animated.View style={{ position: "absolute", inset: 0, opacity: glassOpacity }}>
                    {Platform.OS === "ios" ? (
                        <MaskedView
                            style={{ position: "absolute", inset: 0 }}
                            maskElement={
                                <LinearGradient
                                    colors={["black", "black", "transparent"]}
                                    locations={[0, 0.8, 1]}
                                    style={{ flex: 1 }}
                                />
                            }
                        >
                            <BlurView intensity={7.5} tint="light" style={{ flex: 1 }} />
                        </MaskedView>
                    ) : null}
                    <LinearGradient
                        colors={[`${colors.eggWhite}CC`, `${colors.eggWhite}00`]}
                        locations={[0, 1]}
                        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                    />
                </Animated.View>

                {/* Compact bar — fades in on scroll */}
                <Animated.View
                    style={{ opacity: compactOpacity, position: "absolute", left: 0, right: 0, bottom: 0, height: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}
                    pointerEvents="none"
                >
                    <SingleAvatar name={user?.name || "Ukendt bruger"} imageUrl={user?.profile_picture_url} size="lg" />
                    <View style={{ position: "absolute", left: 0, right: 0, alignItems: "center" }}>
                        <Text className="h4" numberOfLines={1}>{user?.name || "Profil"}</Text>
                    </View>
                </Animated.View>

                {/* Expanded content — fades out on scroll */}
                <Animated.View style={{ opacity: expandedOpacity, paddingTop: top, paddingBottom: 10, paddingHorizontal: 16 }}>
                    <View className="flex-row items-center gap-3">
                        <SingleAvatar name={user?.name || "Ukendt bruger"} imageUrl={user?.profile_picture_url} size="lg" />
                        <View className="flex-1">
                            <Text className="h3-white" numberOfLines={1}>{user?.name || "Ukendt bruger"}</Text>
                            <Text className="body-sm" numberOfLines={1}>{position || "Ukendt position"}</Text>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        );
    }

    if (variant === "admin") {
        return (
            <View style={{ paddingTop: top }} className="flex-row items-center bg-charcoal border-b border-border px-4 pb-3 gap-3">
                <View className="flex-1 h-10 justify-center">
                    {/* Default state: title + plus — fades out together */}
                    <Animated.View
                        style={{ opacity: titleOpacity, position: "absolute", left: 0, right: 0, flexDirection: "row", alignItems: "center" }}
                        pointerEvents={searchActive ? "none" : "auto"}
                    >
                        <View className="flex-1">
                            <Text className="h3-white">{heading || "Alle opgaver"}</Text>
                            <Text className="caption">{sub || "Admin oversigt"}</Text>
                        </View>
                        <GlassIconButton onDark icon={Plus} onPress={onAdd ?? (() => { })} size="lg" />
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
                            className="h3-white p-0"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                        />
                    </Animated.View>
                </View>
                <GlassIconButton
                    onDark
                    icon={searchActive ? X : Search}
                    variant={searchActive ? "active" : "default"}
                    onPress={searchActive ? deactivateSearch : activateSearch}
                    size="lg"
                />
            </View>
        );
    }

    return (
        <View style={{ paddingTop: top }} className="flex-row items-center bg-charcoal border-b border-border px-4 pb-3 gap-3">
            <View className="flex-1">
                <Text className="h3-white">{heading || "Mine opgaver"}</Text>
                <Text className="caption">{sub || `Velkommen, ${user?.name || user?.email}`}</Text>
            </View>
            <TouchableOpacity onPress={() => router.navigate("/(tabs)/profile")}>
                <SingleAvatar size="lg" name={user?.name || "Ukendt bruger"} imageUrl={user?.profile_picture_url} />
            </TouchableOpacity>
        </View>
    );
}
