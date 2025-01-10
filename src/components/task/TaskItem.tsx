import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../../styles/colors';
import { Task, Category } from '../../Types';
import { getPriorityColor } from '../../utils/priorityUtils';
import users from '../../context/UserContext';
import { navigate } from '../../navigation/RootNavigation';

interface TaskItemProps {
  task: Task;
  category: Category;
  toggleComplete: (toggledTask: Task, toggledCategory: Category) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  category,
  toggleComplete,
}) => {
  const navigation = useNavigation();
  // Get avatars of shared users
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
    <View
      style={[
        styles.taskContainer,
        { borderLeftColor: task.categoryColor },
        task.isCompleted && styles.completedTaskContainer,
      ]}
    >
      <TouchableOpacity
        style={styles.checkboxOutsite}
        onPress={() => toggleComplete(task, category)}
      >
        <View style={styles.checkbox}>
          {task.isCompleted && (
            <Ionicons name="checkmark" size={18} color={colors.primaryGreen} />
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={openDetail} style={styles.taskInfo}>
        <View style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Text
            style={[styles.taskName, task.isCompleted && styles.completedText]}
          >
            {task.name}
          </Text>
          {task.deadline && (
            <Text style={styles.deadlineText}>
              Due: {new Date(task.deadline).toDateString()}
            </Text>
          )}
        </View>
        <View style={styles.flagAndAvatars}>
          <View style={styles.avatarContainer}>
            {sharedUserAvatars.map(user => (
              <Image
                key={user?.name}
                source={user?.avatar}
                style={styles.avatar}
              />
            ))}
          </View>
          <Ionicons
            name="flag"
            size={22}
            color={getPriorityColor(task.priority)}
            style={styles.priorityIcon}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: 'row',
    marginVertical: 1,
    alignItems: 'center',
    padding: 8,
    borderLeftWidth: 4,
    backgroundColor: colors.white,
    borderRadius: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
  },
  checkboxOutsite: {
    paddingRight: 20,
  },
  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 4,
    borderColor: 'black',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flagAndAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskName: {
    fontSize: 17,
    color: colors.text,
  },
  deadlineText: {
    fontSize: 11,
    color: colors.alertRed,
  },
  priorityIcon: {
    marginLeft: 15, // Adds spacing between the avatars and the flag
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.alertRed,
  },
  completedTaskContainer: {
    opacity: 0.5,
  },
  avatarContainer: {
    flexDirection: 'row',
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 2, // Adds spacing between individual avatars
  },
});

export default TaskItem;
