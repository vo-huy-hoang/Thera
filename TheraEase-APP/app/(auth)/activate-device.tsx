import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { useAuthStore } from '@/stores/authStore';
import { persistOnboardingProfile } from '@/services/onboardingProfile';

const { width } = Dimensions.get('window');

export default function ActivateDeviceScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [isManual, setIsManual] = React.useState(false);
  const [activationCode, setActivationCode] = React.useState('');

  const handleAction = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (user) {
        await persistOnboardingProfile();
      }

      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Persist onboarding profile error:', error);
      Alert.alert('Lỗi', 'Không thể lưu hồ sơ lúc này. Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.messageBox}>
          <Text style={styles.messageText}>
            Mã kích hoạt kèm theo ở trong hộp sản phẩm nếu bạn không thấy vui lòng nhắn tin{'\n'}
            Zalo: <Text style={styles.bold}>0364263552</Text>
          </Text>
        </Animated.View>

        <View style={styles.footer}>
           <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              {isManual ? (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'timing', duration: 400 }}
                  style={styles.manualEntryContainer}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mã kích hoạt tại đây..."
                    placeholderTextColor="#94A3B8"
                    value={activationCode}
                    onChangeText={setActivationCode}
                    autoFocus
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity 
                    onPress={handleAction}
                    style={[styles.qrButton, !activationCode && { opacity: 0.5 }]}
                    disabled={!activationCode}
                  >
                    <Text style={styles.qrText}>Xác nhận</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setIsManual(false)}
                    style={styles.backButton}
                  >
                    <Text style={styles.backText}>Quay lại</Text>
                  </TouchableOpacity>
                </MotiView>
              ) : (
                <>
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsManual(true);
                    }}
                    style={styles.manualButton}
                  >
                    <Text style={styles.manualText}>Nhập thủ công</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleAction}
                    style={styles.qrButton}
                  >
                    <Text style={styles.qrText}>Quét QR</Text>
                  </TouchableOpacity>
                </>
              )}
           </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBox: {
    marginBottom: 60,
  },
  messageText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  bold: {
    fontWeight: 'bold',
    fontStyle: 'normal',
  },
  footer: {
    width: '100%',
    gap: 20,
  },
  manualButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    // Soft shadow
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  manualText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  qrButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  qrText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  manualEntryContainer: {
    width: '100%',
    gap: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});
