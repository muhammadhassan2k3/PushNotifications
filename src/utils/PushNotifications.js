import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import NavigationService from '../screens/Nevigation/NavigationService';

/**
 * This code is a function that requests permission from the user
 *  to receive push notifications using the FCM SDK. If the user
 *  grants permission, it logs the authorization status to the
 *  console and calls another function to retrieve the FCM token.
 */

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFcmToken();
  }
}

/**
 * This code is a function that retrieves the FCM token for the
 * device from local storage or generates a new token if it does
 * not exist or has expired. If a new token is generated, it is
 *  stored in local storage. The function logs the value of the
 *  token to the console for debugging purposes.
 */

/**
 * what is fcm token?
 * FCM token stands for Firebase Cloud Messaging token. It's a
 *  unique identifier generated by the Firebase Cloud Messaging
 *  service for each instance of an app on a device. The FCM
 *  token is used by the FCM service to send push notifications
 *  to the app.
 */

const getFcmToken = async () => {
  let fcmToken = await AsyncStorage.getItem('fcmToken');
  console.log('Old fcm Token: ', fcmToken);
  if (!fcmToken) {
    try {
      fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('New genrated fcm Token: ', fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    } catch (error) {
      console.log('error in fcm Token', error);
    }
  }
};

export const NotificationServices = () => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', remoteMessage);
  });

  /**
   * This method listens for notifications that were used to open
   *  the app from a background state.When a notification is
   *  clicked, this method logs the notification data to the
   *  console.
   */
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage,
    );

    if (!!remoteMessage?.data?.redirect_To !== '') {
      setTimeout(() => {
        NavigationService.navigate(remoteMessage.data.redirect_To);
      }, 500);
    }
  });

  // Foreground message handling
  messaging().onMessage(async remoteMessage => {
    console.log('Notifications in foreground: ', remoteMessage);
  });

  // Check whether an initial notification is available
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
      }
    });
};
