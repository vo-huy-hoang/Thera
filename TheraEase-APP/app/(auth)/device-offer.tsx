import React from "react";
import {
	View,
	StyleSheet,
	Dimensions,
	Image,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
	FadeInUp,
	ZoomIn,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const NECK_IMAGE = require("../../assets/theraneck.png");
const BACK_IMAGE = require("../../assets/theraback.png");

const PRODUCTS = [
	{
		id: "neck",
		image: NECK_IMAGE,
		name: "TheraNECK",
		description: "Thiết bị hỗ trợ cải thiện cổ vai gáy và giảm căng cứng vùng cổ.",
	},
	{
		id: "back",
		image: BACK_IMAGE,
		name: "TheraBACK",
		description:
			"Thiết bị máy rung hỗ trợ thư giãn cơ sâu và giảm căng cứng vùng lưng.",
	},
];

export default function DeviceOfferScreen() {
	const router = useRouter();

	const handleAlreadyHave = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.replace("/(auth)/login");
	};

	const handleGetOffer = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.replace("/(auth)/special-offer");
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeInUp.duration(600).springify()}>
					<Text style={styles.title}>
						Để đạt hiệu quả tối đa, bạn{"\n"}hãy sử dụng thêm thiết bị{"\n"}hỗ
						trợ dưới đây:
					</Text>
				</Animated.View>

				<View style={styles.productsList}>
					{PRODUCTS.map((product, index) => (
						<View key={product.id} style={styles.productCard}>
							<Animated.View
								entering={ZoomIn.delay(300 + index * 120).duration(600)}
								style={styles.productContainer}
							>
								<Image
									source={product.image}
									style={styles.productImage}
									resizeMode="contain"
								/>
								<Text style={styles.productName}>{product.name}</Text>
								<Text style={styles.productDescription}>
									{product.description}
								</Text>
								<View style={styles.cardActions}>
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
								</View>
							</Animated.View>
						</View>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	content: {
		paddingHorizontal: 25,
		paddingTop: 32,
		paddingBottom: 40,
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#000000",
		textAlign: "center",
		lineHeight: 34,
		marginBottom: 28,
	},
	productsList: {
		width: "100%",
		gap: 20,
		marginBottom: 28,
	},
	productCard: {
		width: "100%",
		borderRadius: 30,
		backgroundColor: "#FFFFFF",
		paddingVertical: 18,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.06,
		shadowRadius: 18,
		elevation: 3,
	},
	productContainer: {
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	productImage: {
		width: width * 0.72,
		height: width * 0.58,
		marginBottom: 16,
	},
	productName: {
		fontSize: 28,
		color: "#111827",
		fontWeight: "800",
		textAlign: "center",
		marginBottom: 10,
	},
	productDescription: {
		fontSize: 16,
		lineHeight: 24,
		color: "#4B5563",
		textAlign: "center",
		paddingHorizontal: 12,
		marginBottom: 18,
	},
	cardActions: {
		width: "100%",
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
