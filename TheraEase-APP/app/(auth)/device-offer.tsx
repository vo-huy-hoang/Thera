import React from "react";
import {
	View,
	StyleSheet,
	Dimensions,
	Image,
	TouchableOpacity,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
	FadeInUp,
	FadeInDown,
	ZoomIn,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function DeviceOfferScreen() {
	const router = useRouter();

	const handleAlreadyHave = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.replace("/(auth)/activate-device");
	};

	const handleGetOffer = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.replace("/(auth)/special-offer");
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Animated.View entering={FadeInUp.duration(600).springify()}>
					<Text style={styles.title}>
						Để đạt hiệu quả tối đa, bạn{"\n"}hãy sử dụng thêm thiết bị{"\n"}hỗ
						trợ dưới đây:
					</Text>
				</Animated.View>

				<View style={styles.productContainer}>
					<Animated.View entering={ZoomIn.delay(300).duration(600)}>
						<Image
							source={require("../../assets/theraneck.png")}
							style={styles.productImage}
							resizeMode="contain"
						/>
					</Animated.View>
					<Text style={styles.productName}>
						Thiết bị hỗ trợ cải thiện cổ TheraNECK
					</Text>
				</View>

				<Animated.View
					entering={FadeInDown.delay(700).duration(800)}
					style={styles.footer}
				>
					<TouchableOpacity
						onPress={handleAlreadyHave}
						style={styles.haveButton}
						activeOpacity={0.8}
					>
						<Text style={styles.haveText}>Đã có</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={handleGetOffer}
						style={styles.offerButton}
						activeOpacity={0.8}
					>
						<Text style={styles.offerText}>Nhận ưu đãi</Text>
					</TouchableOpacity>
				</Animated.View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	content: {
		flex: 1,
		paddingHorizontal: 25,
		paddingTop: 60,
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#000000",
		textAlign: "center",
		lineHeight: 34,
		marginBottom: 40,
	},
	productContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	productImage: {
		width: width * 0.8,
		height: width * 0.8,
		marginBottom: 20,
	},
	productName: {
		fontSize: 18,
		color: "#333",
		fontWeight: "500",
		textAlign: "center",
	},
	footer: {
		width: "100%",
		paddingBottom: 40,
		alignItems: "center",
		gap: 15,
	},
	haveButton: {
		width: "100%",
		backgroundColor: "#3B82F6",
		paddingVertical: 18,
		borderRadius: 35,
		alignItems: "center",
		shadowColor: "#3B82F6",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 5,
	},
	haveText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
	offerButton: {
		width: "100%",
		backgroundColor: "#EF4444",
		paddingVertical: 18,
		borderRadius: 35,
		alignItems: "center",
		shadowColor: "#EF4444",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 5,
	},
	offerText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
});
