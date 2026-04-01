import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, MessageSquareText, Star } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/services/api';

const PRODUCT_IMAGES: Record<string, any> = {
  'theraneck.png': require('../assets/theraneck.png'),
  'theraback.png': require('../assets/theraback.png'),
  ech: require('../assets/theraneck.png'),
  rung: require('../assets/theraback.png'),
};

type TherapyProduct = {
  id: string;
  key: string;
  name: string;
  purchase_link?: string;
  is_active?: boolean;
};

type ProductAssessment = {
  id: string;
  product_id: string;
  rating: number;
  comment: string;
};

type DraftState = Record<string, { rating: number; comment: string; assessmentId?: string }>;

export default function ProductAssessmentsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [products, setProducts] = useState<TherapyProduct[]>([]);
  const [drafts, setDrafts] = useState<DraftState>({});
  const [loading, setLoading] = useState(true);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const productData = await api.get<TherapyProduct[]>('/products');
      let assessmentData: any[] = [];

      try {
        assessmentData = await api.get<any[]>('/product-assessments/mine');
      } catch (assessmentError) {
        console.error('Load my assessments error:', assessmentError);
      }

      setProducts(productData || []);

      const nextDrafts: DraftState = {};
      (productData || []).forEach((product) => {
        const existing = (assessmentData || []).find((item) => item.product_id === product.id);
        nextDrafts[product.id] = {
          rating: existing?.rating || 0,
          comment: existing?.comment || '',
          assessmentId: existing?.id,
        };
      });

      setDrafts(nextDrafts);
    } catch (error) {
      console.error('Load product assessments error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm để đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = (productId: string, patch: Partial<DraftState[string]>) => {
    setDrafts((prev) => ({
      ...prev,
      [productId]: {
        rating: prev[productId]?.rating || 0,
        comment: prev[productId]?.comment || '',
        assessmentId: prev[productId]?.assessmentId,
        ...patch,
      },
    }));
  };

  const handleSave = async (product: TherapyProduct) => {
    const draft = drafts[product.id];
    if (!draft || draft.rating < 1) {
      Alert.alert('Thiếu đánh giá', `Hãy chọn số sao cho ${product.name}.`);
      return;
    }

    try {
      setSavingProductId(product.id);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const saved = await api.post('/product-assessments', {
        product_id: product.id,
        rating: draft.rating,
        comment: draft.comment.trim(),
      });

      updateDraft(product.id, { assessmentId: saved?.id });
      Alert.alert('Đã lưu', `Đánh giá của bạn cho ${product.name} đã được cập nhật.`);
    } catch (error) {
      console.error('Save product assessment error:', error);
      Alert.alert('Lỗi', 'Không thể lưu đánh giá lúc này.');
    } finally {
      setSavingProductId(null);
    }
  };

  const resolveImageSource = (product: TherapyProduct) => {
    if (product.key && PRODUCT_IMAGES[product.key]) {
      return PRODUCT_IMAGES[product.key];
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá của bạn</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <MessageSquareText size={16} color={colors.primary} />
            <Text style={styles.heroBadgeText}>Cá nhân</Text>
          </View>
          <Text style={styles.heroTitle}>Đánh giá thiết bị của riêng bạn</Text>
          <Text style={styles.heroDescription}>
            Chỉ bạn mới thấy các đánh giá này. Hãy lưu lại cảm nhận thực tế để theo dõi thiết bị
            nào phù hợp nhất với cơ thể mình.
          </Text>
        </View>

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          products.map((product) => {
            const draft = drafts[product.id] || { rating: 0, comment: '' };
            const imageSource = resolveImageSource(product);

            return (
              <View key={product.id} style={styles.card}>
                <View style={styles.imageWrap}>
                  {imageSource ? (
                    <Image source={imageSource} style={styles.productImage} resizeMode="contain" />
                  ) : (
                    <View style={styles.imageFallback}>
                      <Text style={styles.imageFallbackText}>{product.name}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.categoryText}>{product.key}</Text>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription}>
                    {product.purchase_link
                      ? `Liên kết mua: ${product.purchase_link}`
                      : 'Sản phẩm cải thiện dành riêng cho bạn. Hãy lưu lại cảm nhận thực tế sau khi sử dụng.'}
                  </Text>

                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= draft.rating;
                      return (
                        <Pressable
                          key={star}
                          onPress={() => {
                            Haptics.selectionAsync();
                            updateDraft(product.id, { rating: star });
                          }}
                          style={styles.starButton}
                        >
                          <Star
                            size={24}
                            color={active ? '#F59E0B' : colors.border}
                            fill={active ? '#F59E0B' : 'transparent'}
                          />
                        </Pressable>
                      );
                    })}
                  </View>

                  <TextInput
                    value={draft.comment}
                    onChangeText={(value) => updateDraft(product.id, { comment: value })}
                    placeholder="Viết cảm nhận của bạn về sản phẩm..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    style={styles.commentInput}
                  />

                  <Button
                    mode="contained"
                    onPress={() => handleSave(product)}
                    loading={savingProductId === product.id}
                    disabled={savingProductId === product.id}
                    buttonColor={colors.primary}
                    style={styles.saveButton}
                    contentStyle={styles.saveButtonContent}
                    labelStyle={styles.saveButtonLabel}
                  >
                    {draft.assessmentId ? 'Cập nhật đánh giá' : 'Lưu đánh giá'}
                  </Button>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    headerSpacer: {
      width: 40,
      height: 40,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 20,
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 22,
      paddingVertical: 22,
      gap: 12,
      shadowColor: isDark ? '#000000' : '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.16 : 0.06,
      shadowRadius: 18,
      elevation: 3,
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
      borderColor: `${colors.primary}24`,
    },
    heroBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    heroTitle: {
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '800',
      color: colors.text,
    },
    heroDescription: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    stateWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      gap: 10,
    },
    stateText: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    imageWrap: {
      height: 220,
      backgroundColor: isDark ? '#111827' : '#F8FAFC',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    imageFallback: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    imageFallbackText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    cardBody: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      gap: 10,
    },
    categoryText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    productName: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
    },
    productDescription: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    starButton: {
      paddingVertical: 4,
    },
    commentInput: {
      minHeight: 110,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colors.text,
      textAlignVertical: 'top',
      backgroundColor: colors.background,
      fontSize: 15,
      lineHeight: 22,
    },
    saveButton: {
      borderRadius: 999,
      marginTop: 4,
    },
    saveButtonContent: {
      minHeight: 52,
    },
    saveButtonLabel: {
      fontSize: 16,
      fontWeight: '700',
    },
  });
