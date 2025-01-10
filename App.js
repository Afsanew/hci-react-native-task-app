/*import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
*/
// App.tsx
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ToDoListProvider } from './src/context/ToDoListContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { StreakProvider } from './src/context/StreakContext';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

LogBox.ignoreAllLogs(); //ignore warnigns etc

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const registerForPushNotificationsAsync = async () => {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return;
  }
};

const App = () => {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToDoListProvider>
        <SettingsProvider>
          <StreakProvider>
            {/*<AppNavigator view="box" />*/}{' '}
            {/*remove above comment and comment out the next line to enable the box view instead of the list view*/}
            <AppNavigator view="list" />
          </StreakProvider>
        </SettingsProvider>
      </ToDoListProvider>
    </GestureHandlerRootView>
  );
};

export default App;
