import React, { useState, useRef, useEffect } from "react";
import {
	View,
	StyleSheet,
	Modal,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Dimensions,
	Animated as RNAnimated,
	PanResponder,
	Alert,
	Keyboard,
} from "react-native";
import { Text, TextInput, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import {
	X,
	Send,
	Bot,
	User as UserIcon,
	Sparkles,
	Trash2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "@/stores/authStore";
import { chatWithAssistant } from "@/services/groq";
import { api } from "@/services/api";
import { colors } from "@/utils/theme";

const { width, height } = Dimensions.get("window");
const BUTTON_SIZE = 60;
const EDGE_PADDING = 20;

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	created_at: string;
}

export default function FloatingChatbot() {
	const { user } = useAuthStore();
	const [visible, setVisible] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState("");
	const [loading, setLoading] = useState(false);
	const [showGreetingBubble, setShowGreetingBubble] = useState(false);
	const [isDockedLeft, setIsDockedLeft] = useState(false);

	const scrollViewRef = useRef<ScrollView>(null);
	const pulseAnim = useRef(new RNAnimated.Value(1)).current;

	// Draggable position - separate from pulse animation
	const translateX = useRef(
		new RNAnimated.Value(width - BUTTON_SIZE - EDGE_PADDING),
	).current;
	const translateY = useRef(
		new RNAnimated.Value(height - BUTTON_SIZE - 120),
	).current;

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: () => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				translateX.setOffset((translateX as any)._value);
				translateY.setOffset((translateY as any)._value);
				translateX.setValue(0);
				translateY.setValue(0);
			},
			onPanResponderMove: RNAnimated.event(
				[null, { dx: translateX, dy: translateY }],
				{ useNativeDriver: false },
			),
			onPanResponderRelease: (_, gesture) => {
				translateX.flattenOffset();
				translateY.flattenOffset();

				// Snap to nearest edge (left or right)
				const currentX = (translateX as any)._value;
				const currentY = (translateY as any)._value;

				// Calculate snap position
				let snapX = currentX;
				let snapY = currentY;

				// Snap to left or right edge
				if (currentX < width / 2) {
					snapX = EDGE_PADDING; // Snap to left
					setIsDockedLeft(true);
				} else {
					snapX = width - BUTTON_SIZE - EDGE_PADDING; // Snap to right
					setIsDockedLeft(false);
				}

				// Keep within vertical bounds
				if (currentY < EDGE_PADDING) {
					snapY = EDGE_PADDING;
				} else if (currentY > height - BUTTON_SIZE - 120) {
					snapY = height - BUTTON_SIZE - 120;
				}

				// Animate to snap position
				RNAnimated.spring(translateX, {
					toValue: snapX,
					useNativeDriver: false,
					friction: 7,
					tension: 40,
				}).start();

				RNAnimated.spring(translateY, {
					toValue: snapY,
					useNativeDriver: false,
					friction: 7,
					tension: 40,
				}).start();

				// If it was a tap (not a drag), open the chat
				if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
					handleOpen();
				}
			},
		}),
	).current;

	// Greeting bubble cycle
	useEffect(() => {
		if (!user) {
			setShowGreetingBubble(false);
			return;
		}

		if (visible) {
			setShowGreetingBubble(false);
			return;
		}

		let cycleHideTimeout: ReturnType<typeof setTimeout> | null = null;

		const showBubble = () => {
			setShowGreetingBubble(true);

			if (cycleHideTimeout) {
				clearTimeout(cycleHideTimeout);
			}

			cycleHideTimeout = setTimeout(() => {
				setShowGreetingBubble(false);
			}, 6000);
		};

		showBubble();

		const interval = setInterval(showBubble, 20000);

		return () => {
			if (cycleHideTimeout) {
				clearTimeout(cycleHideTimeout);
			}
			clearInterval(interval);
		};
	}, [user?.id, user?.gender, visible]);

	const honorific =
		user?.gender === "Nam" ? "Ông" : user?.gender === "Nữ" ? "Bà" : "Bạn";
	const greetingText =
		honorific === "Bạn"
			? "Bạn đang khó chịu ở đâu? Tôi có thể giúp gì không?"
			: `${honorific} chủ đang khó chịu ở đâu? Tôi có thể giúp gì không?`;

	useEffect(() => {
		// Pulse animation for floating button
		const pulse = RNAnimated.loop(
			RNAnimated.sequence([
				RNAnimated.timing(pulseAnim, {
					toValue: 1.1,
					duration: 1000,
					useNativeDriver: true,
				}),
				RNAnimated.timing(pulseAnim, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
			]),
		);
		pulse.start();
		return () => pulse.stop();
	}, []);

	useEffect(() => {
		if (visible && user) {
			loadChatHistory();
		}
	}, [visible, user]);

	const loadChatHistory = async () => {
		if (!user) return;

		try {
			const data = await api.get("/chat-history?limit=50");
			if (data) setMessages(data);
		} catch (error) {
			console.error("Load chat history error:", error);
		}
	};

	const saveChatMessage = async (
		role: "user" | "assistant",
		content: string,
	) => {
		if (!user) return;

		try {
			const data = await api.post("/chat-history", {
				role,
				message: content,
			});
			return data;
		} catch (error) {
			console.error("Save chat message error:", error);
		}
	};

	const handleSend = async () => {
		if (!inputText.trim() || !user) return;

		const userMessage = inputText.trim();
		setInputText("");
		setLoading(true);

		try {
			// Add user message
			const userMsg = await saveChatMessage("user", userMessage);
			if (userMsg) {
				setMessages((prev) => [...prev, userMsg]);
			}

			// Get AI response with full context
			const chatHistory = messages.map((msg) => ({
				role: msg.role,
				content: (msg as any).message || msg.content || "",
			}));

			const aiResponse = await chatWithAssistant(userMessage, chatHistory);

			// Add AI message
			const aiMsg = await saveChatMessage("assistant", aiResponse);
			if (aiMsg) {
				setMessages((prev) => [...prev, aiMsg]);
			}

			// Scroll to bottom
			setTimeout(() => {
				scrollViewRef.current?.scrollToEnd({ animated: true });
			}, 100);
		} catch (error) {
			console.error("Send message error:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpen = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setShowGreetingBubble(false);
		setVisible(true);
	};

	const handleClose = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setVisible(false);
	};

	const handleClearHistory = () => {
		if (!user) return;

		Alert.alert(
			"Xóa lịch sử chat",
			"Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?",
			[
				{
					text: "Hủy",
					style: "cancel",
				},
				{
					text: "Xóa",
					style: "destructive",
					onPress: async () => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

						try {
							await api.delete("/chat-history");
							setMessages([]);
							Alert.alert("Thành công", "Đã xóa lịch sử chat");
						} catch (error) {
							console.error("Clear chat history error:", error);
							Alert.alert(
								"Lỗi",
								"Không thể xóa lịch sử chat. Vui lòng thử lại.",
							);
						}
					},
				},
			],
		);
	};

	const renderMessage = (message: Message, index: number) => {
		const isUser = message.role === "user";
		const messageText = (message as any).message || message.content || "";

		return (
			<View
				key={message.id}
				style={[
					styles.messageRow,
					isUser ? styles.userMessageRow : styles.aiMessageRow,
				]}
			>
				{!isUser && (
					<View style={styles.avatarContainer}>
						<LinearGradient
							colors={["#5B9BD5", "#4A7FB8"]}
							style={styles.avatar}
						>
							<Bot size={16} color="#FFFFFF" />
						</LinearGradient>
					</View>
				)}

				<LinearGradient
					colors={isUser ? ["#5B9BD5", "#4A7FB8"] : ["#FFFFFF", "#F9FAFB"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={[
						styles.messageContainer,
						isUser ? styles.userMessage : styles.aiMessage,
					]}
				>
					<Text
						style={[
							styles.messageText,
							isUser ? styles.userMessageText : styles.aiMessageText,
						]}
					>
						{messageText}
					</Text>
				</LinearGradient>

				{isUser && (
					<View style={styles.avatarContainer}>
						<LinearGradient
							colors={["#10B981", "#059669"]}
							style={styles.avatar}
						>
							<UserIcon size={16} color="#FFFFFF" />
						</LinearGradient>
					</View>
				)}
			</View>
		);
	};

	return (
		<>
			{/* Floating Draggable Button */}
			{!visible && (
				<RNAnimated.View
					{...panResponder.panHandlers}
					style={[
						styles.floatingButton,
						{
							transform: [
								{ translateX: translateX },
								{ translateY: translateY },
							],
						},
					]}
				>
					{showGreetingBubble && (
						<View
							pointerEvents="none"
							style={[
								styles.greetingBubbleWrap,
								isDockedLeft
									? styles.greetingBubbleLeft
									: styles.greetingBubbleRight,
							]}
						>
							<View style={styles.greetingBubble}>
								<Text style={styles.greetingText}>{greetingText}</Text>
								<View
									style={[
										styles.greetingTail,
										isDockedLeft
											? styles.greetingTailLeft
											: styles.greetingTailRight,
									]}
								/>
							</View>
						</View>
					)}
					<RNAnimated.View style={{ transform: [{ scale: pulseAnim }] }}>
						<LinearGradient
							colors={["#5B9BD5", "#4A7FB8"]}
							style={styles.floatingButtonGradient}
						>
							<Bot size={28} color="#FFFFFF" strokeWidth={2.5} />
						</LinearGradient>
					</RNAnimated.View>
				</RNAnimated.View>
			)}

			{/* Chatbot Modal */}
			<Modal
				visible={visible}
				transparent
				animationType="slide"
				onRequestClose={handleClose}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={styles.keyboardAvoid}
					keyboardVerticalOffset={0}
				>
					<TouchableOpacity
						style={styles.modalOverlay}
						activeOpacity={1}
						onPress={handleClose}
					>
						<TouchableOpacity
							activeOpacity={1}
							style={styles.chatContainer}
							onPress={(e) => e.stopPropagation()}
						>
							{/* Header - Fixed at top */}
							<LinearGradient
								colors={["#5B9BD5", "#4A7FB8"]}
								style={styles.headerContainer}
							>
								<View style={styles.header}>
									<View style={styles.headerLeft}>
										<View style={styles.headerIcon}>
											<Bot size={24} color="#FFFFFF" />
										</View>
										<View>
											<Text style={styles.headerTitle}>TheraAI</Text>
											<Text style={styles.headerSubtitle}>
												Trợ lý sức khỏe thông minh
											</Text>
										</View>
									</View>
									<View style={styles.headerRight}>
										{messages.length > 0 && (
											<TouchableOpacity
												onPress={handleClearHistory}
												style={styles.clearButton}
											>
												<Trash2 size={20} color="#FFFFFF" />
											</TouchableOpacity>
										)}
										<TouchableOpacity
											onPress={handleClose}
											style={styles.closeButton}
										>
											<X size={24} color="#FFFFFF" />
										</TouchableOpacity>
									</View>
								</View>
							</LinearGradient>

							{/* Content Area */}
							<LinearGradient
								colors={["#EFF6FF", "#FFFFFF"]}
								style={styles.contentContainer}
							>
								{/* Messages */}
								<ScrollView
									ref={scrollViewRef}
									style={styles.messagesContainer}
									contentContainerStyle={styles.messagesContent}
									onContentSizeChange={() =>
										scrollViewRef.current?.scrollToEnd({ animated: true })
									}
									showsVerticalScrollIndicator={false}
									keyboardShouldPersistTaps="handled"
									scrollEnabled={true}
									bounces={true}
								>
									{messages.length === 0 ? (
										<View style={styles.emptyContainer}>
											<Text style={styles.emptyTitle}>Xin chào! 👋</Text>
											<Text style={styles.emptyText}>{greetingText}</Text>
										</View>
									) : (
										messages.map((msg, idx) => renderMessage(msg, idx))
									)}

									{loading && (
										<View style={styles.loadingRow}>
											<View style={styles.avatarContainer}>
												<LinearGradient
													colors={["#5B9BD5", "#4A7FB8"]}
													style={styles.avatar}
												>
													<Bot size={16} color="#FFFFFF" />
												</LinearGradient>
											</View>
											<View style={styles.loadingMessage}>
												<ActivityIndicator
													size="small"
													color={colors.primary}
												/>
												<Text style={styles.loadingText}>Đang suy nghĩ...</Text>
											</View>
										</View>
									)}
								</ScrollView>

								{/* Input - Fixed at bottom */}
								<View style={styles.inputContainer}>
									<View style={styles.inputWrapper}>
										<TextInput
											value={inputText}
											onChangeText={setInputText}
											placeholder="Nhập tin nhắn..."
											mode="flat"
											style={styles.input}
											multiline
											maxLength={500}
											disabled={loading}
											underlineColor="transparent"
											activeUnderlineColor="transparent"
											placeholderTextColor="#9CA3AF"
											cursorColor={colors.primary}
											selectionColor={colors.primary + "40"}
										/>
										<TouchableOpacity
											onPress={() => {
												Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
												handleSend();
											}}
											disabled={!inputText.trim() || loading}
											activeOpacity={0.7}
											style={[
												styles.sendButton,
												(!inputText.trim() || loading) &&
													styles.sendButtonDisabled,
											]}
										>
											<LinearGradient
												colors={
													!inputText.trim() || loading
														? ["#E5E7EB", "#D1D5DB"]
														: ["#5B9BD5", "#4A7FB8"]
												}
												style={styles.sendButtonGradient}
											>
												<Send size={18} color="#FFFFFF" fill="#FFFFFF" />
											</LinearGradient>
										</TouchableOpacity>
									</View>
								</View>
							</LinearGradient>
						</TouchableOpacity>
					</TouchableOpacity>
				</KeyboardAvoidingView>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	floatingButton: {
		position: "absolute",
		width: BUTTON_SIZE,
		height: BUTTON_SIZE,
		zIndex: 1000,
		shadowColor: colors.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	floatingButtonGradient: {
		width: BUTTON_SIZE,
		height: BUTTON_SIZE,
		borderRadius: BUTTON_SIZE / 2,
		justifyContent: "center",
		alignItems: "center",
	},
	greetingBubbleWrap: {
		position: "absolute",
		bottom: BUTTON_SIZE + 12,
		width: 230,
	},
	greetingBubbleLeft: {
		left: 0,
	},
	greetingBubbleRight: {
		right: 0,
	},
	greetingBubble: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "rgba(91, 155, 213, 0.18)",
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.16,
		shadowRadius: 18,
		elevation: 6,
	},
	greetingText: {
		fontSize: 13,
		lineHeight: 18,
		color: "#1E293B",
		fontWeight: "600",
	},
	greetingTail: {
		position: "absolute",
		bottom: -9,
		width: 18,
		height: 18,
		backgroundColor: "#FFFFFF",
		transform: [{ rotate: "45deg" }],
		borderRightWidth: 1,
		borderBottomWidth: 1,
		borderColor: "rgba(91, 155, 213, 0.18)",
	},
	greetingTailLeft: {
		left: 20,
	},
	greetingTailRight: {
		right: 20,
	},
	keyboardAvoid: {
		flex: 1,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	chatContainer: {
		height: height * 0.92,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		overflow: "hidden",
		width: "100%",
		backgroundColor: "#FFFFFF",
	},
	headerContainer: {
		paddingTop: 8,
		paddingBottom: 12,
		paddingHorizontal: 16,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	contentContainer: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
	},
	headerIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
	headerSubtitle: {
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.9)",
		marginTop: 2,
	},
	clearButton: {
		padding: 4,
	},
	closeButton: {
		padding: 4,
		marginLeft: 8,
	},
	messagesContainer: {
		flex: 1,
	},
	messagesContent: {
		padding: 16,
		paddingBottom: 100,
		minHeight: height * 0.9,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyTitle: {
		fontSize: 28,
		fontWeight: "bold",
		color: colors.text,
		marginBottom: 16,
	},
	emptyText: {
		fontSize: 14,
		color: colors.textSecondary,
		textAlign: "center",
		lineHeight: 20,
		paddingHorizontal: 24,
	},
	messageRow: {
		flexDirection: "row",
		alignItems: "flex-end",
		marginBottom: 12,
		gap: 6,
	},
	userMessageRow: {
		justifyContent: "flex-end",
	},
	aiMessageRow: {
		justifyContent: "flex-start",
	},
	avatarContainer: {
		marginBottom: 2,
	},
	avatar: {
		width: 28,
		height: 28,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
	},
	messageContainer: {
		maxWidth: "75%",
		padding: 12,
		borderRadius: 16,
	},
	userMessage: {
		borderBottomRightRadius: 4,
	},
	aiMessage: {
		borderBottomLeftRadius: 4,
		borderWidth: 1,
		borderColor: "rgba(91, 155, 213, 0.1)",
	},
	messageText: {
		fontSize: 14,
		lineHeight: 20,
		color: colors.text,
	},
	userMessageText: {
		color: "#FFFFFF",
		fontWeight: "500",
	},
	aiMessageText: {
		color: "#1F2937",
	},
	loadingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 12,
	},
	loadingMessage: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: colors.surface,
		padding: 12,
		borderRadius: 16,
		borderBottomLeftRadius: 4,
	},
	loadingText: {
		fontSize: 12,
		color: colors.textSecondary,
		fontStyle: "italic",
	},
	inputContainer: {
		padding: 16,
		backgroundColor: "#FFF",
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "flex-end",
		backgroundColor: "#F3F4F6",
		borderRadius: 24,
		paddingLeft: 16,
		paddingRight: 6,
		paddingVertical: 6,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	input: {
		flex: 1,
		backgroundColor: "transparent",
		maxHeight: 100,
		fontSize: 15,
		paddingHorizontal: 0,
		minHeight: 40,
	},
	sendButton: {
		marginLeft: 8,
	},
	sendButtonDisabled: {
		opacity: 0.5,
	},
	sendButtonGradient: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 3,
	},
});
