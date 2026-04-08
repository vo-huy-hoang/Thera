import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Ellipse, Line, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors } from '@/utils/theme';
import { getPainAreaLabel, PAIN_AREAS } from '@/utils/constants';

interface BodyMapProps {
  selectedAreas: Record<string, number>;
  onAreaPress: (area: string, level: number) => void;
}

type BodyRegion = {
  id: string;
  label: string;
  points: string;
};

const VIEWBOX_WIDTH = 300;
const VIEWBOX_HEIGHT = 440;
const MAP_HEIGHT = 460;
const REGION_IDLE_FILL = 'rgba(255,255,255,0.35)';
const REGION_STROKE = 'rgba(255,255,255,0.7)';
const BODY_STROKE = '#A0AEBE';

const BODY_REGIONS: BodyRegion[] = [
  {
    id: PAIN_AREAS.NECK,
    label: 'Cổ',
    points: '122,88 178,88 190,115 150,148 110,115',
  },
  {
    id: PAIN_AREAS.SHOULDER_LEFT,
    label: 'Vai trái',
    points: '110,115 82,148 74,198 124,188 150,148',
  },
  {
    id: PAIN_AREAS.SHOULDER_RIGHT,
    label: 'Vai phải',
    points: '150,148 176,188 226,198 218,148 190,115',
  },
  {
    id: PAIN_AREAS.UPPER_BACK,
    label: 'Lưng trên',
    points: '124,188 150,148 176,188 180,246 150,258 120,246',
  },
  {
    id: PAIN_AREAS.MIDDLE_BACK,
    label: 'Lưng giữa',
    points: '120,246 150,258 180,246 184,320 150,334 116,320',
  },
  {
    id: PAIN_AREAS.LOWER_BACK,
    label: 'Lưng dưới',
    points: '116,320 150,334 184,320 190,388 172,420 128,420 110,388',
  },
];

export default function BodyMap({ selectedAreas, onAreaPress }: BodyMapProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const getPainColor = (level: number) => {
    if (level === 0) return colors.painNone;
    if (level <= 3) return colors.painMild;
    if (level <= 7) return colors.painModerate;
    return colors.painSevere;
  };

  const hasAreaValue = (areaId: string) => Object.prototype.hasOwnProperty.call(selectedAreas, areaId);

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

  return (
    <View style={styles.container}>
      <View style={styles.mapCard}>
        <Text style={styles.mapHint}>Chạm trực tiếp lên cổ, vai hoặc lưng để tô màu vùng đau.</Text>

        <View style={styles.mapCanvas}>
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          >
            <Defs>
              <LinearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#E2E8F0" stopOpacity="1" />
                <Stop offset="1" stopColor="#94A3B8" stopOpacity="1" />
              </LinearGradient>
              <LinearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#60A5FA" stopOpacity="0.4" />
                <Stop offset="1" stopColor="#3B82F6" stopOpacity="0.75" />
              </LinearGradient>
            </Defs>

            {/* Vertical spine indicator line */}
            <Line
              x1="150"
              y1="12"
              x2="150"
               y2="428"
               stroke="rgba(255,255,255,0.4)"
               strokeWidth="1"
               strokeDasharray="4 4"
            />

            {/* Head and Ears smoothed */}
            <Ellipse
              cx="150" cy="54" rx="32" ry="40"
              fill="url(#bodyGradient)" stroke={BODY_STROKE} strokeWidth="10"
            />
            <Ellipse
              cx="115" cy="66" rx="6" ry="16"
              fill="url(#bodyGradient)" stroke={BODY_STROKE} strokeWidth="6"
            />
            <Ellipse
              cx="185" cy="66" rx="6" ry="16"
              fill="url(#bodyGradient)" stroke={BODY_STROKE} strokeWidth="6"
            />

            {/* Arms smoothed */}
            <Polygon
              points="84,148 54,182 42,255 46,340 56,430 76,430 72,340 74,264 86,205 102,160"
              fill="url(#bodyGradient)" stroke={BODY_STROKE} strokeWidth="14" strokeLinejoin="round"
            />
            <Polygon
              points="216,148 246,182 258,255 254,340 244,430 224,430 228,340 226,264 214,205 198,160"
              fill="url(#bodyGradient)" stroke={BODY_STROKE} strokeWidth="14" strokeLinejoin="round"
            />

            {/* Main Torso Outline smoothed */}
            <Polygon
              points="110,115 82,148 74,205 78,290 90,372 112,430 188,430 210,372 222,290 226,205 218,148 190,115"
              fill="url(#bodyGradient)" stroke={BODY_STROKE} strokeWidth="14" strokeLinejoin="round"
            />

            {/* The interactive muscle regions */}
            {BODY_REGIONS.map((region) => {
              const hasValue = hasAreaValue(region.id);
              const painLevel = hasValue ? selectedAreas[region.id] : null;
              const isIdle = painLevel === null;
              const fillColor = isIdle ? REGION_IDLE_FILL : getPainColor(painLevel);
              const isActive = selectedArea === region.id;

              return (
                <Polygon
                  key={region.id}
                  points={region.points}
                  fill={isActive && isIdle ? "url(#activeGradient)" : fillColor}
                  opacity={isIdle ? 0.9 : 1}
                  stroke={isActive ? '#1D4ED8' : REGION_STROKE}
                  strokeWidth={isActive ? 4 : 2.5}
                  strokeLinejoin="round"
                  onPress={() => handleAreaSelect(region.id)}
                />
              );
            })}
          </Svg>
        </View>

        <View style={styles.regionLegend}>
          {BODY_REGIONS.map((region) => {
            const hasValue = hasAreaValue(region.id);
            const level = hasValue ? selectedAreas[region.id] : null;
            const badgeColor = level === null ? '#CBD5E1' : getPainColor(level);

            return (
              <TouchableOpacity
                key={region.id}
                style={styles.regionChip}
                activeOpacity={0.85}
                onPress={() => handleAreaSelect(region.id)}
              >
                <View style={[styles.regionChipDot, { backgroundColor: badgeColor }]} />
                <Text style={styles.regionChipText}>
                  {region.label}
                  {level !== null ? ` ${level}/10` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selectedArea && (
        <View style={styles.levelSelector}>
          <Text style={styles.levelTitle}>Mức đau: {getPainAreaLabel(selectedArea)}</Text>
          <Text style={styles.levelSubtitle}>Chọn mức phù hợp nhất với cảm giác của bạn ở vùng này.</Text>
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
  mapCard: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  mapHint: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 14,
    fontWeight: '500',
  },
  mapCanvas: {
    width: '100%',
    height: MAP_HEIGHT,
    alignSelf: 'center',
  },
  regionLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  regionChipDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  regionChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
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
