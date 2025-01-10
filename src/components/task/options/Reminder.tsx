import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

import BottomSheetPicker from '../../shared/BottomSheetPicker';
import colors from '../../../styles/colors';

interface ReminderProps {
  reminder: string;
  onReminderChange: (value: string, customTime?: Date) => void;
  disabled?: boolean;
}

const Reminder: React.FC<ReminderProps> = ({
  reminder,
  onReminderChange,
  disabled = false,
}) => {
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [customTime, setCustomTime] = useState(new Date());
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const reminderOptions: { label: string; value: 'task' | 'category' }[] = [
    { label: 'Task', value: 'task' },
    { label: 'Category', value: 'category' },
  ];

  const handleReminderSelect = (value: string) => {
    setIsPickerVisible(false);
    if (value === 'custom') {
      onReminderChange('custom', customTime);
    } else {
      onReminderChange(value);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setCustomTime(selectedTime);
      onReminderChange('custom', selectedTime);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Icon name="alarm-outline" size={20} style={styles.icon} />
      <View style={styles.reminderContent}>
        {disabled ? (
          <Text style={styles.label}>-</Text>
        ) : (
          <>
            <TouchableOpacity onPress={() => setIsPickerVisible(true)}>
              <Text style={styles.reminderButtonText}>
                {reminderOptions.find(opt => opt.value === reminder)?.label ||
                  'Set Reminder'}
              </Text>
            </TouchableOpacity>
            <Switch
              value={isReminderEnabled}
              onValueChange={value => {
                setIsReminderEnabled(value);
                if (!value) onReminderChange('');
              }}
              style={styles.switch}
              trackColor={{
                false: colors.lightGrey,
                true: colors.primaryGreen,
              }}
              thumbColor={
                isReminderEnabled ? colors.darkGreen : colors.darkGrey
              }
            />
          </>
        )}
      </View>

      {/* BottomSheetPicker for Reminder Options */}
      <BottomSheetPicker
        visible={isPickerVisible}
        options={reminderOptions.map(option => ({
          label: option.label,
          value: option.value,
        }))}
        onSelect={handleReminderSelect}
        onClose={() => setIsPickerVisible(false)}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
  },
  icon: {
    marginRight: 10,
    color: colors.darkGrey,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Android shadow
    elevation: 1,
  },
  reminderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    color: colors.darkGrey,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android shadow
    elevation: 1,
  },
  switch: {
    marginLeft: 10,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android shadow
    elevation: 1,
  },
  reminderButtonText: {
    color: colors.text,
    fontSize: 15,
    textDecorationLine: 'underline',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android shadow
    elevation: 1,
  },
});
export default Reminder;
