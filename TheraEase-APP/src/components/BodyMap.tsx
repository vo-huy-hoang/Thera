import React, { useMemo, useState } from "react";
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Text,
	Dimensions,
} from "react-native";
import Svg, { Circle, Line, Path, Polygon } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@/utils/theme";
import { PAIN_AREAS } from "@/utils/constants";
import { useAuthStore } from "@/stores/authStore";

interface BodyMapProps {
	selectedAreas: Record<string, number>;
	onAreaPress: (area: string, level: number) => void;
}

type FocusArea = {
	id: string;
	label: string;
	targetX: number;
	targetY: number;
	labelX: number;
	labelY: number;
	side: "left" | "right";
};

const { width } = Dimensions.get("window");
const MAP_WIDTH = width - 32;
const MAP_HEIGHT = 500;

function BodyIllustration({ gender }: { gender: "male" | "female" }) {
	const stroke = "#111827";
	const accent = "#CBD5E1";
	const lineProps = {
		stroke,
		strokeWidth: 3.5,
		fill: "none" as const,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
	};
	const accentProps = {
		stroke: accent,
		strokeWidth: 2,
		fill: "none" as const,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
	};

	if (gender === "female") {
		return (
			<Svg viewBox="0 0 240 420" width="100%" height="100%">
				<Circle
					cx="120"
					cy="14"
					r="12"
					fill="#FFFFFF"
					stroke={stroke}
					strokeWidth="3.5"
				/>
				<Path
					d="M120 20 C98 20 84 39 84 67 C84 95 95 118 120 118 C145 118 156 95 156 67 C156 39 142 20 120 20 Z"
					{...lineProps}
				/>
				<Path
					d="M83 62 C74 62 70 69 70 82 C70 94 74 101 83 101"
					{...lineProps}
				/>
				<Path
					d="M157 62 C166 62 170 69 170 82 C170 94 166 101 157 101"
					{...lineProps}
				/>
				<Path d="M103 114 C101 132 98 147 92 164" {...lineProps} />
				<Path d="M137 114 C139 132 142 147 148 164" {...lineProps} />
				<Path
					d="M91 163 C75 168 62 172 49 179 C40 183 34 192 32 204 C27 236 30 302 24 394"
					{...lineProps}
				/>
				<Path
					d="M149 163 C165 168 178 172 191 179 C200 183 206 192 208 204 C213 236 210 302 216 394"
					{...lineProps}
				/>
				<Path d="M56 190 C69 232 73 289 56 396" {...lineProps} />
				<Path d="M184 190 C171 232 167 289 184 396" {...lineProps} />
				<Path d="M99 164 C93 193 92 258 92 398" {...lineProps} />
				<Path d="M141 164 C147 193 148 258 148 398" {...lineProps} />
				<Path
					d="M92 165 C101 177 111 184 120 184 C129 184 139 177 148 165"
					{...lineProps}
				/>
				<Path d="M96 154 C103 149 110 147 116 151" {...accentProps} />
				<Path d="M144 154 C137 149 130 147 124 151" {...accentProps} />
				<Path
					d="M99 186 C106 196 113 202 120 202 C127 202 134 196 141 186"
					stroke={stroke}
					strokeWidth={2.5}
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</Svg>
		);
	}

	return (
		<Svg viewBox="0 0 240 420" width="100%" height="100%">
			<Path
				d="M120 18 C95 18 79 39 79 69 C79 98 92 122 120 122 C148 122 161 98 161 69 C161 39 145 18 120 18 Z"
				{...lineProps}
			/>
			<Path d="M78 63 C69 63 65 70 65 84 C65 97 69 104 78 104" {...lineProps} />
			<Path
				d="M162 63 C171 63 175 70 175 84 C175 97 171 104 162 104"
				{...lineProps}
			/>
			<Path d="M104 118 C102 136 99 152 94 170" {...lineProps} />
			<Path d="M136 118 C138 136 141 152 146 170" {...lineProps} />
			<Path
				d="M93 169 C76 173 60 177 43 184 C31 189 24 198 21 211 C16 244 20 302 16 394"
				{...lineProps}
			/>
			<Path
				d="M147 169 C164 173 180 177 197 184 C209 189 216 198 219 211 C224 244 220 302 224 394"
				{...lineProps}
			/>
			<Path d="M56 191 C71 238 75 289 57 396" {...lineProps} />
			<Path d="M184 191 C169 238 165 289 183 396" {...lineProps} />
			<Path d="M100 170 C93 206 93 259 90 398" {...lineProps} />
			<Path d="M140 170 C147 206 147 259 150 398" {...lineProps} />
			<Path
				d="M94 170 C103 181 111 187 120 187 C129 187 137 181 146 170"
				{...lineProps}
			/>
			<Path d="M95 158 C102 153 110 151 116 155" {...accentProps} />
			<Path d="M145 158 C138 153 130 151 124 155" {...accentProps} />
		</Svg>
	);
}

export default function BodyMap({ selectedAreas, onAreaPress }: BodyMapProps) {
	const { user } = useAuthStore();
	const [selectedArea, setSelectedArea] = useState<string | null>(null);

	const focusAreas = useMemo<FocusArea[]>(
		() => [
			{
				id: PAIN_AREAS.NECK,
				label: "Cổ",
				targetX: MAP_WIDTH * 0.5,
				targetY: MAP_HEIGHT * 0.38,
				labelX: MAP_WIDTH * 0.08,
				labelY: MAP_HEIGHT * 0.08,
				side: "left",
			},
			{
				id: PAIN_AREAS.SHOULDER_LEFT,
				label: "Vai trái",
				targetX: MAP_WIDTH * 0.38,
				targetY: MAP_HEIGHT * 0.47,
				labelX: MAP_WIDTH * 0.02,
				labelY: MAP_HEIGHT * 0.22,
				side: "left",
			},
			{
				id: PAIN_AREAS.SHOULDER_RIGHT,
				label: "Vai phải",
				targetX: MAP_WIDTH * 0.62,
				targetY: MAP_HEIGHT * 0.47,
				labelX: MAP_WIDTH * 0.68,
				labelY: MAP_HEIGHT * 0.22,
				side: "right",
			},
			{
				id: PAIN_AREAS.UPPER_BACK,
				label: "Lưng trên",
				targetX: MAP_WIDTH * 0.5,
				targetY: MAP_HEIGHT * 0.53,
				labelX: MAP_WIDTH * 0.72,
				labelY: MAP_HEIGHT * 0.34,
				side: "right",
			},
			{
				id: PAIN_AREAS.MIDDLE_BACK,
				label: "Lưng giữa",
				targetX: MAP_WIDTH * 0.5,
				targetY: MAP_HEIGHT * 0.66,
				labelX: MAP_WIDTH * 0.03,
				labelY: MAP_HEIGHT * 0.5,
				side: "left",
			},
			{
				id: PAIN_AREAS.LOWER_BACK,
				label: "Lưng dưới",
				targetX: MAP_WIDTH * 0.5,
				targetY: MAP_HEIGHT * 0.8,
				labelX: MAP_WIDTH * 0.71,
				labelY: MAP_HEIGHT * 0.71,
				side: "right",
			},
		],
		[],
	);

	const getPainColor = (level: number) => {
		if (level === 0) return colors.painNone;
		if (level <= 3) return colors.painMild;
		if (level <= 7) return colors.painModerate;
		return colors.painSevere;
	};

	const handleAreaSelect = (area: string) => {
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setSelectedArea(area);
	};

	const handleLevelSelect = (level: number) => {
		if (!selectedArea) return;
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onAreaPress(selectedArea, level);
		setSelectedArea(null);
	};

	const avatarGender = user?.gender === "Nữ" ? "female" : "male";

	return (
		<View style={styles.container}>
			<View style={styles.legendContainer}>
				<View style={styles.legendRow}>
					<View
						style={[styles.legendDot, { backgroundColor: colors.painNone }]}
					/>
					<Text style={styles.legendText}>Không đau</Text>
				</View>
				<View style={styles.legendRow}>
					<View
						style={[styles.legendDot, { backgroundColor: colors.painMild }]}
					/>
					<Text style={styles.legendText}>Đau nhẹ (1-3)</Text>
				</View>
				<View style={styles.legendRow}>
					<View
						style={[styles.legendDot, { backgroundColor: colors.painModerate }]}
					/>
					<Text style={styles.legendText}>Đau vừa (4-7)</Text>
				</View>
				<View style={styles.legendRow}>
					<View
						style={[styles.legendDot, { backgroundColor: colors.painSevere }]}
					/>
					<Text style={styles.legendText}>Đau nặng/Tê (8-10)</Text>
				</View>
			</View>

			<Text style={styles.instruction}>
				Chạm vào các nhãn hoặc điểm chỉ dẫn để chọn vùng đau.
			</Text>

			<View style={styles.mapCard}>
				<View style={styles.mapWrap}>
					<View style={styles.imageWindow}>
						<View style={styles.figureBackdrop} />
						<View style={styles.figureFrame}>
							<BodyIllustration gender={avatarGender} />
						</View>
					</View>

					<Svg width={MAP_WIDTH} height={MAP_HEIGHT} style={styles.svgLayer}>
						{focusAreas.map((area) => {
							const painLevel = selectedAreas[area.id] || 0;
							const painColor =
								painLevel > 0 ? getPainColor(painLevel) : "#7CC6FF";
							const labelAnchorX =
								area.side === "left" ? area.labelX + 106 : area.labelX;
							const labelAnchorY = area.labelY + 22;
							const arrowTipX = area.targetX;
							const arrowTipY = area.targetY;
							const arrowHead =
								area.side === "left"
									? `${arrowTipX},${arrowTipY} ${arrowTipX - 12},${arrowTipY - 6} ${arrowTipX - 12},${arrowTipY + 6}`
									: `${arrowTipX},${arrowTipY} ${arrowTipX + 12},${arrowTipY - 6} ${arrowTipX + 12},${arrowTipY + 6}`;

							return (
								<React.Fragment key={`${area.id}-line`}>
									<Line
										x1={labelAnchorX}
										y1={labelAnchorY}
										x2={arrowTipX}
										y2={arrowTipY}
										stroke={painColor}
										strokeWidth={2.5}
										strokeLinecap="round"
									/>
									<Polygon points={arrowHead} fill={painColor} />
									<Circle
										cx={arrowTipX}
										cy={arrowTipY}
										r={9}
										fill={painColor}
										opacity={0.18}
									/>
									<Circle
										cx={arrowTipX}
										cy={arrowTipY}
										r={4.5}
										fill={painColor}
									/>
								</React.Fragment>
							);
						})}
					</Svg>

					{focusAreas.map((area) => {
						const painLevel = selectedAreas[area.id] || 0;
						const isSelected = painLevel > 0;
						const painColor = isSelected ? getPainColor(painLevel) : "#7CC6FF";

						return (
							<React.Fragment key={area.id}>
								<TouchableOpacity
									activeOpacity={0.86}
									onPress={() => handleAreaSelect(area.id)}
									style={[
										styles.labelChip,
										{
											top: area.labelY,
											left: area.labelX,
											borderColor: painColor,
											backgroundColor: isSelected
												? `${painColor}18`
												: "#FFFFFF",
										},
									]}
								>
									<Text style={[styles.labelChipText, { color: painColor }]}>
										{area.label}
									</Text>
									{isSelected && (
										<Text style={[styles.levelPill, { color: painColor }]}>
											{painLevel}/10
										</Text>
									)}
								</TouchableOpacity>

								<TouchableOpacity
									activeOpacity={0.86}
									onPress={() => handleAreaSelect(area.id)}
									style={[
										styles.targetHotspot,
										{
											top: area.targetY - 22,
											left: area.targetX - 22,
											borderColor: painColor,
											backgroundColor: isSelected
												? `${painColor}20`
												: "rgba(124, 198, 255, 0.12)",
										},
									]}
								/>
							</React.Fragment>
						);
					})}
				</View>
			</View>

			{selectedArea && (
				<View style={styles.levelSelector}>
					<Text style={styles.levelTitle}>Chọn mức độ đau cho vùng này</Text>
					<Text style={styles.levelSubtitle}>
						Nếu bị tê rõ hoặc đau mạnh, chọn mức 8-10.
					</Text>
					<View style={styles.levelButtons}>
						<TouchableOpacity
							style={[styles.levelButton, { backgroundColor: colors.painNone }]}
							onPress={() => handleLevelSelect(0)}
						>
							<Text style={styles.levelButtonText}>0</Text>
							<Text style={styles.levelLabel}>Không đau</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.levelButton, { backgroundColor: colors.painMild }]}
							onPress={() => handleLevelSelect(3)}
						>
							<Text style={styles.levelButtonText}>3</Text>
							<Text style={styles.levelLabel}>Nhẹ</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.levelButton,
								{ backgroundColor: colors.painModerate },
							]}
							onPress={() => handleLevelSelect(6)}
						>
							<Text style={styles.levelButtonText}>6</Text>
							<Text style={styles.levelLabel}>Vừa</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.levelButton,
								{ backgroundColor: colors.painSevere },
							]}
							onPress={() => handleLevelSelect(9)}
						>
							<Text style={styles.levelButtonText}>9</Text>
							<Text style={styles.levelLabel}>Nặng/Tê</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity
						style={styles.cancelButton}
						onPress={() => setSelectedArea(null)}
					>
						<Text style={styles.cancelText}>Hủy</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		paddingBottom: 24,
	},
	legendContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 12,
		marginBottom: 14,
		paddingHorizontal: 10,
	},
	legendRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	legendDot: {
		width: 18,
		height: 18,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#94A3B8",
	},
	legendText: {
		fontSize: 12,
		color: colors.text,
		fontWeight: "600",
	},
	instruction: {
		fontSize: 13,
		lineHeight: 20,
		color: colors.textSecondary,
		textAlign: "center",
		marginBottom: 16,
		paddingHorizontal: 24,
		fontWeight: "500",
	},
	mapCard: {
		width: "100%",
		borderRadius: 28,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E2E8F0",
		paddingHorizontal: 12,
		paddingVertical: 14,
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.08,
		shadowRadius: 24,
		elevation: 4,
	},
	mapWrap: {
		width: MAP_WIDTH,
		height: MAP_HEIGHT,
		alignSelf: "center",
		position: "relative",
	},
	imageWindow: {
		position: "absolute",
		top: 20,
		left: MAP_WIDTH * 0.18,
		width: MAP_WIDTH * 0.64,
		height: MAP_HEIGHT * 0.85,
		borderRadius: 28,
		overflow: "hidden",
		backgroundColor: "#FFFFFF",
	},
	figureBackdrop: {
		position: "absolute",
		inset: 0,
		backgroundColor: "#F8FAFC",
	},
	figureFrame: {
		position: "absolute",
		left: "5%",
		width: "90%",
		top: 0,
		height: "100%",
	},
	svgLayer: {
		position: "absolute",
		top: 0,
		left: 0,
	},
	labelChip: {
		position: "absolute",
		minWidth: 110,
		minHeight: 44,
		borderRadius: 18,
		borderWidth: 1.5,
		paddingHorizontal: 12,
		paddingVertical: 8,
		justifyContent: "center",
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 3,
	},
	labelChipText: {
		fontSize: 13,
		fontWeight: "800",
	},
	levelPill: {
		fontSize: 11,
		marginTop: 2,
		fontWeight: "700",
	},
	targetHotspot: {
		position: "absolute",
		width: 44,
		height: 44,
		borderRadius: 22,
		borderWidth: 2,
	},
	levelSelector: {
		width: "100%",
		marginTop: 18,
		backgroundColor: colors.surface,
		padding: 18,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.border,
	},
	levelTitle: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 6,
		color: colors.text,
		textAlign: "center",
	},
	levelSubtitle: {
		fontSize: 13,
		color: colors.textSecondary,
		textAlign: "center",
		marginBottom: 16,
	},
	levelButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	levelButton: {
		width: 70,
		height: 70,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	levelButtonText: {
		fontSize: 20,
		fontWeight: "800",
		color: "#FFF",
	},
	levelLabel: {
		fontSize: 10,
		color: "#FFF",
		marginTop: 4,
		textAlign: "center",
		fontWeight: "700",
	},
	cancelButton: {
		padding: 12,
		alignItems: "center",
	},
	cancelText: {
		fontSize: 16,
		color: colors.primary,
		fontWeight: "700",
	},
});
