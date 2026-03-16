# AndressenTask Mobile

React Native mobile app for the AndressenTask task management system, built with Expo and NativeWind.

## Quickstart

**Requirements:** Node 20+, Expo Go on your phone

1. Install dependencies:

   ```bash
   nvm use 20
   npm install
   ```

2. Create a `.env` file in the project root:

   ```
   EXPO_PUBLIC_API_URL=http://<server-ip>:9000/api
   ```

3. Start the development server:

   ```bash
   npx expo start
   ```

4. Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Useful Commands

| Command                                          | Description                                      |
| ------------------------------------------------ | ------------------------------------------------ |
| `npx expo start`                                 | Start the dev server                             |
| `npx expo start --clear`                         | Start with cleared Metro cache                   |
| `npx expo start --tunnel`                        | Start with public tunnel URL (share with others) |
| `npx expo start --ios`                           | Open in iOS simulator                            |
| `npx expo start --android`                       | Open in Android emulator                         |
| `eas build --platform android --profile preview` | Build Android APK for distribution               |
