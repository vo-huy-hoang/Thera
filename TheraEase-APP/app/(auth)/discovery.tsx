import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const GRAPHIC_SIZE = Math.min(width * 0.84, 320);

type DiscoveryPortrait = {
  id: string;
  uri: string;
  sizeRatio: number;
  topRatio: number;
  leftRatio: number;
  delay: number;
  accentColor: string;
  prominent?: boolean;
};

const DISCOVERY_PORTRAITS: DiscoveryPortrait[] = [
  {
    id: 'top-left',
    uri: 'https://randomuser.me/api/portraits/women/32.jpg',
    sizeRatio: 0.16,
    topRatio: 0.04,
    leftRatio: 0.24,
    delay: 120,
    accentColor: '#D6E7FF',
  },
  {
    id: 'top-center',
    uri: 'https://randomuser.me/api/portraits/men/41.jpg',
    sizeRatio: 0.21,
    topRatio: 0.01,
    leftRatio: 0.395,
    delay: 180,
    accentColor: '#8EB6FF',
  },
  {
    id: 'top-right',
    uri: 'https://randomuser.me/api/portraits/women/64.jpg',
    sizeRatio: 0.16,
    topRatio: 0.04,
    leftRatio: 0.6,
    delay: 240,
    accentColor: '#D6E7FF',
  },
  {
    id: 'left-far',
    uri: 'https://randomuser.me/api/portraits/men/12.jpg',
    sizeRatio: 0.12,
    topRatio: 0.35,
    leftRatio: 0.03,
    delay: 300,
    accentColor: '#E8F1FF',
  },
  {
    id: 'left-main',
    uri: 'https://randomuser.me/api/portraits/women/25.jpg',
    sizeRatio: 0.2,
    topRatio: 0.29,
    leftRatio: 0.17,
    delay: 360,
    accentColor: '#5D96F7',
  },
  {
    id: 'center',
    uri: 'https://randomuser.me/api/portraits/men/32.jpg',
    sizeRatio: 0.31,
    topRatio: 0.24,
    leftRatio: 0.345,
    delay: 420,
    accentColor: '#1F5CE6',
    prominent: true,
  },
  {
    id: 'right-main',
    uri: 'https://randomuser.me/api/portraits/women/11.jpg',
    sizeRatio: 0.2,
    topRatio: 0.29,
    leftRatio: 0.625,
    delay: 480,
    accentColor: '#5D96F7',
  },
  {
    id: 'right-far',
    uri: 'https://randomuser.me/api/portraits/men/71.jpg',
    sizeRatio: 0.12,
    topRatio: 0.35,
    leftRatio: 0.85,
    delay: 540,
    accentColor: '#E8F1FF',
  },
  {
    id: 'bottom-left',
    uri: 'https://randomuser.me/api/portraits/women/68.jpg',
    sizeRatio: 0.16,
    topRatio: 0.62,
    leftRatio: 0.24,
    delay: 600,
    accentColor: '#D6E7FF',
  },
  {
    id: 'bottom-center',
    uri: 'https://randomuser.me/api/portraits/men/58.jpg',
    sizeRatio: 0.21,
    topRatio: 0.58,
    leftRatio: 0.395,
    delay: 660,
    accentColor: '#8EB6FF',
  },
  {
    id: 'bottom-right',
    uri: 'https://randomuser.me/api/portraits/women/45.jpg',
    sizeRatio: 0.16,
    topRatio: 0.62,
    leftRatio: 0.6,
    delay: 720,
    accentColor: '#D6E7FF',
  },
];

export default function DiscoveryScreen() {
  const router = useRouter();
  const clusterSize = GRAPHIC_SIZE;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(auth)/reviews');
  };

  const Portrait = ({
    size,
    delay,
    uri,
    top,
    left,
    accentColor,
    prominent = false,
  }: {
    size: number;
    delay: number;
    uri: string;
    top: number;
    left: number;
    accentColor: string;
    prominent?: boolean;
  }) => (
    <Animated.View 
      entering={ZoomIn.delay(delay).duration(600).springify()}
      style={[
        styles.avatarCircle,
        {
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          padding: prominent ? 6 : 4,
          backgroundColor: accentColor,
          shadowOpacity: prominent ? 0.22 : 0.12,
          shadowRadius: prominent ? 18 : 12,
          elevation: prominent ? 10 : 4,
        },
      ]}
    >
      <Image
        source={{ uri }}
        style={styles.avatarImage}
        resizeMode="cover"
      />
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
          <View
            style={[
              styles.portraitCluster,
              { width: clusterSize, height: clusterSize * 0.92 },
            ]}
          >
            <View style={styles.centerGlow} />
            {DISCOVERY_PORTRAITS.map((portrait) => (
              <Portrait
                key={portrait.id}
                size={clusterSize * portrait.sizeRatio}
                uri={portrait.uri}
                delay={portrait.delay}
                top={clusterSize * portrait.topRatio}
                left={clusterSize * portrait.leftRatio}
                accentColor={portrait.accentColor}
                prominent={portrait.prominent}
              />
            ))}
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
  portraitCluster: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGlow: {
    position: 'absolute',
    top: '27%',
    left: '31%',
    width: '38%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
  },
  avatarCircle: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  textSection: {
    marginTop: 8,
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
