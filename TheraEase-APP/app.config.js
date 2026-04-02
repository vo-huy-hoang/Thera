export default {
	expo: {
		name: "TheraHome",
		slug: "therahome-app",
		owner: "vohuyhoang",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/icon.png",
		userInterfaceStyle: "automatic",
		splash: {
			image: "./assets/splash.png",
			resizeMode: "contain",
			backgroundColor: "#ffffff",
		},
		assetBundlePatterns: ["**/*"],
		ios: {
			supportsTablet: true,
			bundleIdentifier: "vn.therahome.app",
			infoPlist: {
				NSUserTrackingUsageDescription:
					"Ứng dụng cần quyền này để cải thiện trải nghiệm của bạn",
				LSApplicationQueriesSchemes: [
					"https",
					"http",
					"fbapi",
					"fb-messenger-api",
					"fbauth2",
					"fbshareextension",
				],
			},
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/adaptive-icon.png",
				backgroundColor: "#ffffff",
			},
			package: "vn.therahome.app",
			permissions: ["CAMERA", "NOTIFICATIONS"],
		},
		web: {
			favicon: "./assets/favicon.png",
		},
		plugins: [
			"expo-router",
			[
				"expo-notifications",
				{
					icon: "./assets/notification-icon.png",
					color: "#2563eb",
				},
			],
			[
				"expo-camera",
				{
					cameraPermission:
						"Ứng dụng cần quyền camera để quét mã QR kích hoạt thiết bị",
				},
			],
			// 🔥 THÊM FACEBOOK LOGIN Ở ĐÂY
			[
				"react-native-fbsdk-next",
				{
					appID: "34694532530194658",
					displayName: "TheraHome",
				},
			],
		],
		scheme: ["therahome", "fb34694532530194658"],
		extra: {
			eas: {
				projectId: "your-project-id",
			},
		},
	},
};
