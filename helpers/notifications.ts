import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { registerPushToken } from "@/lib/api";

type NotificationPermissionResult = {
  granted?: boolean;
  status?: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function hasNotificationPermission(permission: NotificationPermissionResult): boolean {
  return permission.granted === true || permission.status === "granted";
}

export async function registerForPushNotifications(): Promise<void> {
  if (!Device.isDevice) {
    // Push notifications don't work in simulators
    return;
  }

  const existingPermissions = await Notifications.getPermissionsAsync() as NotificationPermissionResult;
  let granted = hasNotificationPermission(existingPermissions);

  if (!granted) {
    const requestedPermissions = await Notifications.requestPermissionsAsync() as NotificationPermissionResult;
    granted = hasNotificationPermission(requestedPermissions);
  }

  if (!granted) {
    await registerPushToken(null);
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  await registerPushToken(token.data);
}
