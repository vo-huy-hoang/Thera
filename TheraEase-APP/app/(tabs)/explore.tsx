import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

const NECK_IMAGE = require('../../assets/theraneck.png');
const BACK_IMAGE = require('../../assets/theraback.png');

export default function ExploreScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, isDark, insets.top), [colors, isDark, insets.top]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={styles.heroBadgeText}>Thiết bị trị liệu</Text>
          </View>

          <Text style={styles.heroTitle}>Khám phá sản phẩm phù hợp với cơ thể bạn</Text>
          <Text style={styles.heroDescription}>
            Hai dòng thiết bị dành cho cổ và lưng, thiết kế để đồng hành cùng lộ trình phục hồi
            mỗi ngày.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cổ</Text>
          <View style={styles.productCard}>
            <View style={styles.imageWrap}>
              <Image source={NECK_IMAGE} style={styles.productImage} resizeMode="contain" />
            </View>

            <View style={styles.productBody}>
              <Text style={styles.productName}>TheraNECK</Text>
              <Text style={styles.productDescription}>
                Thiết bị hỗ trợ trị liệu vùng cổ vai gáy, phù hợp cho người ngồi nhiều và hay
                mỏi cổ.
              </Text>
              <View style={styles.actionRow}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(auth)/activate-device');
                  }}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>Thêm</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(auth)/special-offer');
                  }}
                  style={styles.actionButtonPrimary}
                >
                  <Text style={styles.actionButtonPrimaryText}>Nhận ưu đãi</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lưng</Text>
          <View style={styles.productCard}>
            <View style={styles.imageWrap}>
              <Image source={BACK_IMAGE} style={styles.productImage} resizeMode="contain" />
            </View>

            <View style={styles.productBody}>
              <Text style={styles.productName}>TheraBACK</Text>
              <Text style={styles.productDescription}>
                Thiết bị hỗ trợ thư giãn và giảm căng cứng vùng lưng, phù hợp cho nhu cầu phục
                hồi cơ sâu.
              </Text>
              <View style={styles.actionRow}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(auth)/activate-device');
                  }}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>Thêm</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(auth)/special-offer');
                  }}
                  style={styles.actionButtonPrimary}
                >
                  <Text style={styles.actionButtonPrimaryText}>Nhận ưu đãi</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/product-assessments');
          }}
          buttonColor={colors.primary}
          style={styles.reviewButton}
          contentStyle={styles.reviewButtonContent}
          labelStyle={styles.reviewButtonLabel}
        >
          Xem đánh giá của bạn
        </Button>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingTop: Math.max(topInset + 12, 28),
      paddingHorizontal: 20,
      paddingBottom: 140,
      gap: 22,
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 22,
      paddingVertical: 24,
      gap: 12,
      shadowColor: isDark ? '#000000' : '#0F172A',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.18 : 0.08,
      shadowRadius: 20,
      elevation: 4,
    },
    heroBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: `${colors.primary}14`,
      borderWidth: 1,
      borderColor: `${colors.primary}25`,
    },
    heroBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    heroTitle: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '800',
      color: colors.text,
    },
    heroDescription: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    section: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: 4,
    },
    productCard: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: isDark ? '#000000' : '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.16 : 0.06,
      shadowRadius: 18,
      elevation: 3,
    },
    imageWrap: {
      height: 240,
      backgroundColor: isDark ? '#111827' : '#F8FAFC',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    productBody: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      gap: 10,
    },
    productName: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    productDescription: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 4,
    },
    actionButton: {
      flex: 1,
      flexBasis: 0,
      minHeight: 48,
      borderRadius: 999,
      backgroundColor: isDark ? '#171717' : '#111111',
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
    },
    actionButtonPrimary: {
      flex: 1,
      flexBasis: 0,
      minHeight: 48,
      borderRadius: 999,
      backgroundColor: '#EF4444',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonPrimaryText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
    },
    reviewButton: {
      borderRadius: 999,
      marginTop: 4,
    },
    reviewButtonContent: {
      minHeight: 56,
    },
    reviewButtonLabel: {
      fontSize: 17,
      fontWeight: '700',
    },
  });
