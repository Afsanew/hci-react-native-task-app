import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import colors from '../styles/colors';
import { useToDoList } from '../context/ToDoListContext';

interface DailyHistoryLineChartProps {
  dailyHistory: { date: Date; tasksCompleted: number }[];
}

const DailyHistoryLineChart: React.FC<DailyHistoryLineChartProps> = ({
  dailyHistory,
}) => {
  const deleted = useToDoList().deleted;
  const [data, setData] = React.useState(
    dailyHistory.map(entry => entry.tasksCompleted),
  );
  const [labels, setLabels] = React.useState(
    dailyHistory.map(entry =>
      new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
      }).format(entry.date),
    ),
  );

  function hexToRgba(hex, opacity = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /*useEffect(() => {
    if (deleted) {
      console.log('deleted');
      setData([]);
      setLabels([]);
    }
  }, [deleted]);*/

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.scrollContainer}
      showsHorizontalScrollIndicator={true}
    >
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Task Completion</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: data }],
          }}
          width={Math.max(labels.length * 60, 300)} // Dynamically adjust width
          height={250}
          chartConfig={{
            backgroundGradientFrom: '#f4f4f4',
            backgroundGradientTo: '#f4f4f4',
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
            decimalPlaces: 1, // Ensure whole numbers
            style: {
              borderRadius: 10,
            },
          }}
          bezier // Enables the smooth curve
          withDots={true}
          withShadow={true} // Add shadow under the line
          withInnerLines={true} // Show inner grid lines
          withOuterLines={true}
          fromZero // Start the chart at 0
          segments={10} // Divide the y-axis into 10 segments
          yAxisSuffix=" tasks" // Add suffix to y-axis labels
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
  },
  chartContainer: {
    width: '100%',
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
});

export default DailyHistoryLineChart;
