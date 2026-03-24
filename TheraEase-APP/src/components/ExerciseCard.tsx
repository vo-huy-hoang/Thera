import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { TrendingUp } from 'lucide-react-native';
import { colors } from '@/utils/theme';
import type { Exercise } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: () => void;
  recommended?: boolean;
}

export default function ExerciseCard({ exercise, onPress, recommended }: ExerciseCardProps) {
  const [imageError, setImageError] = React.useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.painMild;
      case 'hard': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
  };

  const hasValidThumbnail = exercise.thumbnail_url && exercise.thumbnail_url.trim() !== '' && !imageError;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.content}>
          {hasValidThumbnail ? (
            <Image
              source={{ uri: exercise.thumbnail_url }}
              style={styles.thumbnail}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
              <TrendingUp size={32} color={colors.textSecondary} />
            </View>
          )}
          
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {exercise.title}
            </Text>
            
            <View style={styles.meta}>
              <View style={[styles.badge, { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }]}>
                <Text style={[styles.badgeText, { color: getDifficultyColor(exercise.difficulty) }]}>
                  {getDifficultyText(exercise.difficulty)}
                </Text>
              </View>
            </View>

            {recommended && (
              <View style={styles.recommendedBadge}>
                <TrendingUp size={14} color={colors.primary} />
                <Text style={styles.recommendedText}>Phù hợp với bạn</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  recommendedText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});
