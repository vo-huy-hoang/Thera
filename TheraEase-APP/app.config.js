export default {
  expo: {
    name: "TheraEase",
    slug: "theraease-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "vn.theraease.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "vn.theraease.app",
      permissions: [
        "CAMERA",
        "NOTIFICATIONS"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#2563eb"
        }
      ],
      [
        "expo-barcode-scanner",
        {
          cameraPermission: "Allow app to access camera for QR code scanning"
        }
      ]
    ],
    scheme: "theraease",
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
