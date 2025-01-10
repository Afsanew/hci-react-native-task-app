import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, Text } from 'react-native';
import SpiderDiagram from './SpiderDiagram';
import MentalLoadGauge from './MentalLoadGauge';
import TaskDistributionPie from './TaskDistributionPie';
import colors from '../../../styles/colors';
import users from '../../../context/UserContext';
import { useToDoList } from '../../../context/ToDoListContext';

const { width } = Dimensions.get('window');

const SharedInsights = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { toDoList } = useToDoList();
  const ca = toDoList.categories.map(cat => cat.name);
  const [activeCategories, setActiveCategories] = useState(ca);
  const categories = toDoList.categories;

  // Define static fake task data for other users
  const fakeToDoLists = users.reduce(
    (acc, user) => {
      acc[user.name] = categories.reduce(
        (catAcc, category) => {
          // Randomly assign tasks per category or leave it empty
          catAcc[category.name] =
            Math.random() > 0.5 ? Math.floor(Math.random() * 8) : 0;
          return catAcc;
        },
        {} as { [categoryName: string]: number },
      );
      return acc;
    },
    {} as Record<string, { [categoryName: string]: number }>,
  );

  // Combine fake load data with shared tasks for Mental Load
  const userLoadData = users.reduce(
    (acc, user) => {
      const sharedTaskCount = categories
        .flatMap(category => category.tasks)
        .filter(task => task.sharedWith.includes(user.name)).length;

      const totalFakeTasks = Object.values(
        fakeToDoLists[user.name] || {},
      ).reduce((sum, count) => sum + count, 0);

      acc[user.name] = sharedTaskCount + totalFakeTasks;
      return acc;
    },
    {} as { [userName: string]: number },
  );

  // Handle scroll to track the current slide
  const handleScroll = event => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Task Distribution (Pie Chart) */}
        <View style={styles.chartContainer}>
          <TaskDistributionPie />
        </View>

        {/* Per-Category Task Distribution (Spider Diagram) */}
        <View style={styles.chartContainer}>
          <SpiderDiagram
            activeCategories={activeCategories}
            setActiveCategories={setActiveCategories}
          />
        </View>

        {/* Mental Load (Gauge) */}
        <View style={styles.chartContainer}>
          <MentalLoadGauge />
        </View>
      </ScrollView>

      {/* Slide Indicators */}
      <View style={styles.indicatorContainer}>
        {[0, 1, 2].map(index => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentSlide === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  chartContainer: {
    width,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: colors.text,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.lightGrey,
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: colors.primaryGreen,
  },
});

export default SharedInsights;
