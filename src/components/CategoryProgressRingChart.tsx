import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import ProgressChart from './downloaded/ProgressChart';
import colors from '../styles/colors';
import { Category } from '../Types';

// Get the screen width
const screenWidth = Dimensions.get('window').width;

interface CategoryProgressRingChartProps {
  categories: Category[];
}

const CategoryProgressRingChart: React.FC<CategoryProgressRingChartProps> = ({
  categories,
}) => {
  // Filter out categories with no tasks
  const filteredCategories = categories.filter(
    category => category.tasks.length > 0 || category.completedTasks.length > 0,
  );

  // Manage unique colors for each category
  const reservedColors = [
    '#6A3131', // Reserved color 1
    '#448844', // Reserved color 2
    '#4BA58D', // Reserved color 3
    '#444488', // Reserved color 4
    '#901878', // Reserved color 5
  ];
  const assignedColors = new Map<string, string>();

  const getUniqueColor = (categoryName: string, defaultColor: string) => {
    if (!assignedColors.has(categoryName)) {
      if (![...assignedColors.values()].includes(defaultColor)) {
        // Use default color if it's not already assigned
        assignedColors.set(categoryName, defaultColor);
      } else {
        // Use a reserved color if default is already taken
        const availableReservedColor = reservedColors.find(
          color => ![...assignedColors.values()].includes(color),
        );
        assignedColors.set(
          categoryName,
          availableReservedColor || defaultColor,
        );
      }
    }
    return assignedColors.get(categoryName)!;
  };

  // Prepare data for the chart
  const data = {
    labels: filteredCategories.map(category => category.name), // Array of strings
    data: filteredCategories.map(category => {
      const completedTasks = category.completedTasks.length;
      const totalTasks = category.tasks.length + category.completedTasks.length;
      return totalTasks > 0 ? completedTasks / totalTasks : 0; // Normalized between 0 and 1
    }), // Array of numbers (progress values between 0 and 1)
  };

  // Use unique colors for the chart rings
  const categoryColors = filteredCategories.map(category =>
    getUniqueColor(category.name, category.color),
  );

  const hexToRgba = (hex: string, opacity = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Handle case when no categories have tasks
  if (filteredCategories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tasks available to display.</Text>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Category Progress</Text>
      <ProgressChart
        data={data}
        width={screenWidth - 60} // Dynamically adjust width with padding
        height={screenWidth * 0.55}
        strokeWidth={screenWidth * 0.03}
        radius={screenWidth * 0.08}
        chartConfig={{
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.background,
          backgroundGradientTo: colors.background,
          color: (opacity = 1, index = 0) =>
            hexToRgba(categoryColors[index] || colors.primaryGreen, opacity), // Use category-specific or fallback color
          labelColor: (opacity = 1) => colors.text, // Labels
          propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: colors.lightGrey, // Light gray for background grid lines
          },
        }}
        hideLegend={false} // Show the legend below the chart
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    width: screenWidth, // Full screen width
    alignItems: 'center',
    backgroundColor: colors.background, // Ensure consistent background
    marginLeft: -40,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: colors.text,
    marginLeft: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default CategoryProgressRingChart;
