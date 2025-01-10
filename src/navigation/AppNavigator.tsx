import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

// screens
import HomepageScreen from '../screens/HomepageScreen';
import TasksScreen from '../screens/TasksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VisualsScreen from '../screens/VisualsScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import ManageCategoryScreen from '../screens/ManageCategoryScreen';

// Box View Screens
import HomepageScreenBox from '../screens/HomepageScreenBox';
import TasksScreenBox from '../screens/TasksScreenBox';
import TaskDetailScreenBox from '../screens/TaskDetailScreenBox';

import { navigationRef } from './RootNavigation'; // Import your navigation ref

import colors from '../styles/colors';

// components
import AddTaskButton from '../components/task/AddTaskButton';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

interface AppNavigatorProps {
  view: 'list' | 'box';
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ view }) => {
  const [isTaskTabFocused, setIsTaskTabFocused] = React.useState(false);

  // Dynamically select screens based on `view` prop
  const Homepage = view === 'list' ? HomepageScreen : HomepageScreenBox;
  const Tasks = view === 'list' ? TasksScreen : TasksScreenBox;
  const TaskDetail = view === 'list' ? TaskDetailScreen : TaskDetailScreenBox;

  const TasksStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Tasks"
          component={Tasks}
          options={{ title: 'All Tasks' }}
        />
        <Stack.Screen
          name="TaskDetailScreen"
          component={TaskDetail}
          options={{ title: 'Edit Task' }}
        />
        <Stack.Screen
          name="ManageCategories"
          component={ManageCategoryScreen}
          options={{ title: 'Edit Categories' }}
        />
      </Stack.Navigator>
    );
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <View style={styles.container}>
        <Tab.Navigator
          initialRouteName="All Tasks"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              const icons = {
                Home: 'home-outline',
                'All Tasks': 'list-outline',
                Visuals: 'eye-outline',
                Settings: 'settings-outline',
              };
              const iconName = icons[route.name as keyof typeof icons];
              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.darkGreen,
            tabBarInactiveTintColor: colors.lightGrey,
          })}
          screenListeners={({ route }) => ({
            state: () => {
              setIsTaskTabFocused(route.name === 'All Tasks');
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={Homepage}
            options={{
              title: 'Home',
            }}
          />
          <Tab.Screen
            name="All Tasks"
            component={TasksStack}
            options={{ headerShown: false }}
          />
          <Tab.Screen name="Visuals" component={VisualsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
        {isTaskTabFocused && (
          <View style={styles.addButtonContainer}>
            <AddTaskButton />
          </View>
        )}
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 55,
    alignSelf: 'center',
    zIndex: 10,
  },
});

export default AppNavigator;
