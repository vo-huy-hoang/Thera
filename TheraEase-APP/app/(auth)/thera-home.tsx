import React from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const LABELS: any[] = [
  { text: 'Lộ trình riêng', top: '30%', left: '5%' },
  { text: 'Giảm đau tức thì', top: '25%', right: '5%' },
  { text: 'Chi phí thấp', top: '50%', left: '8%' },
  { text: 'Ngay tại nhà', top: '45%', right: '8%' },
];

export default function TheraHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace({ pathname: '/(auth)/exercise-time', params });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/thera-home-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header section */}
          <View style={styles.header}>
            <Animated.View entering={FadeInUp.duration(800)}>
              <View style={styles.headerCard}>
                <Text style={styles.title}>
                  <Text style={styles.titleItalic}>Thera</Text>
                  <Text style={styles.titleBlue}>HOME</Text>
                  <Text style={styles.titleRest}> là sự lựa chọn{'\n'}hoàn hảo dành cho bạn</Text>
                </Text>
                <View style={styles.titleUnderline} />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).duration(800)}>
              <View style={styles.subtitleCard}>
                <Text style={styles.subtitle}>
                  Cá nhân hóa lộ trình bằng AI theo bệnh lý của bạn
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Floating labels section */}
          <View style={styles.labelsContainer}>
            {LABELS.map((label, index) => (
              <Animated.View 
                key={index} 
                entering={ZoomIn.delay(500 + index * 200).duration(600).springify()}
                style={[
                  styles.glassCard, 
                  { 
                    top: label.top, 
                    left: label.left, 
                    right: label.right,
                    position: 'absolute'
                  }
                ]}
              >
                <Text style={styles.glassText}>{label.text}</Text>
              </Animated.View>
            ))}
          </View>

          {/* Footer button */}
          <Animated.View entering={FadeInDown.delay(1300).duration(800)} style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              buttonColor="#3B82F6"
            >
              TIẾP TỤC
            </Button>
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
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    gap: 12,
  },
  headerCard: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 36,
  },
  titleItalic: {
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#0F172A',
  },
  titleBlue: {
    color: '#3B82F6',
    fontWeight: '900',
  },
  titleRest: {
    color: '#111827',
  },
  titleUnderline: {
    width: width * 0.7,
    height: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.28)',
    marginTop: 10,
    alignSelf: 'center',
  },
  subtitleCard: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.66)',
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
  },
  labelsContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  glassText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
