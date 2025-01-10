// TaskDetailScreen.tsx
import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useToDoList } from '../context/ToDoListContext';
import PrioritySelector from '../components/task/options/PrioritySelector';
import BottomSheetPicker from '../components/shared/BottomSheetPicker';
import Deadline from '../components/task/options/Deadline'; // Import your Deadline component
import colors from '../styles/colors';
import SharedWithSelector from '../components/task/options/SharedWithSelector';
import { ScrollView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

const TaskDetailScreen = ({ route, navigation }) => {
  const { task } = route.params;
  const { toDoList, updateTask } = useToDoList();

  const [taskName, setTaskName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [reminder, setReminder] = useState(task.reminder);
  const [selectedCategory, setSelectedCategory] = useState(task.category);
  const [categoryColor, setCategoryColor] = useState(task.categoryColor);
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [deadline, setDeadline] = useState(
    task.deadline ? new Date(task.deadline) : null,
  ); // Adjusted here
  const [sharedWith, setSharedWith] = useState<string[]>(
    task.sharedWith || task.categorySharedWith || [],
  );

  const [isShared, setIsShared] = useState(task.inSharedCategory);
  const simulateNotification = (title, message) => {
    setTimeout(() => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: message,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    }, 500);
  };

  // Within TaskDetailScreen
  const handleSaveChanges = () => {
    const updatedTask = {
      ...task,
      name: taskName,
      description: description,
      priority: priority,
      deadline: deadline ? deadline : null, // Convert to ISO only if deadline exists
      reminder: reminder,
      category: selectedCategory,
      categoryColor: categoryColor,
      inSharedCategory: isShared,
      sharedWith: sharedWith, // New sharedWith list from UI
      categorySharedWith: isShared ? sharedWith : [],
    };

    // Call the updateTask function in context
    updateTask(updatedTask);

    // Clear UI state and navigate back
    setSharedWith([]); // Reset sharedWith for UI
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/*<Text style={{marginBottom: 40, fontSize: 18}}>You can now edit the task. To save changes, click on the "Save Changes" Button.</Text>*/
      /*not active, but say in video!!*/}
      <View style={[styles.inputContainer, { marginBottom: 20 }]}>
        <Text style={styles.label}>Task Name</Text>
        <TextInput
          style={styles.input}
          value={taskName}
          onChangeText={setTaskName}
        />
      </View>

      <View style={[styles.inputContainer, { height: 80, marginBottom: 40 }]}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          multiline
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Category Picker */}
      <Text style={styles.label}>Category</Text>
      <TouchableOpacity
        style={[styles.categoryPicker, { borderColor: categoryColor }]}
        onPress={() => setIsCategoryPickerVisible(true)}
      >
        <View
          style={[styles.colorCircle, { backgroundColor: categoryColor }]}
        />

        <Text style={styles.categoryText}>
          {selectedCategory ? `${selectedCategory}` : 'Select Category'}
        </Text>
      </TouchableOpacity>

      <BottomSheetPicker
        visible={isCategoryPickerVisible}
        options={toDoList.categories.map(category => ({
          label: category.name,
          value: category.name,
          color: category.color,
        }))}
        onSelect={option => {
          const selectedCategoryObject = toDoList.categories.find(
            cat => cat.name === option.value,
          );
          setSelectedCategory(option.value);
          setCategoryColor(
            selectedCategoryObject ? selectedCategoryObject.color : '#000',
          );
          setIsCategoryPickerVisible(false);
          setSelectedCategory(option.label);

          // Check if the selected category is shared
          const category = toDoList.categories.find(
            cat => cat.name === option.label,
          );
          if (category?.shared) {
            setSharedWith(category.sharedWith); // Use category sharedWith
            setIsShared(true); // If needed for UI
          } else {
            setSharedWith(sharedWith); // Reset sharedWith for non-shared categories
            setIsShared(false);
          }
        }}
        onClose={() => setIsCategoryPickerVisible(false)}
      >
        <Text style={styles.title}>Select Category</Text>
      </BottomSheetPicker>

      <PrioritySelector priority={priority} onPriorityChange={setPriority} />

      {/* Deadline Component */}
      <Deadline
        deadline={deadline || new Date()} // Ensure a date object is passed
        onDeadlineChange={date => setDeadline(date)}
        isenabled={!!deadline} // Set to true if deadline exists
      />
      {isShared ? (
        <View style={styles.sharedInfoTextBox}>
          <Text style={styles.sharedInfoText}>
            This task belongs to a shared category.
          </Text>
          <Text style={styles.sharedInfoText}>
            Shared with: {sharedWith.join(', ')}
          </Text>
        </View>
      ) : (
        <SharedWithSelector
          sharedWith={sharedWith}
          onSharedWithChange={setSharedWith}
          type="task"
        />
      )}

      {/*<Reminder reminder={reminder} onReminderChange={(value) => setReminder(value)} />*/}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  label: {
    fontSize: 17,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sharedInfoTextBox: {
    marginTop: 20,
    marginLeft: 5,
  },
  sharedInfoText: {
    fontSize: 17,
  },
  container: {
    paddingTop: 40,
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    padding: 10,
    fontSize: 17,
    color: colors.text,
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 15,
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
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    shadowColor: '#000', // iOS shadow for better depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  categoryText: {
    fontSize: 17,
    color: colors.text,
    paddingRight: 30,
    paddingVertical: 5,
  },
  saveButton: {
    backgroundColor: colors.primaryGreen,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '50%',
    alignSelf: 'center',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 60,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TaskDetailScreen;
