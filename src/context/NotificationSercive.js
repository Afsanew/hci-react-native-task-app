import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  onNotification: function (notification) {
    console.log('LOCAL NOTIFICATION:', notification);
  },

  popInitialNotification: true,
  requestPermissions: true,
});

export const scheduleNotification = (title, message) => {
  PushNotification.localNotification({
    title: title,
    message: message,
    playSound: true,
    soundName: 'default',
  });
};
