import { StyleSheet, TextStyle } from "react-native";
import { colors } from "./colors";

const base: TextStyle = {
  fontFamily: "Outfit_400Regular",
  color: colors.textPrimary,
};

export const typography = StyleSheet.create({
  // ─── HEADINGS ────────────────────────────────────────────────
  h1: {
    ...base,
    fontFamily: "Outfit_700Bold",
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.03 * 36,
  },
  h2: {
    ...base,
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.025 * 28,
  },
  h3: {
    ...base,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.02 * 22,
  },
  h3White: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.02 * 22,
    color: colors.white,
  },
  h4: {
    ...base,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.015 * 18,
  },
  h5: {
    ...base,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.01 * 16,
  },
  h6: {
    ...base,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
  },

  // ─── BODY TEXT ───────────────────────────────────────────────
  bodyLg: {
    ...base,
    fontSize: 18,
    lineHeight: 28,
  },
  bodyMd: {
    ...base,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    ...base,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  bodyXs: {
    ...base,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  // ─── LABELS & UI TEXT ────────────────────────────────────────
  labelLg: {
    ...base,
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
    lineHeight: 20,
  },
  labelLgGray: {
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  labelLgWhite: {
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
    lineHeight: 20,
    color: colors.textWhite,
  },
  labelMd: {
    ...base,
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
    lineHeight: 18,
  },
  labelSm: {
    ...base,
    fontFamily: "Outfit_500Medium",
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  // ─── OVERLINES & CAPTIONS ────────────────────────────────────
  overline: {
    ...base,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.08 * 10,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  caption: {
    ...base,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },

  // ─── BADGES & TAGS ───────────────────────────────────────────
  badge: {
    ...base,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.02 * 10,
  },
  badgeRecurring: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.02 * 10,
    color: "#2C5FE0",
  },
  tag: {
    ...base,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.02 * 9,
  },

  // ─── BUTTON TEXT ─────────────────────────────────────────────
  btnLg: {
    ...base,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
  },
  btnMd: {
    ...base,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
  },
  btnSm: {
    ...base,
    fontFamily: "Outfit_500Medium",
    fontSize: 12,
    lineHeight: 16,
  },

  // ─── MONOSPACE ───────────────────────────────────────────────
  monoMd: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  monoSm: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  monoXs: {
    fontFamily: "IBMPlexMono_500Medium",
    fontSize: 10,
    lineHeight: 14,
    color: colors.textSecondary,
  },
  monoXsAccent: {
    fontFamily: "IBMPlexMono_500Medium",
    fontSize: 10,
    lineHeight: 14,
    color: colors.green,
  },

  // ─── NAVIGATION ──────────────────────────────────────────────
  navItem: {
    ...base,
    fontSize: 13,
    lineHeight: 18,
    color: "#A8AABB",
  },
  navItemActive: {
    ...base,
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
    lineHeight: 18,
    color: colors.textWhite,
  },

  /* ─── INITIALS (avatars) ────────────────────────────────────── */

  initialsLg: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13 /* 13px */,
    color: colors.textWhite,
  },

  initialsMd: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 11 /* 11px */,
    color: colors.textWhite,
  },

  initialsSm: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 9 /* 9px */,
    color: colors.textWhite,
  },
});
