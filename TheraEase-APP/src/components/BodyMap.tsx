import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Dimensions, ScrollView } from 'react-native';
import { colors } from '@/utils/theme';
import { PAIN_AREAS } from '@/utils/constants';
import * as Haptics from 'expo-haptics';

interface BodyMapProps {
  selectedAreas: Record<string, number>;
  onAreaPress: (area: string, level: number) => void;
}

const { width } = Dimensions.get('window');
const BODY_WIDTH = width * 0.8;
const BODY_HEIGHT = BODY_WIDTH * 2.2;

export default function BodyMap({ selectedAreas, onAreaPress }: BodyMapProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const getPainColor = (level: number) => {
    if (level === 0) return colors.painNone;
    if (level <= 3) return colors.painMild;
    if (level <= 7) return colors.painModerate;
    return colors.painSevere;
  };

  const getPainLabel = (level: number) => {
    if (level === 0) return 'Không đau';
    if (level <= 3) return 'Đau nhẹ';
    if (level <= 7) return 'Đau vừa';
    return 'Đau nặng';
  };

  const handleAreaPress = (area: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedArea(area);
  };

  const handleLevelSelect = (level: number) => {
    if (selectedArea) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAreaPress(selectedArea, level);
      setSelectedArea(null);
    }
  };

  // Định nghĩa vị trí các vùng trên body (% của chiều cao/rộng)
  const bodyAreas = [
    // Cổ
    { id: PAIN_AREAS.NECK, label: 'Cổ', top: '7%', left: '40%', width: '20%', height: '5%' },
    
    // Vai
    { id: PAIN_AREAS.SHOULDER_LEFT, label: 'Vai trái', top: '12%', left: '15%', width: '25%', height: '8%' },
    { id: PAIN_AREAS.SHOULDER_RIGHT, label: 'Vai phải', top: '12%', left: '60%', width: '25%', height: '8%' },
    
    // Lưng
    { id: PAIN_AREAS.UPPER_BACK, label: 'Lưng trên', top: '20%', left: '35%', width: '30%', height: '12%' },
    { id: PAIN_AREAS.MIDDLE_BACK, label: 'Lưng giữa', top: '32%', left: '32%', width: '36%', height: '15%' },
    { id: PAIN_AREAS.LOWER_BACK, label: 'Lưng dưới', top: '47%', left: '32%', width: '36%', height: '12%' },
    
    // Tay (mới thêm)
    { id: 'arm_left', label: 'Cánh tay trái', top: '20%', left: '8%', width: '15%', height: '20%' },
    { id: 'arm_right', label: 'Cánh tay phải', top: '20%', left: '77%', width: '15%', height: '20%' },
    { id: 'hand_left', label: 'Bàn tay trái', top: '40%', left: '5%', width: '12%', height: '8%' },
    { id: 'hand_right', label: 'Bàn tay phải', top: '40%', left: '83%', width: '12%', height: '8%' },
    
    // Chân (mới thêm)
    { id: 'thigh_left', label: 'Đùi trái', top: '59%', left: '32%', width: '16%', height: '15%' },
    { id: 'thigh_right', label: 'Đùi phải', top: '59%', left: '52%', width: '16%', height: '15%' },
    { id: 'leg_left', label: 'Cẳng chân trái', top: '74%', left: '32%', width: '16%', height: '15%' },
    { id: 'leg_right', label: 'Cẳng chân phải', top: '74%', left: '52%', width: '16%', height: '15%' },
    { id: 'foot_left', label: 'Bàn chân trái', top: '89%', left: '30%', width: '18%', height: '8%' },
    { id: 'foot_right', label: 'Bàn chân phải', top: '89%', left: '52%', width: '18%', height: '8%' },
  ];

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      {/* Legend màu 4 cấp độ */}
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

      <Text style={styles.instruction}>
        Chạm vào vùng đau/tê trên cơ thể để chọn mức độ
      </Text>

      {/* Body Model với overlay clickable areas */}
      <View style={[styles.bodyContainer, { width: BODY_WIDTH, height: BODY_HEIGHT }]}>
        {/* Background body silhouette - Đẹp hơn */}
        <View style={styles.bodySilhouette}>
          {/* Head */}
          <View style={[styles.bodyPart, styles.head]} />
          
          {/* Neck */}
          <View style={[styles.bodyPart, styles.neck]} />
          
          {/* Torso */}
          <View style={[styles.bodyPart, styles.torso]} />
          
          {/* Arms - Chi tiết hơn */}
          <View style={[styles.bodyPart, styles.armLeft]} />
          <View style={[styles.bodyPart, styles.armRight]} />
          <View style={[styles.bodyPart, styles.forearmLeft]} />
          <View style={[styles.bodyPart, styles.forearmRight]} />
          <View style={[styles.bodyPart, styles.handLeft]} />
          <View style={[styles.bodyPart, styles.handRight]} />
          
          {/* Legs - Chi tiết hơn */}
          <View style={[styles.bodyPart, styles.thighLeft]} />
          <View style={[styles.bodyPart, styles.thighRight]} />
          <View style={[styles.bodyPart, styles.calfLeft]} />
          <View style={[styles.bodyPart, styles.calfRight]} />
          <View style={[styles.bodyPart, styles.footLeft]} />
          <View style={[styles.bodyPart, styles.footRight]} />
        </View>

        {/* Clickable overlay areas */}
        {bodyAreas.map((area) => {
          const painLevel = selectedAreas[area.id] || 0;
          const painColor = getPainColor(painLevel);
          const isSelected = painLevel > 0;

          return (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.clickableArea,
                {
                  top: area.top as any,
                  left: area.left as any,
                  width: area.width as any,
                  height: area.height as any,
                  backgroundColor: isSelected ? painColor + '80' : 'rgba(91, 155, 213, 0.1)',
                  borderColor: isSelected ? painColor : 'rgba(91, 155, 213, 0.4)',
                  borderWidth: isSelected ? 2.5 : 1.5,
                },
              ]}
              onPress={() => handleAreaPress(area.id)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View style={styles.areaLabelContainer}>
                  <Text style={styles.areaLabel}>{area.label}</Text>
                  <Text style={styles.areaLevel}>{painLevel}/10</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pain Level Selector Modal */}
      {selectedArea && (
        <View style={styles.levelSelector}>
          <Text style={styles.levelTitle}>
            Chọn mức độ đau/tê cho vùng này:
          </Text>
          <Text style={styles.levelSubtitle}>
            💡 Tê = mức độ 8-10 (triệu chứng nặng)
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
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setSelectedArea(null)}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#999',
  },
  legendText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  instruction: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 32,
    fontWeight: '500',
  },
  bodyContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bodySilhouette: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  bodyPart: {
    position: 'absolute',
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#90CAF9',
  },
  // Head
  head: {
    top: '1%',
    left: '38%',
    width: '24%',
    height: '6%',
    borderRadius: 100,
  },
  // Neck
  neck: {
    top: '7%',
    left: '42%',
    width: '16%',
    height: '4%',
    borderRadius: 8,
  },
  // Torso
  torso: {
    top: '11%',
    left: '30%',
    width: '40%',
    height: '37%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  // Arms - Upper
  armLeft: {
    top: '13%',
    left: '12%',
    width: '18%',
    height: '18%',
    borderRadius: 20,
    transform: [{ rotate: '8deg' }],
  },
  armRight: {
    top: '13%',
    right: '12%',
    width: '18%',
    height: '18%',
    borderRadius: 20,
    transform: [{ rotate: '-8deg' }],
  },
  // Forearms
  forearmLeft: {
    top: '31%',
    left: '8%',
    width: '15%',
    height: '16%',
    borderRadius: 18,
    transform: [{ rotate: '5deg' }],
  },
  forearmRight: {
    top: '31%',
    right: '8%',
    width: '15%',
    height: '16%',
    borderRadius: 18,
    transform: [{ rotate: '-5deg' }],
  },
  // Hands
  handLeft: {
    top: '47%',
    left: '6%',
    width: '12%',
    height: '6%',
    borderRadius: 15,
  },
  handRight: {
    top: '47%',
    right: '6%',
    width: '12%',
    height: '6%',
    borderRadius: 15,
  },
  // Thighs
  thighLeft: {
    top: '48%',
    left: '32%',
    width: '16%',
    height: '20%',
    borderRadius: 18,
  },
  thighRight: {
    top: '48%',
    right: '32%',
    width: '16%',
    height: '20%',
    borderRadius: 18,
  },
  // Calves
  calfLeft: {
    top: '68%',
    left: '32%',
    width: '16%',
    height: '20%',
    borderRadius: 16,
  },
  calfRight: {
    top: '68%',
    right: '32%',
    width: '16%',
    height: '20%',
    borderRadius: 16,
  },
  // Feet
  footLeft: {
    top: '88%',
    left: '30%',
    width: '18%',
    height: '6%',
    borderRadius: 12,
  },
  footRight: {
    top: '88%',
    right: '30%',
    width: '18%',
    height: '6%',
    borderRadius: 12,
  },
  clickableArea: {
    position: 'absolute',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaLabelContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  areaLabel: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  areaLevel: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 1,
  },
  levelSelector: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
    borderRadius: 12,
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
    fontWeight: 'bold',
    color: '#FFF',
  },
  levelLabel: {
    fontSize: 10,
    color: '#FFF',
    marginTop: 4,
    textAlign: 'center',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
