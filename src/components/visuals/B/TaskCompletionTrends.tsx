import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useToDoList } from '../../../context/ToDoListContext';
import colors from '../../../styles/colors';

const screenWidth = Dimensions.get('window').width;

const TaskCompletionTrends = () => {
  const { dailyTaskCompletions, currentDate } = useToDoList();
  const [view, setView] = useState('weekly'); // Toggle between 'weekly' and 'monthly'

  // Generate data for the selected view
  const getDataForView = () => {
    const data = [];
    let labels = [];

    if (view === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        const isToday =
          dateString === new Date(currentDate).toISOString().split('T')[0];
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

        data.push(dailyTaskCompletions[dateString] || 0);
      }
    } else {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        if (date.toLocaleDateString('en-US', { weekday: 'short' }) === 'Mon') {
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        } else {
          labels.push('');
        }

        data.push(dailyTaskCompletions[dateString] || 0);
      }
    }

    return { labels, data };
  };

  function hexToRgba(hex, opacity = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  const chartData = getDataForView();

  return (
    <View style={styles.container}>
      {/* Toggle View */}
      <Text style={styles.chartTitle}>Completed Tasks per Day</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            view === 'weekly' && styles.activeButton,
          ]}
          onPress={() => setView('weekly')}
        >
          <Text
            style={view === 'weekly' ? styles.activeText : styles.inactiveText}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            view === 'monthly' && styles.activeButton,
          ]}
          onPress={() => setView('monthly')}
        >
          <Text
            style={view === 'monthly' ? styles.activeText : styles.inactiveText}
          >
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bezier Line Chart */}
      <LineChart
        data={{
          labels: chartData.labels,
          datasets: [{ data: chartData.data }],
        }}
        width={screenWidth - 40} // Full-width chart
        height={220}
        yAxisSuffix=" tasks"
        chartConfig={{
          backgroundGradientFrom: colors.white,
          backgroundGradientTo: colors.white,
          color: (opacity = 1) =>
            `rgba( ${hexToRgba(colors.primaryGreen, opacity)})`, // Line color
          labelColor: (opacity = 1) =>
            `rgba( ${hexToRgba(colors.text, opacity)})`,
          propsForDots: {
            r: '4', // Dot radius
            strokeWidth: '2',
            stroke: colors.primaryGreen,
          },
          propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: '#cccccc', // Light gray background grid lines
          },
          fillShadowGradient: colors.primaryGreen, // Start color for shading under the line
          fillShadowGradientFromOpacity: 0.3, // Opacity for the shading
          fillShadowGradientToOpacity: 0, // Opacity for the shading
          decimalPlaces: 0,
          style: {
            borderRadius: 10,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingTop: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: colors.lightGrey,
    // ios shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // android shadow
    elevation: 3,
  },
  activeButton: {
    backgroundColor: colors.primaryGreen,
  },
  activeText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  inactiveText: {
    color: colors.darkGrey,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
});

export default TaskCompletionTrends;
