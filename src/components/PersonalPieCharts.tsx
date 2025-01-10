import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import PieChart from './downloaded/PieChart';
import colors from '../styles/colors';
import { Category } from '../Types';
import { Animated, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

interface PersonalPieChartProps {
  todolist_categories: Category[];
}

const PersonalPieChart: React.FC<PersonalPieChartProps> = ({
  todolist_categories,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Combine tasks from all categories safely
  const allTasks =
    todolist_categories?.flatMap(category => category.tasks) || [];
  const completedTasks =
    todolist_categories?.flatMap(category => category.completedTasks) || [];

  const predefinedColors = [
    colors.categoryBlue,
    colors.categoryGreen,
    colors.categoryYellow,
    colors.categoryRed,
    colors.categoryPurple,
    colors.categoryOrange,
  ];

  const reservedColors = [
    '#6A3131', // Reserved color 1
    '#448844', // Reserved color 2
    '#4BA58D', // Reserved color 3
    '#444488', // Reserved color 4
    '#901878', // Reserved color 5
  ];

  const assignedColors = new Map<string, string>();

  const getUniqueColor = (category: string, defaultColor: string) => {
    if (!assignedColors.has(category)) {
      // Check if the default color is already in use
      if (![...assignedColors.values()].includes(defaultColor)) {
        assignedColors.set(category, defaultColor);
      } else {
        // Use a reserved color if the default is already taken
        const availableReservedColor = reservedColors.find(
          color => ![...assignedColors.values()].includes(color),
        );

        assignedColors.set(
          category,
          availableReservedColor || '#808080', // Default to gray if no reserved colors are available
        );
      }
    }
    return assignedColors.get(category)!;
  };

  // Chart 1: Tasks Completed vs Open
  const completed = completedTasks.length;
  const open = allTasks.filter(task => !task.isCompleted).length;
  const tasksCompletedData = [
    {
      name: 'Completed',
      count: completed,
      color: colors.categoryGreen,
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Open',
      count: open,
      color: colors.categoryRed,
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  // Chart 2: Tasks Per Category
  const categories = allTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = { count: 0, color: task.categoryColor };
    }
    acc[task.category].count += 1;
    return acc;
  }, {});

  const categoryEntries = Object.entries(categories).sort(
    ([, a], [, b]) => b.count - a.count,
  );

  const tasksPerCategoryData = categoryEntries.map(
    ([category, { count, color }]) => ({
      name: category,
      count,
      color: getUniqueColor(category, color),
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    }),
  );

  // Chart 3: Tasks Shared With
  const sharedWith = allTasks.reduce((acc, task) => {
    task.sharedWith.forEach(person => {
      acc[person] = (acc[person] || 0) + 1;
    });
    return acc;
  }, {});

  const tasksSharedWithData = Object.entries(sharedWith).map(
    ([person, count], index) => ({
      name: person,
      count,
      color: predefinedColors[index % predefinedColors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    }),
  );

  const slides = [
    {
      title: 'Completed vs Open Tasks',
      data: tasksCompletedData,
    },
    {
      title: 'Tasks Per Category',
      data: tasksPerCategoryData,
    },
    {
      title: 'Shared Tasks',
      data: tasksSharedWithData,
    },
  ];

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
        {slides.map((slide, index) => (
          <View key={index} style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{slide.title}</Text>
            <PieChart
              data={slide.data}
              width={width}
              height={250}
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
          </View>
        ))}
      </ScrollView>
      {/* Slide Indicator */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
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
    alignItems: 'center',
    paddingVertical: 20,
  },
  chartContainer: {
    width,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
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
    backgroundColor: '#d3d3d3',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: colors.primaryGreen,
  },
});

export default PersonalPieChart;
