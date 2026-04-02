import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, PanResponder, LayoutChangeEvent, useWindowDimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Play, Pause, CheckCircle, RotateCcw, RotateCw } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { getVideoByPlanDay } from '@/services/videos';
import { colors } from '@/utils/theme';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { extractYouTubeVideoId, isYouTubeUrl } from '@/utils/youtube';

const YOUTUBE_SKIP_SECONDS = 10;

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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<Video | null>(null);

  const [dayVideoUrl, setDayVideoUrl] = useState<string | null>(null);
  const [isStartingCountdown, setIsStartingCountdown] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [playbackPositionMs, setPlaybackPositionMs] = useState(0);
  const [playbackDurationMs, setPlaybackDurationMs] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPositionMs, setScrubPositionMs] = useState(0);
  const [seekBarWidth, setSeekBarWidth] = useState(0);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const youtubePlayerRef = useRef<any>(null);
  const durationRef = useRef(0);
  const seekBarWidthRef = useRef(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    loadExercises();
    // Lock to landscape for better video experience
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    durationRef.current = playbackDurationMs;
  }, [playbackDurationMs]);

  useEffect(() => {
    seekBarWidthRef.current = seekBarWidth;
  }, [seekBarWidth]);

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

  const formatPlaybackTime = (milliseconds: number) => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resolveSeekPosition = (locationX: number) => {
    const safeWidth = seekBarWidthRef.current || seekBarWidth;
    const safeDuration = durationRef.current || playbackDurationMs;
    if (!safeWidth || !safeDuration) return 0;

    const ratio = Math.min(1, Math.max(0, locationX / safeWidth));
    return ratio * safeDuration;
  };

  const seekToPosition = async (targetMs: number) => {
    const safeDuration = durationRef.current || playbackDurationMs;
    const clampedMs = Math.max(0, Math.min(targetMs, safeDuration || targetMs));

    if (isYoutubeVideo && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(clampedMs / 1000, true);
      setPlaybackPositionMs(clampedMs);
      return;
    }

    if (!videoRef) return;
    await videoRef.setPositionAsync(clampedMs);
    setPlaybackPositionMs(clampedMs);
  };

  const handleSkip = async (seconds: number) => {
    try {
      if (isYoutubeVideo && youtubePlayerRef.current) {
        const currentTime = await youtubePlayerRef.current.getCurrentTime();
        const nextTime = Math.max(0, currentTime + seconds);
        youtubePlayerRef.current.seekTo(nextTime, true);
        setPlaybackPositionMs(nextTime * 1000);
        return;
      }

      if (!videoRef) return;
      const status = await videoRef.getStatusAsync();
      if (!status.isLoaded) return;

      const nextPosition = Math.max(
        0,
        Math.min(status.positionMillis + seconds * 1000, status.durationMillis || status.positionMillis)
      );
      await videoRef.setPositionAsync(nextPosition);
    } catch (error) {
      console.log('Skip video error:', error);
    }
  };

  const seekBarPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const nextPosition = resolveSeekPosition(event.nativeEvent.locationX);
          setIsScrubbing(true);
          setScrubPositionMs(nextPosition);
        },
        onPanResponderMove: (event) => {
          const nextPosition = resolveSeekPosition(event.nativeEvent.locationX);
          setScrubPositionMs(nextPosition);
        },
        onPanResponderRelease: async (event) => {
          const nextPosition = resolveSeekPosition(event.nativeEvent.locationX);
          setIsScrubbing(false);
          setScrubPositionMs(nextPosition);
          await seekToPosition(nextPosition);
        },
        onPanResponderTerminate: async () => {
          setIsScrubbing(false);
          await seekToPosition(scrubPositionMs);
        },
      }),
    [playbackDurationMs, seekBarWidth, scrubPositionMs]
  );

  const handlePlayPause = async () => {
    if (isPlaying) {
      if (!isYoutubeVideo && videoRef) await videoRef.pauseAsync();
      setIsPlaying(false);
    } else {
      if (!isYoutubeVideo && videoRef) await videoRef.playAsync();
      setIsPlaying(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleControls = () => {
    setShowControls((previous) => !previous);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const currentExercise = exercises[0] || null;
  const currentVideoUrl = dayVideoUrl || currentExercise?.video_url || '';
  const isYoutubeVideo = currentExercise ? isYouTubeUrl(currentVideoUrl) : false;
  const youtubeVideoId = isYoutubeVideo ? extractYouTubeVideoId(currentVideoUrl) : null;
  const videoFrameWidth = Math.max(windowWidth, windowHeight);
  const videoFrameHeight = Math.min(windowWidth, windowHeight);
  const displayedPositionMs = isScrubbing ? scrubPositionMs : playbackPositionMs;
  const progressRatio =
    playbackDurationMs > 0
      ? Math.min(1, Math.max(0, displayedPositionMs / playbackDurationMs))
      : 0;

  useEffect(() => {
    if (!isYoutubeVideo || !youtubeReady || !youtubePlayerRef.current || isScrubbing) return;

    const interval = setInterval(async () => {
      try {
        const [currentTime, totalDuration] = await Promise.all([
          youtubePlayerRef.current.getCurrentTime(),
          youtubePlayerRef.current.getDuration(),
        ]);

        setPlaybackPositionMs(currentTime * 1000);
        setPlaybackDurationMs(totalDuration * 1000);
      } catch (error) {
        // Ignore intermittent YouTube bridge errors while polling.
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isYoutubeVideo, youtubeReady, youtubeVideoId, isScrubbing]);

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

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {isYoutubeVideo && youtubeVideoId ? (
        <View style={styles.videoContainer} pointerEvents="box-none">
          <YoutubePlayer
            key={`${videoFrameWidth}x${videoFrameHeight}`}
            ref={youtubePlayerRef}
            height={videoFrameHeight}
            width={videoFrameWidth}
            play={isPlaying}
            videoId={youtubeVideoId}
            onChangeState={(state: string) => {
              if (state === 'ended') {
                handleVideoEnd();
                setIsPlaying(false);
              } else if (state === 'playing') {
                setIsPlaying(true);
                void maybeStartPersonalizedPlanCountdown();
              } else if (state === 'paused') {
                setIsPlaying(false);
              }
            }}
            onReady={() => setYoutubeReady(true)}
            initialPlayerParams={{
              controls: true,
              modestbranding: true,
              rel: false,
            }}
          />
          <View style={styles.youtubeTopBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={28} color="#FFF" />
            </TouchableOpacity>
          </View>

          {showControls && (
            <View style={styles.youtubeBottomDock}>
              <View style={styles.youtubeProgressCard}>
                <View style={styles.youtubeTimeRow}>
                  <Text style={styles.youtubeTimeText}>
                    {formatPlaybackTime(displayedPositionMs)}
                  </Text>
                  <Text style={styles.youtubeTimeText}>
                    {formatPlaybackTime(playbackDurationMs)}
                  </Text>
                </View>

                <View
                  style={styles.youtubeSeekTrack}
                  onLayout={(event: LayoutChangeEvent) => {
                    setSeekBarWidth(event.nativeEvent.layout.width);
                  }}
                  {...seekBarPanResponder.panHandlers}
                >
                  <View style={styles.youtubeSeekTrackBase} />
                  <View
                    style={[
                      styles.youtubeSeekTrackFill,
                      { width: `${progressRatio * 100}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.youtubeSeekThumb,
                      { left: Math.max(0, progressRatio * seekBarWidth - 9) },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.youtubeSeekRow}>
                <TouchableOpacity
                  style={styles.youtubeSeekButton}
                  onPress={() => handleSkip(-YOUTUBE_SKIP_SECONDS)}
                >
                  <RotateCcw size={18} color="#FFFFFF" />
                  <Text style={styles.youtubeSeekLabel}>
                    -{YOUTUBE_SKIP_SECONDS}s
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.youtubeSeekButton}
                  onPress={() => handleSkip(YOUTUBE_SKIP_SECONDS)}
                >
                  <RotateCw size={18} color="#FFFFFF" />
                  <Text style={styles.youtubeSeekLabel}>
                    +{YOUTUBE_SKIP_SECONDS}s
                  </Text>
                </TouchableOpacity>
              </View>

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
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.videoContainer}
          activeOpacity={1}
          onPress={toggleControls}
        >
          <Video
            ref={(ref) => setVideoRef(ref)}
            source={{ uri: currentVideoUrl }}
            style={[
              styles.video,
              { width: videoFrameWidth, height: videoFrameHeight },
            ]}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={isPlaying}
            isLooping={false}
            onPlaybackStatusUpdate={(status: any) => {
              if (status.isLoaded) {
                setPlaybackPositionMs(status.positionMillis || 0);
                setPlaybackDurationMs(status.durationMillis || 0);
              }
              if (status.isLoaded && status.isPlaying) {
                void maybeStartPersonalizedPlanCountdown();
              }
              if (status.didJustFinish) {
                handleVideoEnd();
              }
            }}
          />

          {/* Controls Overlay */}
          {showControls && (
            <Animated.View entering={FadeInDown} style={styles.overlay}>
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

              {/* Center Controls */}
              <View style={styles.centerControls}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause size={48} color="#FFF" fill="#FFF" />
                  ) : (
                    <Play size={48} color="#FFF" fill="#FFF" />
                  )}
                </TouchableOpacity>
              </View>

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
            </Animated.View>
          )}
        </TouchableOpacity>
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    alignSelf: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  youtubeTopBar: {
    position: 'absolute',
    top: 24,
    left: 20,
    zIndex: 2,
  },
  youtubeBottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 22,
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
  },
  youtubeProgressCard: {
    width: '100%',
    maxWidth: 520,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
  },
  youtubeTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  youtubeTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  youtubeSeekTrack: {
    height: 28,
    justifyContent: 'center',
  },
  youtubeSeekTrackBase: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  youtubeSeekTrackFill: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  youtubeSeekThumb: {
    position: 'absolute',
    top: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  youtubeSeekRow: {
    flexDirection: 'row',
    gap: 12,
  },
  youtubeSeekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
  },
  youtubeSeekLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
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
