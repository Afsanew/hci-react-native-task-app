import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons';
import { getPriorityColor } from '../../../utils/priorityUtils';
import colors from '../../../styles/colors';

interface PrioritySelectorProps {
  priority: number;
  onPriorityChange: (value: number) => void;
  disabled?: boolean;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  priority,
  onPriorityChange,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Icon
          name="flag"
          size={25}
          color={getPriorityColor(priority)}
          style={styles.flagIcon}
        />
        <Text
          style={[styles.priorityValue, { color: getPriorityColor(priority) }]}
        >
          {priority}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={5}
        step={1}
        value={priority}
        onValueChange={disabled ? undefined : onPriorityChange}
        minimumTrackTintColor={getPriorityColor(priority)}
        maximumTrackTintColor={colors.lightGrey}
        thumbTintColor={disabled ? 'transparent' : getPriorityColor(priority)} // Hide thumb when disabled
        disabled={disabled}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginBottom: 5,
  },
  flagIcon: {
    marginRight: 15,
  },
  priorityValue: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  slider: {
    width: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});

export default PrioritySelector;
