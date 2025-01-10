import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useToDoList } from '../context/ToDoListContext';
import colors from '../styles/colors';

import StreakVisualization from '../components/visuals/A/StreakVisualization';
import TaskCompletionTrends from '../components/visuals/B/TaskCompletionTrends';
import TaskCarousel from '../components/visuals/C/TaskCarousel';
import SharedInsights from '../components/visuals/D/SharedInsights';
import { useStreak } from '../context/StreakContext';

const VisualsScreen = () => {
  const { toDoList, dailyHistory } = useToDoList();
  const { enableStreak } = useStreak();

  const allTasks =
    toDoList?.categories?.flatMap(category => category.tasks) || [];
  const completedTasks =
    toDoList?.categories?.flatMap(category => category.completedTasks) || [];

  if (!toDoList || (allTasks.length === 0 && completedTasks.length === 0)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No tasks available to display charts.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {/* Motivational Header */}
      {enableStreak && <StreakVisualization />}

      {/* Carousel 1: Task Completion Trends */}
      <TaskCompletionTrends />

      {/* Carousel 2: Category Insights */}
      <TaskCarousel categories={toDoList.categories} />

      {/* Carousel 3: Shared Insights */}
      <SharedInsights />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  groupContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: colors.background,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGrey,
  },
});

export default VisualsScreen;
