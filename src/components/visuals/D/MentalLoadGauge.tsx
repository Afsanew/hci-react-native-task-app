import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import CircularProgress from '../../downloaded/CircularProgress'; // Custom CircularProgress component
import users from '../../../context/UserContext';
import { useToDoList } from '../../../context/ToDoListContext';
import colors from '../../../styles/colors';

const maxTasks = 25; // Maximum number of tasks for 100% load

const MentalLoadGauges = () => {
  const { toDoList } = useToDoList();
  const tasks = toDoList.categories.flatMap(category => category.tasks);

  // Add wife to users list
  const allUsers = [
    {
      name: 'Wife',
      avatar: require('../../../../assets/wife.png'),
    },
    ...users,
  ];

  // Define colors for each user
  const userColors = {
    Wife: colors.pastelPink,
    Marc: colors.secondaryBlue,
    Emma: colors.pastelYellow,
    Chris: colors.primaryGreen,
  };

  // Generate mental load data
  const mentalLoadData = allUsers.map(user => {
    let totalTasks;

    if (user.name === 'Wife') {
      // For Wife, count all tasks across all categories
      totalTasks = tasks.length;
    } else {
      // For others, count shared tasks and fake tasks
      const sharedTaskCount = tasks.filter(task =>
        task.sharedWith.includes(user.name),
      ).length;

      const nonSharedTasks = Math.floor(Math.random() * 5) + 4; // Between 2 and 5
      totalTasks = sharedTaskCount + nonSharedTasks;
    }

    return {
      name: user.name,
      avatar: user.avatar,
      totalTasks,
      loadPercentage: Math.min((totalTasks / maxTasks) * 100, 100), // Cap at 100%
      color: userColors[user.name] || colors.primaryGreen, // Use assigned colors
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mental Load of Your Family</Text>
      <View style={styles.gaugeContainer}>
        {mentalLoadData.map((user, index) => (
          <View key={index} style={styles.gaugeItem}>
            <CircularProgress
              size={120}
              width={12}
              fill={user.loadPercentage}
              tintColor={user.color}
              backgroundColor={`${colors.lightGrey}88`} // Reduced opacity
            >
              {() => <Image source={user.avatar} style={styles.avatar} />}
            </CircularProgress>
            <Text style={styles.legendText}>
              {user.totalTasks} {user.totalTasks === 1 ? 'task' : 'tasks'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  gaugeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  gaugeItem: {
    alignItems: 'center',
    marginVertical: 10,
    width: '45%', // Ensures 2 items per row
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  legendText: {
    fontSize: 14,
    color: colors.darkGrey,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default MentalLoadGauges;
