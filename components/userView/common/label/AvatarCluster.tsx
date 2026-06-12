import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { getInitials, getAvatarColor } from "@/helpers/helpers";
import { colors } from "@/constants/colors";

interface AvatarUser {
    name: string;
    imageUrl?: string | null;
}

interface Props {
    users: AvatarUser[];
    ringColor?: string;
    onPress?: () => void;
}

const BORDER = 1.5;

// ─── 1 user ──────────────────────────────────────────────────────────────────
const SLOT_1 = 36;

// ─── 2 users — equal size, 45° diagonal (top-right → bottom-left) ────────────
const SLOT_2 = 30;
const STEP_2 = 14; // diagonal offset; negative value would create overlap
const CONTAINER_2 = STEP_2 + SLOT_2; // square container

// ─── 3 users — rotated 45° triangle, varying sizes ───────────────────────────
const SLOTS_3 = [33, 30, 27] as const;
const GAP_3 = -12;
const STEP_3 = SLOTS_3[0] + GAP_3;

const CENTERS_3 = [
    { cx: SLOTS_3[0] / 2,              cy: SLOTS_3[0] / 2 },
    { cx: SLOTS_3[0] / 2 + STEP_3,     cy: SLOTS_3[0] / 2 },
    { cx: SLOTS_3[0] / 2 + STEP_3 / 2, cy: SLOTS_3[0] / 2 + STEP_3 },
];
const POSITIONS_3 = CENTERS_3.map((c, i) => ({
    top:  c.cy - SLOTS_3[i] / 2,
    left: c.cx - SLOTS_3[i] / 2,
}));
const INNER_3 = Math.max(
    Math.ceil(Math.max(...CENTERS_3.map((c, i) => c.cx + SLOTS_3[i] / 2))),
    Math.ceil(Math.max(...CENTERS_3.map((c, i) => c.cy + SLOTS_3[i] / 2))),
);
const OUTER_3 = Math.round(INNER_3 * Math.SQRT2);

const MAX = 3;

function Bubble({ user, slot, ringColor, overflowCount }: {
    user?: AvatarUser;
    slot: number;
    ringColor: string;
    overflowCount?: number;
}) {
    const ring = { width: slot, height: slot, borderRadius: 999, borderWidth: BORDER, borderColor: ringColor };

    if (overflowCount !== undefined) {
        return (
            <View style={{ ...ring, backgroundColor: colors.border, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.textSecondary, fontSize: Math.max(slot * 0.28, 5), fontWeight: "600" }}>+{overflowCount}</Text>
            </View>
        );
    }
    if (user?.imageUrl) {
        return <Image source={{ uri: user.imageUrl }} style={ring} contentFit="cover" />;
    }
    return (
        <View style={{ ...ring, backgroundColor: user ? getAvatarColor(user.name) : colors.muted, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontSize: Math.max(slot * 0.35, 5), fontWeight: "600" }}>
                {user ? getInitials(user.name) : ""}
            </Text>
        </View>
    );
}

export default function AvatarCluster({ users, ringColor = colors.eggWhite, onPress }: Props) {
    const count = users.length;
    const overflow = count - MAX;

    const Wrapper = onPress ? TouchableOpacity : View;
    const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

    // ── 1 user ────────────────────────────────────────────────────────────────
    if (count <= 1) {
        return (
            <Wrapper {...wrapperProps}>
                <Bubble user={users[0]} slot={SLOT_1} ringColor={ringColor} />
            </Wrapper>
        );
    }

    // ── 2 users — diagonal, no rotation ──────────────────────────────────────
    if (count === 2) {
        return (
            <Wrapper {...wrapperProps} style={{ width: CONTAINER_2, height: CONTAINER_2 }}>
                {/* top-left */}
                <View style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}>
                    <Bubble user={users[0]} slot={SLOT_2} ringColor={ringColor} />
                </View>
                {/* bottom-right */}
                <View style={{ position: "absolute", top: STEP_2, left: STEP_2, zIndex: 1 }}>
                    <Bubble user={users[1]} slot={SLOT_2} ringColor={ringColor} />
                </View>
            </Wrapper>
        );
    }

    // ── 3+ users — rotated 45° triangle ──────────────────────────────────────
    return (
        <Wrapper {...wrapperProps} style={{ width: OUTER_3, height: OUTER_3, alignItems: "flex-end", justifyContent: "center" }}>
            <View style={{ width: INNER_3, height: INNER_3, transform: [{ rotate: "45deg" }] }}>
                {POSITIONS_3.map((pos, i) => {
                    const slot = SLOTS_3[i];
                    const isOverflow = i === MAX - 1 && overflow > 0;
                    return (
                        <View
                            key={i}
                            style={{ position: "absolute", top: pos.top, left: pos.left, transform: [{ rotate: "-45deg" }], zIndex: MAX - i }}
                        >
                            <Bubble
                                user={isOverflow ? undefined : users[i]}
                                slot={slot}
                                ringColor={ringColor}
                                overflowCount={isOverflow ? overflow + 1 : undefined}
                            />
                        </View>
                    );
                })}
            </View>
        </Wrapper>
    );
}
