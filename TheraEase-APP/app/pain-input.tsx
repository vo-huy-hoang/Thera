import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { usePainStore } from '@/stores/painStore';
import { createPainLog } from '@/services/painLogs';
import BodyMap from '@/components/BodyMap';
import { colors } from '@/utils/theme';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function PainInputScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedPainAreas, setSelectedPainAreas, setTodayPainLog } = usePainStore();
  const [loading, setLoading] = useState(false);

  const handleAreaPress = (area: string, level: number) => {
    setSelectedPainAreas({
      ...selectedPainAreas,
      [area]: level,
    });
  };

  const handleContinue = async () => {
    if (!user || Object.keys(selectedPainAreas).length === 0) return;

    // Check if user is authenticated (not guest)
    if (!user.id || user.id === 'guest') {
      alert('Vui lòng đăng nhập để lưu dữ liệu đau');
      router.push('/(auth)/login');
      return;
    }

    try {
      setLoading(true);

      const values = Object.values(selectedPainAreas) as number[];
      const painLevel = values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
      
      const { data, error } = await createPainLog({
        date: format(new Date(), 'yyyy-MM-dd'),
        pain_areas: selectedPainAreas,
        pain_level: painLevel,
      });

      if (error) {
        console.error('Create pain log error:', error);
        alert('Lỗi lưu dữ liệu');
        return;
      }

      setTodayPainLog(data);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to pain analysis screen
      router.push('/pain-analysis');
    } catch (error: any) {
      console.error('Submit error:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Vị trí đau</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Chạm vào vùng đau trên cơ thể và chọn mức độ đau
        </Text>

        <BodyMap
          selectedAreas={selectedPainAreas}
          onAreaPress={handleAreaPress}
        />

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Chú thích:</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Không đau</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>Đau nhẹ (ấm ấm)</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Đau - xuất khó</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Đau/không cảnh báo</Text>
          </View>
        </View>

        <Text style={styles.note}>
          Vị dữ liệu sẽ được lưu và tính chính từng ngày
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleContinue();
          }}
          loading={loading}
          disabled={loading || Object.keys(selectedPainAreas).length === 0}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={colors.primary}
        >
          Tiếp tục
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  legend: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
  },
  note: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
