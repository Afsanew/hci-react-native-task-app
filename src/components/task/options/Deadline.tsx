import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../../../styles/colors';

interface DeadlineProps {
  deadline: Date | null;
  onDeadlineChange: (date: Date | null) => void;
  isenabled: boolean;
}

const Deadline: React.FC<DeadlineProps> = ({
  deadline,
  onDeadlineChange,
  isenabled,
}) => {
  const [isDeadlineEnabled, setDeadlineEnabled] = useState(isenabled);

  useEffect(() => {
    if (!isDeadlineEnabled) {
      // Clear deadline when the switch is disabled
      onDeadlineChange(null);
    }
  }, [isDeadlineEnabled]);

  // Function to enable deadline and set it to the current date if no deadline is set
  const handleEnableDeadline = () => {
    if (!isDeadlineEnabled) {
      const currentDate = new Date();
      onDeadlineChange(currentDate); // Set to current date when enabling
    }
    setDeadlineEnabled(true);
  };

  return (
    <View style={styles.inputContainer}>
      <Icon name="calendar-outline" size={25} style={styles.icon} />

      {!isDeadlineEnabled ? (
        <>
          <TouchableOpacity
            onPress={handleEnableDeadline}
            style={styles.labelContainer}
          >
            <Text style={[styles.label, { color: colors.text }]}>
              Set Deadline
            </Text>
          </TouchableOpacity>
          <Switch
            value={isDeadlineEnabled}
            onValueChange={value => {
              if (value) handleEnableDeadline();
              else setDeadlineEnabled(false);
            }}
            style={styles.switch}
            trackColor={{ false: colors.lightGrey, true: colors.primaryGreen }}
            thumbColor={isDeadlineEnabled ? colors.darkGreen : colors.darkGrey}
          />
        </>
      ) : (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={deadline || new Date()} // Use current date if deadline is null
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              if (selectedDate) onDeadlineChange(selectedDate);
            }}
            style={styles.dateTimePicker}
          />
          <Switch
            value={isDeadlineEnabled}
            onValueChange={() => setDeadlineEnabled(false)}
            style={styles.switch}
            trackColor={{ false: colors.lightGrey, true: colors.primaryGreen }}
            thumbColor={isDeadlineEnabled ? colors.darkGreen : colors.darkGrey}
          />
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  icon: {
    marginRight: 10,
    color: colors.darkGrey,
  },
  label: {
    fontSize: 17,
    color: colors.darkGrey,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  switch: {
    marginLeft: 10,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    // Android shadow
    elevation: 2,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  dateTimePicker: {
    marginLeft: -10,
  },
});

export default Deadline;
