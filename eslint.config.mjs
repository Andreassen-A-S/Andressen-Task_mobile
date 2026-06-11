import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

export default defineConfig([
    ...expoConfig,
    {
        ignores: ["node_modules/", ".expo/", "dist/"],
    },
    {
        // React Compiler rules from react-hooks v7 generate false positives for React Native
        // patterns: Animated.Value, useContext returns, and the stable-callback-ref pattern
        // are all incorrectly flagged as ref mutations.
        rules: {
            "react-hooks/refs": "off",
            "react-hooks/immutability": "off",
            "react-hooks/static-components": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/set-state-in-effect": "off",
        },
    },
]);
