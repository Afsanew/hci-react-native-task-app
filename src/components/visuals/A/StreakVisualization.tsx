import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useStreak } from '../../../context/StreakContext';
import colors from '../../../styles/colors';

const StreakVisualization = () => {
  const { currentStreak, highScore, enableStreak } = useStreak();

  return (
    <View style={styles.container}>
      {/* Current Streak Section */}
      <View style={styles.streakBox}>
        <Text style={styles.label}>Current Streak</Text>
        <Text style={styles.value}>
          {currentStreak} {currentStreak == 1 ? 'day' : 'days'}
        </Text>
      </View>

      {/* Flame Icon */}
      <Image
        source={require('../../../../assets/flame-icon.png')} // Replace with your flame icon path
        style={styles.flameIcon}
      />

      {/* High Score Section */}
      <View style={styles.streakBox}>
        <Text style={styles.label}>High Score</Text>
        <Text style={styles.value}>
          {highScore} {highScore == 1 ? 'day' : 'days'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGreen,
    padding: 20,
    marginBottom: 0,
  },
  streakBox: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 17,
    color: colors.darkGrey,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 20,
    color: colors.darkGreen,
    fontWeight: 'bold',
  },
  flameIcon: {
    width: 50,
    height: 50,
    marginHorizontal: 20,
  },
});

export default StreakVisualization;
