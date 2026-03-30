import React from 'react';
import { View, StyleSheet, Dimensions, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';

import { useAuthStore } from '@/stores/authStore';
import { persistOnboardingProfile } from '@/services/onboardingProfile';

const { width, height } = Dimensions.get('window');

export default function SpecialOfferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (!user || user.id === 'guest') {
        router.replace('/(auth)/login');
        return;
      }

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
    <View style={styles.container}>
      {/* Background (blurred homepage or generic) */}
      <ImageBackground 
        source={require('../../assets/best-version-bg.png')} 
        style={styles.backgroundImage}
        blurRadius={10}
      >
        <SafeAreaView style={styles.overlay}>
           <TouchableOpacity
             onPress={() => router.back()}
             style={[styles.backButtonTop, { top: insets.top + 8 }]}
             activeOpacity={0.8}
           >
             <ArrowLeft size={24} color="#1E293B" />
           </TouchableOpacity>
           <Animated.View entering={ZoomIn.duration(800)} style={styles.offerCard}>
              
              <View style={styles.tagContainer}>
                 <View style={styles.tagOuter}>
                    <View style={styles.tagInner}>
                       <Text style={styles.tagNumber}>41</Text>
                       <View style={styles.tagPercentWrapper}>
                          <Text style={styles.tagPercent}>%</Text>
                          <Text style={styles.tagOff}>OFF</Text>
                       </View>
                    </View>
                 </View>
              </View>

              <View style={styles.textContainer}>
                 <Text style={styles.specialTitle}>ưu đãi đặc biệt</Text>
              </View>

              <View style={styles.priceContainer}>
                 <View style={styles.priceRow}>
                    <Text style={styles.currentPrice}>990.000đ</Text>
                    <View style={styles.oldPriceContainer}>
                       <Text style={styles.oldPrice}>1.690.000đ</Text>
                    </View>
                 </View>
                 <Text style={styles.noteText}>Dành cho người mới</Text>
              </View>

              <TouchableOpacity 
                onPress={handleNext} 
                style={styles.nextButton}
                activeOpacity={0.9}
              >
                 <Text style={styles.nextText}>TIẾP TỤC</Text>
              </TouchableOpacity>

              <View style={styles.links}>
                 <Text style={styles.linkText}>Terms of use | Privacy Policy</Text>
              </View>

           </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButtonTop: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 30,
    alignItems: 'center',
    paddingTop: 80, // Space for tag
    paddingBottom: 30,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tagContainer: {
    position: 'absolute',
    top: -60,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagOuter: {
    width: 140,
    height: 140,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  tagInner: {
    transform: [{ rotate: '-45deg' }],
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagNumber: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tagPercentWrapper: {
    marginLeft: 2,
    alignItems: 'center',
  },
  tagPercent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  tagOff: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: -5,
  },
  textContainer: {
    backgroundColor: '#FAF5F5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EF4444',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  specialTitle: {
    fontSize: 26,
    color: '#EF4444',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  oldPriceContainer: {
    borderWidth: 1,
    borderColor: '#A855F7',
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  oldPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  noteText: {
    fontSize: 16,
    color: '#4B5563',
    fontStyle: 'italic',
    marginTop: 5,
  },
  nextButton: {
    backgroundColor: '#EF4444',
    width: width * 0.75,
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    elevation: 5,
  },
  nextText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  links: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
