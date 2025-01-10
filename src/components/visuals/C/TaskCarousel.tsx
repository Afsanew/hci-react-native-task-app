import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import PieChart from '../../downloaded/PieChart';
import ProgressChart from '../../downloaded/ProgressChart';
import colors from '../../../styles/colors';
import { Category } from '../../../Types';

const { width } = Dimensions.get('window');

interface TaskCarouselProps {
  categories: Category[];
}

const TaskCarousel: React.FC<TaskCarouselProps> = ({ categories }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter categories with tasks or completed tasks
  const filteredCategories = categories.filter(
    category => category.tasks.length > 0 || category.completedTasks.length > 0,
  );

  // Assigned colors for fallback
  const reservedColors = [
    '#6A3131',
    '#448844',
    '#4BA58D',
    '#444488',
    '#901878',
  ];
  const assignedColors = new Map<string, string>();

  const getUniqueColor = (category: string, defaultColor: string) => {
    if (!assignedColors.has(category)) {
      if (![...assignedColors.values()].includes(defaultColor)) {
        assignedColors.set(category, defaultColor);
      } else {
        const availableReservedColor = reservedColors.find(
          color => ![...assignedColors.values()].includes(color),
        );
        assignedColors.set(category, availableReservedColor || '#808080'); // Fallback to gray
      }
    }
    return assignedColors.get(category)!;
  };

  // Data for Pie Chart: Open Tasks per Category
  const openTasksData = filteredCategories.map(category => ({
    name: category.name,
    count: category.tasks.length,
    color: getUniqueColor(category.name, category.color),
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const pieChartData = openTasksData.map(item => ({
    name: item.name,
    population: item.count,
    color: item.color,
    legendFontColor: item.legendFontColor,
    legendFontSize: item.legendFontSize,
  }));

  // Data for Progress Ring Chart: Completion Rates per Category
  const progressData = {
    labels: filteredCategories.map(category => category.name),
    data: filteredCategories.map(category => {
      const completedTasks = category.completedTasks.length;
      const totalTasks = category.tasks.length + completedTasks;
      return totalTasks > 0 ? completedTasks / totalTasks : 0; // Progress as a fraction
    }),
  };

  const progressColors = filteredCategories.map(category =>
    getUniqueColor(category.name, category.color),
  );

  // Scroll event handler
  const handleScroll = event => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const hexToRgba = (hex: string, opacity = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
        {/* Progress Ring Chart Slide */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Task Completion Rates</Text>
          {progressData.data.length > 0 ? (
            <ProgressChart
              data={progressData}
              width={width - 60} // Dynamically adjust width with padding
              height={220}
              strokeWidth={width * 0.03}
              radius={width * 0.08}
              chartConfig={{
                backgroundColor: colors.background,
                backgroundGradientFrom: colors.background,
                backgroundGradientTo: colors.background,
                color: (opacity = 1, index = 0) =>
                  hexToRgba(
                    progressColors[index] || colors.primaryGreen,
                    opacity,
                  ), // Use category-specific or fallback color
                labelColor: (opacity = 1) => colors.text, // Labels
                propsForBackgroundLines: {
                  strokeWidth: 1,
                  stroke: colors.lightGrey, // Light gray for background grid lines
                },
              }}
              hideLegend={false} // Show the legend below the chart
            />
          ) : (
            <Text style={styles.noDataText}>No data available.</Text>
          )}
        </View>
        {/* Pie Chart Slide */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Open Tasks per Category</Text>
          {pieChartData.length > 0 ? (
            <PieChart
              data={pieChartData}
              width={width - 40}
              height={220}
              accessor="population"
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              backgroundColor="transparent"
              hasLegend={true}
              absolute
            />
          ) : (
            <Text style={styles.noDataText}>No data available.</Text>
          )}
        </View>
      </ScrollView>

      {/* Slide Indicators */}
      <View style={styles.indicatorContainer}>
        {[0, 1].map(index => (
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
    backgroundColor: colors.background,
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
  noDataText: {
    fontSize: 16,
    color: colors.lightGrey,
    marginTop: 20,
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
    backgroundColor: colors.lightGrey,
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: colors.primaryGreen,
  },
});

export default TaskCarousel;
