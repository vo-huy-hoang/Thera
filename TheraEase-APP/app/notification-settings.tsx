import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/stores/authStore';
import { scheduleDailyReminder } from '@/services/notifications';
import { api } from '@/services/api';
import { colors } from '@/utils/theme';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Parse current time or default to 20:00
  const currentTime = user?.preferred_time || '20:00';
  const [hours, minutes] = currentTime.split(':').map(Number);
  const initialDate = new Date();
  initialDate.setHours(hours, minutes, 0, 0);
  
  const [selectedTime, setSelectedTime] = useState(initialDate);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (date) {
      setSelectedTime(date);
    }
  };

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleSave = async () => {
    if (!user) return;

    const timeString = formatTime(selectedTime);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const data = await api.put('/auth/profile', {
        preferred_time: timeString,
      });

      if (data) {
        setUser(data);
        
        // Schedule notifications with new time
        const [h, m] = timeString.split(':').map(Number);
        await scheduleDailyReminder(h, m);
        
        Alert.alert('Thành công', `Đã đặt nhắc nhở lúc ${timeString}`, [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Update notification time error:', error);
      console.error('Error details:', error.message, error.stack);
      Alert.alert('Lỗi', `Không thể cập nhật thời gian: ${error.message || 'Vui lòng thử lại'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thời gian nhắc nhở</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>
          Chọn thời gian bạn muốn nhận nhắc nhở cải thiện hàng ngày
        </Text>

        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Thời gian đã chọn:</Text>
          <Text style={styles.timeValue}>{formatTime(selectedTime)}</Text>
        </View>

        {Platform.OS === 'android' && !showPicker && (
          <Button
            mode="outlined"
            onPress={() => setShowPicker(true)}
            style={styles.showPickerButton}
          >
            Chọn giờ khác
          </Button>
        )}

        {showPicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              locale="vi-VN"
            />
          </View>
        )}

        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Gợi ý:</Text>
          {['07:00', '12:00', '18:00', '20:00', '21:00'].map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.suggestionChip,
                formatTime(selectedTime) === time && styles.suggestionChipActive,
              ]}
              onPress={() => {
                const [h, m] = time.split(':').map(Number);
                const newDate = new Date();
                newDate.setHours(h, m, 0, 0);
                setSelectedTime(newDate);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.suggestionText,
                  formatTime(selectedTime) === time && styles.suggestionTextActive,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
        >
          Lưu thay đổi
        </Button>
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  showPickerButton: {
    marginBottom: 24,
  },
  pickerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  suggestions: {
    marginBottom: 32,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  suggestionChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  suggestionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  suggestionTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
