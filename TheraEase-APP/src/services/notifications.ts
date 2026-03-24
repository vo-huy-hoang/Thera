import * as Notifications from 'expo-notifications';
import { api } from './api';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if running in Expo Go (push tokens don't work there since SDK 53)
const isExpoGo = Constants.appOwnership === 'expo';

// Register for push notifications
export async function registerForPushNotifications() {
  // Push tokens are not available in Expo Go since SDK 53
  if (isExpoGo) {
    console.log('Push notifications not available in Expo Go. Use a development build.');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Save token to backend
    await api.post('/notification-token', {
      token,
      platform: Platform.OS,
    });

    return token;
  } catch (error) {
    console.error('Register push notifications error:', error);
    return null;
  }
}

// Schedule daily reminder
export async function scheduleDailyReminder(hour = 8, minute = 0) {
  try {
    // Cancel existing reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule new daily reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'TheraEase 🧘‍♀️',
        body: 'Đã đến giờ tập trị liệu! Hãy bắt đầu ngay nào.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    console.log('Daily reminder scheduled');
  } catch (error) {
    console.error('Schedule reminder error:', error);
  }
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Configure notification handler
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
