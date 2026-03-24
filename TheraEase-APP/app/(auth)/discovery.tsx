import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/authStore';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { User } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DiscoveryScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(auth)/reviews');
  };

  const Avatar = ({ size, color, delay }: { size: number, color: string, delay: number }) => (
    <Animated.View 
      entering={ZoomIn.delay(delay).duration(600).springify()}
      style={[
        styles.avatarCircle, 
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color }
      ]}
    >
      <User size={size * 0.6} color="#FFFFFF" strokeWidth={2} />
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Animated.View entering={FadeInUp.duration(600).springify()}>
          <Text style={styles.title}>
            Khám phá sự phát triển{'\n'}tiềm năng của cá nhân{'\n'}hóa lộ trình
          </Text>
        </Animated.View>

        {/* Avatar Graphic Section */}
        <View style={styles.graphicContainer}>
           <View style={styles.centerRow}>
              <Avatar size={45} color="#93C5FD" delay={300} />
              <View style={{ width: 10 }} />
              <Avatar size={70} color="#60A5FA" delay={200} />
              <View style={{ width: 10 }} />
              <Avatar size={45} color="#93C5FD" delay={350} />
           </View>

           <View style={styles.mainRow}>
              <Avatar size={40} color="#BFDBFE" delay={500} />
              <View style={{ width: 15 }} />
              <Avatar size={65} color="#3B82F6" delay={400} />
              <View style={{ width: 15 }} />
              <Avatar size={100} color="#2563EB" delay={100} />
              <View style={{ width: 15 }} />
              <Avatar size={65} color="#3B82F6" delay={450} />
              <View style={{ width: 15 }} />
              <Avatar size={40} color="#BFDBFE" delay={550} />
           </View>

           <View style={styles.centerRow}>
              <Avatar size={45} color="#93C5FD" delay={600} />
              <View style={{ width: 10 }} />
              <Avatar size={70} color="#60A5FA" delay={650} />
              <View style={{ width: 10 }} />
              <Avatar size={45} color="#93C5FD" delay={700} />
           </View>
        </View>

        <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.textSection}>
           <Text style={styles.description}>
             Quá trình thực hiện dựa trên dữ liệu về cơ thể của bạn đảm bảo lộ trình cải thiện đạt kết quả tốt nhất. Hơn <Text style={styles.boldBlue}>110.986</Text> người Mỹ đã không còn phải sống chung với cơn đau mỗi ngày — giờ đến lượt bạn.
           </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).duration(600)} style={styles.footer}>
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
    paddingHorizontal: width * 0.08,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 40,
  },
  graphicContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textSection: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 28,
  },
  boldBlue: {
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 40,
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
