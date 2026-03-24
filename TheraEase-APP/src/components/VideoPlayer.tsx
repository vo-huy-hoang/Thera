import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Play, Pause, SkipBack, SkipForward, X, RotateCcw, RotateCw } from 'lucide-react-native';
import { colors } from '@/utils/theme';
import * as ScreenOrientation from 'expo-screen-orientation';
import { extractYouTubeVideoId, isYouTubeUrl } from '@/utils/youtube';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  currentIndex?: number;
  totalCount?: number;
  onComplete?: () => void;
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function VideoPlayer({
  videoUrl,
  title,
  currentIndex,
  totalCount,
  onComplete,
  onClose,
  onNext,
  onPrevious,
}: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // YouTube specific state
  const isYouTube = isYouTubeUrl(videoUrl);
  const youtubeVideoId = isYouTube ? extractYouTubeVideoId(videoUrl) : null;
  const [youtubeReady, setYoutubeReady] = useState(false);
  const youtubePlayerRef = useRef<any>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (isYouTube && youtubePlayerRef.current && youtubeReady) {
      // YouTube player control - use ref methods
      try {
        const playerState = await youtubePlayerRef.current.getPlayerState();
        console.log('Current player state:', playerState);
        
        if (isPlaying) {
          await youtubePlayerRef.current.pauseVideo();
        } else {
          await youtubePlayerRef.current.playVideo();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.log('YouTube control error:', error);
      }
    } else if (videoRef.current) {
      // Regular video control
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = async (seconds: number) => {
    if (isYouTube && youtubePlayerRef.current && youtubeReady) {
      // YouTube player seek
      try {
        const currentTime = await youtubePlayerRef.current.getCurrentTime();
        const newTime = Math.max(0, currentTime + seconds);
        await youtubePlayerRef.current.seekTo(newTime, true);
      } catch (error) {
        console.log('YouTube seek error:', error);
      }
    } else if (videoRef.current) {
      // Regular video seek
      const newPosition = Math.max(0, Math.min(position + seconds * 1000, duration));
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      // Auto-play next exercise when finished
      if (status.didJustFinish) {
        if (onNext && currentIndex !== undefined && totalCount !== undefined && currentIndex < totalCount - 1) {
          // Auto play next after 2 seconds
          setTimeout(() => {
            onNext();
          }, 2000);
        } else if (onComplete) {
          onComplete();
        }
      }
    }
  };

  // Calculate countdown (remaining time)
  const remainingTime = Math.ceil((duration - position) / 1000);
  
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.unlockAsync();
        setIsFullscreen(false);
      } else {
        const currentOrientation = await ScreenOrientation.getOrientationAsync();
        if (currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP || 
            currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
        setIsFullscreen(true);
      }
    } catch (error) {
      console.log('Orientation lock not supported on this device');
      // Fallback: just toggle the state for UI feedback
      setIsFullscreen(!isFullscreen);
    }
  };

  // YouTube player handlers
  const onYouTubeReady = () => {
    setYoutubeReady(true);
  };

  const onYouTubeStateChange = (state: string) => {
    if (state === 'ended') {
      // Auto-play next exercise when finished
      if (onNext && currentIndex !== undefined && totalCount !== undefined && currentIndex < totalCount - 1) {
        setTimeout(() => {
          onNext();
        }, 2000);
      } else if (onComplete) {
        onComplete();
      }
    }
  };

  // Update position and duration for YouTube
  useEffect(() => {
    if (!isYouTube || !youtubeReady || !youtubePlayerRef.current) return;

    const interval = setInterval(async () => {
      try {
        const currentTime = await youtubePlayerRef.current.getCurrentTime();
        const videoDuration = await youtubePlayerRef.current.getDuration();
        
        setPosition(currentTime * 1000);
        setDuration(videoDuration * 1000);
      } catch (error) {
        // Ignore errors
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isYouTube, youtubeReady]);

  // Reset orientation when component unmounts
  useEffect(() => {
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {/* Video - YouTube or Regular */}
        {isYouTube && youtubeVideoId ? (
          <View style={styles.youtubeWrapper}>
            <YoutubePlayer
              ref={youtubePlayerRef}
              height={SCREEN_WIDTH * 9 / 16}
              width={SCREEN_WIDTH}
              videoId={youtubeVideoId}
              play={true}
              onReady={onYouTubeReady}
              onChangeState={onYouTubeStateChange}
              initialPlayerParams={{
                controls: true,
                modestbranding: true,
                rel: false,
              }}
            />
          </View>
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        )}

        {/* Top Bar: Title + Close */}
        <View style={styles.topBar}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {currentIndex !== undefined && totalCount !== undefined && (
              <Text style={styles.exerciseProgress}>
                Bài tập {currentIndex + 1}/{totalCount}
              </Text>
            )}
          </View>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* COUNTDOWN TIMER - Ở trên video, không đè */}
        <View style={styles.timerSection}>
          <Text style={styles.countdownText}>{formatCountdown(remainingTime)}</Text>
        </View>

        {/* Bottom Controls - Luôn hiện */}
        <View style={styles.bottomSection}>
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(position / duration) * 100}%` }
              ]} 
            />
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsRow}>
            {/* Previous Exercise */}
            {onPrevious && currentIndex !== undefined && currentIndex > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={onPrevious}
              >
                <SkipBack size={24} color={colors.primary} />
              </TouchableOpacity>
            )}

            {/* Rewind 15s */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => handleSkip(-15)}
            >
              <RotateCcw size={24} color={colors.primary} />
            </TouchableOpacity>

            {/* Forward 15s */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => handleSkip(15)}
            >
              <RotateCw size={24} color={colors.primary} />
            </TouchableOpacity>

            {/* Next Exercise */}
            {onNext && currentIndex !== undefined && totalCount !== undefined && currentIndex < totalCount - 1 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={onNext}
              >
                <SkipForward size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: '100%',
  },
  youtubeWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // Top Bar: Title + Close
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  exerciseProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  closeButton: {
    padding: 12,
    position: 'absolute',
    right: 12,
    top: 56,
  },

  // Timer Section - Ở trên video
  timerSection: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: -4,
  },

  // Bottom Section - Controls
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fullscreenButton: {
    padding: 4,
    marginLeft: 8,
  },
});
