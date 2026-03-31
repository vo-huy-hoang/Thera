import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { getVideoByPlanDay } from '@/services/videos';
import { colors } from '@/utils/theme';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { extractYouTubeVideoId, isYouTubeUrl } from '@/utils/youtube';

const { width, height } = Dimensions.get('window');

interface Exercise {
  id: string;
  title: string;
  video_url: string;
  duration: number;
  thumbnail_url?: string;
}

export default function WorkoutSequenceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, setUser } = useAuthStore();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<Video | null>(null);

  const [dayVideoUrl, setDayVideoUrl] = useState<string | null>(null);
  const [isStartingCountdown, setIsStartingCountdown] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);

  useEffect(() => {
    loadExercises();
    // Lock to landscape for better video experience
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const loadExercises = async () => {
    if (!params.planId || !params.day) return;

    try {
      setLoading(true);
      
      const response = await api.get(`/workout-plans/${params.planId}/exercises`);
      
      // Filter exercises by day
      const dayNum = parseInt(params.day as string);
      const dayExercises = response.filter((item: any) => item.day_number === dayNum);
      const exerciseList = dayExercises.map((item: any) => item.exercise).filter(Boolean);

      setExercises(exerciseList);

      // Resolve one video per day from backend videos collection
      const { data: dayVideo, error: dayVideoError } = await getVideoByPlanDay(
        params.planId as string,
        dayNum
      );
      if (dayVideoError) {
        console.log('Load day video error:', dayVideoError);
      }
      setDayVideoUrl(dayVideo?.link || null);
    } catch (error) {
      console.error('Load exercises error:', error);
      setDayVideoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const maybeStartPersonalizedPlanCountdown = async () => {
    if (!user || isStartingCountdown) return;
    if (user.personalized_plan_started_at && user.personalized_plan_unlock_at) return;
    if ((params.day as string) !== '1') return;

    try {
      setIsStartingCountdown(true);
      const startedAt = new Date();
      const unlockAt = new Date(startedAt.getTime() + 15 * 24 * 60 * 60 * 1000);

      const updatedUser = await api.put('/auth/profile', {
        personalized_plan_started_at: startedAt.toISOString(),
        personalized_plan_unlock_at: unlockAt.toISOString(),
      });

      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.warn('Start personalized plan countdown error:', error);
    } finally {
      setIsStartingCountdown(false);
    }
  };



  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Save workout log for each exercise
    if (user && params.planId && params.day) {
      try {
        const completedAt = new Date().toISOString();
        const promises = exercises.map(ex => 
          api.post('/exercises/workout-log', {
            exercise_id: ex.id,
            plan_id: params.planId,
            day_number: parseInt(params.day as string),
            is_completed: true,
            completed_at: completedAt,
          })
        );
        await Promise.all(promises);
      } catch (error) {
        console.error('Save workout log error:', error);
      }
    }
    
    router.back();
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setVideoCompleted(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có bài tập nào</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentExercise = exercises[0];
  const currentVideoUrl = dayVideoUrl || currentExercise.video_url;
  const isYoutubeVideo = isYouTubeUrl(currentVideoUrl);
  const youtubeVideoId = isYoutubeVideo ? extractYouTubeVideoId(currentVideoUrl) : null;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.videoContainer}>
        {isYoutubeVideo && youtubeVideoId ? (
          <YoutubePlayer
            height={width}
            width={height}
            play={isPlaying}
            videoId={youtubeVideoId}
            onChangeState={(state: string) => {
              if (state === 'ended') {
                handleVideoEnd();
                setIsPlaying(false);
              } else if (state === 'playing') {
                setIsPlaying(true);
                maybeStartPersonalizedPlanCountdown();
              } else if (state === 'paused') {
                setIsPlaying(false);
              }
            }}
            initialPlayerParams={{
              controls: true,
              modestbranding: true,
              rel: false,
            }}
          />
        ) : (
          <Video
            ref={(ref) => setVideoRef(ref)}
            source={{ uri: currentVideoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={isPlaying}
            isLooping={false}
            onPlaybackStatusUpdate={(status: any) => {
              if (status.isLoaded && status.isPlaying) {
                maybeStartPersonalizedPlanCountdown();
              }
              if (status.didJustFinish) {
                handleVideoEnd();
              }
            }}
          />
        )}

        {/* Controls Overlay */}
          <View style={styles.overlay}>
            {/* Header */}
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'transparent']}
              style={styles.header}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={28} color="#FFF" />
              </TouchableOpacity>
              
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{currentExercise.title}</Text>
              </View>
            </LinearGradient>



            {/* Bottom Controls */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.bottomControls}
            >
              {videoCompleted && (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleComplete}
                >
                  <>
                    <CheckCircle size={24} color="#FFF" />
                    <Text style={styles.nextButtonText}>Xong</Text>
                  </>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: height, // Landscape: use height as width
    height: width, // Landscape: use width as height
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },

  bottomControls: {
    padding: 20,
    paddingBottom: 40,
  },
  progressInfo: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
