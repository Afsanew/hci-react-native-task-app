import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import { Task, Category } from '../../Types';
import { getPriorityColor } from '../../utils/priorityUtils';
import users from '../../context/UserContext';
import { navigate } from '../../navigation/RootNavigation';

interface TaskItemBoxProps {
  task: Task;
  category: Category;
  onComplete: (toggledTask: Task, toggledCategory: Category) => void;
  onDelete: (task: Task) => void;
}

const TaskItemBox: React.FC<TaskItemBoxProps> = ({
  task,
  category,
  onComplete,
  onDelete,
}) => {
  const translateX = useSharedValue(0);

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor:
      translateX.value > 0
        ? colors.alertRed // Swipe right
        : translateX.value < 0
          ? colors.primaryGreen // Swipe left
          : 'transparent', // Neutral
  }));

  const wantTodeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete the task "${task.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            translateX.value = withSpring(0);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(task);
          },
        },
      ],
    );
  };

  const handleGesture = ({ nativeEvent }) => {
    translateX.value = nativeEvent.translationX;
  };

  const handleGestureEnd = ({ nativeEvent }) => {
    if (nativeEvent.translationX > 50) {
      translateX.value = withSpring(400, {}, () =>
        runOnJS(wantTodeleteTask)(task),
      );
    } else if (nativeEvent.translationX < -50) {
      translateX.value = withSpring(-400, {}, () =>
        runOnJS(onComplete)(task, category),
      );
    } else {
      translateX.value = withSpring(0); // Reset position
    }
  };
  const [isPressed, setIsPressed] = useState(false);

  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isPressed ? 0.9 : 1 }, // Slightly shrink on press
    ],
    opacity: isPressed ? 0.9 : 1, // Dim slightly on press
  }));

  const trashIconStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? Math.min(translateX.value / 100, 1) : 0,
    transform: [{ translateX: Math.min(translateX.value - 50, 0) }],
  }));

  const checkIconStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? Math.min(-translateX.value / 100, 1) : 0,
    transform: [{ translateX: Math.max(translateX.value + 50, 0) }],
  }));

  const sharedUserAvatars =
    (task.inSharedCategory &&
      task.categorySharedWith &&
      task.categorySharedWith
        .map(username => users.find(user => user.name === username))
        .filter(Boolean)) ||
    (task.sharedWith &&
      task.sharedWith
        .map(username => users.find(user => user.name === username))
        .filter(Boolean)) ||
    []; // Filter out undefined values

  const openDetail = () => {
    navigate('All Tasks', {
      screen: 'TaskDetailScreen', // Target screen within "All Tasks"
      params: {
        task: {
          ...task,
          deadline: task.deadline ? task.deadline : null, // Convert Date to string
        },
      },
    });
  };
  return (
    <View style={styles.outerContainer}>
      {/* Background for swipe actions */}
      <Animated.View style={[styles.background, animatedBackgroundStyle]}>
        {/* Trash Icon */}
        <Animated.View style={[styles.icon, styles.trashIcon, trashIconStyle]}>
          <Ionicons name="trash" size={24} color={colors.white} />
        </Animated.View>
        {/* Checkbox Icon */}
        <Animated.View style={[styles.icon, styles.checkIcon, checkIconStyle]}>
          <Ionicons name="checkmark-done" size={24} color={colors.white} />
        </Animated.View>
      </Animated.View>

      {/* Foreground task content */}
      <PanGestureHandler
        onGestureEvent={handleGesture}
        onEnded={handleGestureEnd}
      >
        <Animated.View
          style={[styles.container, animatedContentStyle, animatedPressStyle]}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => {
            setIsPressed(false); // Reset on touch release
            openDetail(); // Open task details on press
          }}
        >
          <View style={styles.header}>
            {/* Task Name */}
            <Text
              style={[
                styles.taskName,
                task.isCompleted && styles.completedText,
              ]}
            >
              {task.name}
            </Text>

            {/* Priority Flag */}
            {task.priority && (
              <Ionicons
                name="flag"
                size={18}
                color={getPriorityColor(task.priority)}
                style={styles.priorityIcon}
              />
            )}
          </View>

          {/* Due Date */}
          {task.deadline && (
            <Text style={styles.dueText}>
              Due:{' '}
              {new Intl.DateTimeFormat('de-DE').format(new Date(task.deadline))}
            </Text>
          )}

          {/* Shared With */}
          <View style={styles.sharedWithContainer}>
            {sharedUserAvatars.map(user => (
              <Image
                key={user?.name}
                source={user?.avatar}
                style={styles.avatar}
              />
            ))}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '30%', // Fixed width for consistent grid layout
    height: 150, // Ensure all boxes are square
    margin: 6,
    position: 'relative', // Ensures content stays within the box
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 2,
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 8, // Matches the container
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: 'hidden', // Ensures content stays within the box
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures the flag is on the right
    marginBottom: 2,
  },
  taskName: {
    fontSize: 16,
    color: colors.text,
    flexShrink: 1, // Prevents the text from overflowing
  },
  dueText: {
    fontSize: 14,
    color: colors.alertRed,
    marginBottom: 8,
  },
  sharedWithContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 5,
  },
  priorityIcon: {
    marginLeft: 5,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.alertRed,
  },
  icon: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
  trashIcon: {
    left: 15,
  },
  checkIcon: {
    right: 15,
  },
});

export default TaskItemBox;
