const IS_LOCAL_DEV =
  !process.env.APP_ENV || process.env.APP_ENV === "development";

const apiHost = (() => {
  try {
    return new URL(process.env.EXPO_PUBLIC_API_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

module.exports = {
  expo: {
    name: "MesterPlan",
    slug: "andreassentask-mobile",
    scheme: "mesterplan",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      deploymentTarget: "16.4",
      icon: "./assets/mesterPlan_final.icon",
      supportsTablet: false,
      bundleIdentifier: "app.mesterplan",
      entitlements: {
        "aps-environment": IS_LOCAL_DEV ? "development" : "production",
        "com.apple.developer.associated-domains": ["applinks:mesterplan.app"],
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "Bruges til at tage billeder af opgaver.",
        NSPhotoLibraryUsageDescription:
          "Bruges til at vedhæfte billeder fra dit fotobibliotek.",
        ...(IS_LOCAL_DEV &&
          apiHost && {
            NSAppTransportSecurity: {
              NSExceptionDomains: {
                [apiHost]: {
                  NSExceptionAllowsInsecureHTTPLoads: true,
                  NSIncludesSubdomains: false,
                },
              },
            },
          }),
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundImage: "./assets/adaptive-icon-background.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "app.mesterplan",
      usesCleartextTraffic: IS_LOCAL_DEV,
      googleServicesFile: "./google-services.json",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "@react-native-community/datetimepicker",
      [
        "expo-image-picker",
        {
          photosPermission:
            "Bruges til at vedhæfte billeder fra dit fotobibliotek.",
          cameraPermission: "Bruges til at tage billeder af opgaver.",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#0f6e56",
        },
      ],
      "expo-web-browser",
      "expo-image",
      "expo-status-bar",
    ],
    extra: {
      router: {},
      eas: {
        projectId: "0fa085ea-dfd1-4738-9092-3c233fb92259",
      },
    },
  },
};
