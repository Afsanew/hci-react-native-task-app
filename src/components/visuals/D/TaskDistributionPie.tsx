import React from 'react';
import { View, StyleSheet, Text, Dimensions, Image } from 'react-native';
import BarChart from '../../downloaded/BarChart';
import colors from '../../../styles/colors';
import users from '../../../context/UserContext';
import { Task } from '../../../Types';
import { useToDoList } from '../../../context/ToDoListContext';

const { width } = Dimensions.get('window');

const TaskDistributionBarChart = () => {
  const { toDoList } = useToDoList();
  const tasks = toDoList.categories.flatMap(category => category.tasks);

  // Count tasks shared with each user
  const tasksSharedWith = users.map(user => {
    const sharedCount = tasks.filter(task =>
      task.sharedWith.includes(user.name),
    ).length;

    return {
      name: user.name,
      count: sharedCount,
      avatar: user.avatar, // Avatar for each user
    };
  });

  // Add wife's tasks (main user)
  const wifeTasks = tasks.filter(task => task.sharedWith.length === 0).length;

  const dataForChart = [...tasksSharedWith];
  const barData = {
    labels: dataForChart.map(user => ''), // No labels (replaced by avatars)
    datasets: [
      {
        data: dataForChart.map(user => user.count),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    fillShadowGradient: colors.primaryGreen,
    fillShadowGradientOpacity: 0.8,
    color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`,
    labelColor: () => colors.darkGrey,
    barPercentage: 1,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Number of tasks that you are sharing</Text>

      {/* Bar Chart */}
      <BarChart
        data={barData}
        width={width}
        height={220}
        fromZero
        chartConfig={chartConfig}
        showValuesOnTopOfBars
        withHorizontalLabels={false}
      />

      {/* Avatars above bars */}
      <View style={styles.avatarsContainer}>
        {dataForChart.map((user, index) => (
          <View key={index} style={styles.avatarItem}>
            <Image source={user.avatar} style={styles.avatar} />
            <Text style={styles.legendText}>
              {user.count} {user.count === 1 ? 'task' : 'tasks'}
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  avatarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
  },
  avatarItem: {
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  legendText: {
    fontSize: 14,
    color: colors.darkGrey,
    textAlign: 'center',
  },
});

export default TaskDistributionBarChart;
