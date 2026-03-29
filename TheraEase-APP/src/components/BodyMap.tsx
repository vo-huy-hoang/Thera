import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Dimensions } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/utils/theme';
import { PAIN_AREAS } from '@/utils/constants';

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
  side: 'left' | 'right';
};

const { width } = Dimensions.get('window');
const MAP_WIDTH = width - 32;
const MAP_HEIGHT = 500;

const MALE_IMAGE = require('../../assets/gender-male.png');
const FEMALE_IMAGE = require('../../assets/gender-female.png');

export default function BodyMap({ selectedAreas, onAreaPress }: BodyMapProps) {
  const { user } = useAuthStore();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const focusAreas = useMemo<FocusArea[]>(
    () => [
      {
        id: PAIN_AREAS.NECK,
        label: 'Cổ',
        targetX: MAP_WIDTH * 0.5,
        targetY: MAP_HEIGHT * 0.16,
        labelX: MAP_WIDTH * 0.08,
        labelY: MAP_HEIGHT * 0.08,
        side: 'left',
      },
      {
        id: PAIN_AREAS.SHOULDER_LEFT,
        label: 'Vai trái',
        targetX: MAP_WIDTH * 0.31,
        targetY: MAP_HEIGHT * 0.22,
        labelX: MAP_WIDTH * 0.02,
        labelY: MAP_HEIGHT * 0.22,
        side: 'left',
      },
      {
        id: PAIN_AREAS.SHOULDER_RIGHT,
        label: 'Vai phải',
        targetX: MAP_WIDTH * 0.69,
        targetY: MAP_HEIGHT * 0.22,
        labelX: MAP_WIDTH * 0.68,
        labelY: MAP_HEIGHT * 0.22,
        side: 'right',
      },
      {
        id: PAIN_AREAS.UPPER_BACK,
        label: 'Lưng trên',
        targetX: MAP_WIDTH * 0.5,
        targetY: MAP_HEIGHT * 0.31,
        labelX: MAP_WIDTH * 0.72,
        labelY: MAP_HEIGHT * 0.34,
        side: 'right',
      },
      {
        id: PAIN_AREAS.MIDDLE_BACK,
        label: 'Lưng giữa',
        targetX: MAP_WIDTH * 0.5,
        targetY: MAP_HEIGHT * 0.45,
        labelX: MAP_WIDTH * 0.03,
        labelY: MAP_HEIGHT * 0.44,
        side: 'left',
      },
      {
        id: PAIN_AREAS.LOWER_BACK,
        label: 'Lưng dưới',
        targetX: MAP_WIDTH * 0.5,
        targetY: MAP_HEIGHT * 0.6,
        labelX: MAP_WIDTH * 0.71,
        labelY: MAP_HEIGHT * 0.58,
        side: 'right',
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

  const avatarSource = user?.gender === 'Nữ' ? FEMALE_IMAGE : MALE_IMAGE;

  return (
    <View style={styles.container}>
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.painNone }]} />
          <Text style={styles.legendText}>Không đau</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.painMild }]} />
          <Text style={styles.legendText}>Đau nhẹ (1-3)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.painModerate }]} />
          <Text style={styles.legendText}>Đau vừa (4-7)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.painSevere }]} />
          <Text style={styles.legendText}>Đau nặng/Tê (8-10)</Text>
        </View>
      </View>

      <Text style={styles.instruction}>Chạm vào các nhãn hoặc điểm chỉ dẫn để chọn vùng đau.</Text>

      <View style={styles.mapCard}>
        <View style={styles.mapWrap}>
          <View style={styles.imageWindow}>
            <Image source={avatarSource} style={styles.bodyImage} resizeMode="cover" />
            <View style={styles.imageShade} />
          </View>

          <Svg width={MAP_WIDTH} height={MAP_HEIGHT} style={styles.svgLayer}>
            {focusAreas.map((area) => {
              const painLevel = selectedAreas[area.id] || 0;
              const painColor = painLevel > 0 ? getPainColor(painLevel) : '#7CC6FF';
              const labelAnchorX = area.side === 'left' ? area.labelX + 106 : area.labelX;
              const labelAnchorY = area.labelY + 22;
              const arrowTipX = area.targetX;
              const arrowTipY = area.targetY;
              const arrowHead =
                area.side === 'left'
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
                  <Circle cx={arrowTipX} cy={arrowTipY} r={9} fill={painColor} opacity={0.18} />
                  <Circle cx={arrowTipX} cy={arrowTipY} r={4.5} fill={painColor} />
                </React.Fragment>
              );
            })}
          </Svg>

          {focusAreas.map((area) => {
            const painLevel = selectedAreas[area.id] || 0;
            const isSelected = painLevel > 0;
            const painColor = isSelected ? getPainColor(painLevel) : '#7CC6FF';

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
                      backgroundColor: isSelected ? `${painColor}18` : '#FFFFFF',
                    },
                  ]}
                >
                  <Text style={[styles.labelChipText, { color: painColor }]}>{area.label}</Text>
                  {isSelected && <Text style={[styles.levelPill, { color: painColor }]}>{painLevel}/10</Text>}
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
                      backgroundColor: isSelected ? `${painColor}20` : 'rgba(124, 198, 255, 0.12)',
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
          <Text style={styles.levelSubtitle}>Nếu bị tê rõ hoặc đau mạnh, chọn mức 8-10.</Text>
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
              style={[styles.levelButton, { backgroundColor: colors.painModerate }]}
              onPress={() => handleLevelSelect(6)}
            >
              <Text style={styles.levelButtonText}>6</Text>
              <Text style={styles.levelLabel}>Vừa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.levelButton, { backgroundColor: colors.painSevere }]}
              onPress={() => handleLevelSelect(9)}
            >
              <Text style={styles.levelButtonText}>9</Text>
              <Text style={styles.levelLabel}>Nặng/Tê</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedArea(null)}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
    fontWeight: '500',
  },
  mapCard: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  mapWrap: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    alignSelf: 'center',
    position: 'relative',
  },
  imageWindow: {
    position: 'absolute',
    top: 36,
    left: MAP_WIDTH * 0.18,
    width: MAP_WIDTH * 0.64,
    height: MAP_HEIGHT * 0.76,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  bodyImage: {
    position: 'absolute',
    top: -18,
    left: -10,
    width: MAP_WIDTH * 0.7,
    height: MAP_HEIGHT * 0.98,
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  labelChip: {
    position: 'absolute',
    minWidth: 110,
    minHeight: 44,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  labelChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  levelPill: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
  },
  targetHotspot: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  levelSelector: {
    width: '100%',
    marginTop: 18,
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: colors.text,
    textAlign: 'center',
  },
  levelSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  levelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  levelButton: {
    width: 70,
    height: 70,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  levelLabel: {
    fontSize: 10,
    color: '#FFF',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '700',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
});
