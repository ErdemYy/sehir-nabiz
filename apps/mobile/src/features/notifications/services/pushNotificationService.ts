import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerPushTokenApi, deactivatePushTokenApi } from './notificationsApi';
import { PushPlatform } from '@sehir-nabiz/shared';

// Ön plandayken bildirimlerin nasıl gösterileceğini ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class PushNotificationClient {
  private static instance: PushNotificationClient | null = null;
  private currentPushToken: string | null = null;

  public static getInstance(): PushNotificationClient {
    if (!PushNotificationClient.instance) {
      PushNotificationClient.instance = new PushNotificationClient();
    }
    return PushNotificationClient.instance;
  }

  /**
   * Android Bildirim Kanalı Yapılandırması
   */
  public async setupAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('sehir-nabiz-default', {
        name: 'ŞehirNabız Gelişmeleri',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0D9488', // Kentsel Turkuaz
      });
    }
  }

  /**
   * Push Bildirim İzni Talep Et ve Token Al
   */
  public async registerForPushNotifications(authToken?: string | null): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return null;
      }

      await this.setupAndroidChannel();

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      // Expo Push Token al
      const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
      if (!tokenData?.data) {
        return null;
      }

      const token = tokenData.data;
      this.currentPushToken = token;

      // Backend API'sine bildir
      if (authToken) {
        const platform =
          Platform.OS === 'ios'
            ? PushPlatform.IOS
            : Platform.OS === 'android'
            ? PushPlatform.ANDROID
            : PushPlatform.WEB;

        await registerPushTokenApi(
          {
            token,
            platform,
          },
          authToken,
        ).catch(() => {});
      }

      return token;
    } catch {
      return null;
    }
  }

  /**
   * Oturum Kapatılırken Push Tokenı Pasifleştir
   */
  public async unregisterPushToken(authToken?: string | null): Promise<void> {
    if (this.currentPushToken && authToken) {
      await deactivatePushTokenApi(this.currentPushToken, authToken).catch(() => {});
      this.currentPushToken = null;
    }
  }
}

export const pushNotificationClient = PushNotificationClient.getInstance();
