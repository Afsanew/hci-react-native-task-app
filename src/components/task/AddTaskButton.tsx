import React, { useState, useEffect, useRef } from 'react';
import { Option } from '../../Types';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  Modal,
  Text,
  View,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToDoList } from '../../context/ToDoListContext';
import colors from '../../styles/colors';
import BottomSheetPicker from '../shared/BottomSheetPicker';
import BottomSheetForm from '../shared/BottomSheetForm';
import Deadline from './options/Deadline';
import PrioritySelector from './options/PrioritySelector';
import SharedWithSelector from './options/SharedWithSelector';
//import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const AddTaskButton = () => {
  const { toDoList, addCategory, addTask } = useToDoList();

  const [isPickerVisible, setPickerVisible] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [isAddingCategoryInTask, setIsAddingCategoryInTask] = useState(false);

  // Task form states
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryColor, setSelectedCategoryColor] = useState('#9B9D9B');
  const [priority, setPriority] = useState(3);
  const [deadline, setDeadline] = useState<Date | null>(null);

  // Category form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#9B9D9B');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [isShared, setIsShared] = useState(false);

  const handlePressAddNew = () => {
    setPickerVisible(true);
  };

  const handleSelect = (option: Option) => {
    setPickerVisible(false);
    if (option.value === 'task') {
      setTimeout(() => {
        setIsAddingTask(true);
        setIsAddingCategory(false);
      }, 50);
    } else if (option.value === 'category') {
      setTimeout(() => {
        setIsAddingCategory(true);
        setIsAddingTask(false);
      }, 50);
    }
  };

  const handleSaveTask = () => {
    if (!taskName.trim()) {
      alert('Please provide a name for the task.');
      return;
    }

    if (!selectedCategory) {
      alert('Please select a category for the task.');
      return;
    }

    const generateId = () =>
      `task-${Date.now()}-${Math.floor(Math.random() * 100)}`;

    const category = toDoList.categories.find(
      cat => cat.name === selectedCategory,
    );

    if (!category) {
      alert('Category not found!');
      return;
    }

    const newTask = {
      id: generateId(),
      name: taskName,
      description: description,
      category: selectedCategory,
      categoryColor: category.color || '#9B9D9B',
      deadline: deadline,
      priority: priority,
      isCompleted: false,
      sharedWith: sharedWith,
      inSharedCategory: category.shared, // Set true if the category is shared
      categorySharedWith: category.shared ? category.sharedWith : [], // Copy shared users
    };

    addTask(newTask, selectedCategory);
    setSharedWith([]);
    resetForm();
  };

  const [sharedWithCategory, setSharedWithCategory] = useState<string[]>([]); // For shared categories

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      alert('Please provide a name for the category.');
      return;
    }

    if (!categoryColor) {
      alert('Please select a color for the category.');
      return;
    }

    if (toDoList.categories.some(cat => cat.name === categoryName.trim())) {
      alert('Category already exists. Please choose another name.');
      return;
    }

    const newCategory = {
      name: categoryName.trim(),
      color: categoryColor,
      tasks: [],
      completedTasks: [],
      shared: sharedWithCategory.length > 0, // Determine if the category is shared
      sharedWith: sharedWithCategory, // Include the list of shared people
    };

    addCategory(newCategory);
    setIsAddingCategory(false);

    if (isAddingCategoryInTask) {
      setCategoryName('');
      setCategoryColor('');
      setSelectedCategoryColor(categoryColor);
      setIsAddingCategoryInTask(false);
      setSelectedCategory(categoryName); // Automatically select the newly added category
      setIsAddingTask(true); // Return to the task form
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setTaskName('');
    setDescription('');
    setSelectedCategory(null);
    setSelectedCategoryColor('#9B9D9B');
    setPriority(3);
    setDeadline(null);
    setCategoryName('');
    setCategoryColor('');
    setIsAddingTask(false);
    setIsAddingCategory(false);
    setIsAddingCategoryInTask(false);

    // Reset animation values
    Animated.timing(slideAnimTask, {
      toValue: 100, // Move off-screen
      duration: 0, // Reset instantly
      useNativeDriver: true,
    }).start();
    Animated.timing(slideAnimCategory, {
      toValue: 100, // Move off-screen
      duration: 0, // Reset instantly
      useNativeDriver: true,
    }).start();
  };

  const handleTextChange = text => {
    setCategoryName(text);
    if (isAddingCategoryInTask) {
      setSelectedCategory(text);
    }
  };

  const handleCloseCategory = () => {
    if (isAddingCategoryInTask) {
      setCategoryName('');
      setCategoryColor('');
      setIsAddingCategoryInTask(false);
      setSelectedCategory(categoryName); // Automatically select the newly added category
      setIsAddingTask(true); // Return to the task form
    } else {
      setIsAddingCategory(false);
      resetForm();
    }
  };

  const handleCloseTask = () => {
    setIsAddingTask(false);
  };

  const slideAnimTask = useRef(new Animated.Value(100)).current; // Task modal
  const slideAnimCategory = useRef(new Animated.Value(100)).current; // Category modal

  // Task Modal Animation
  useEffect(() => {
    Animated.timing(slideAnimTask, {
      toValue: isAddingTask ? 0 : 100,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [isAddingTask]);

  // Category Modal Animation
  useEffect(() => {
    Animated.timing(slideAnimCategory, {
      toValue: isAddingCategory || isAddingCategoryInTask ? 0 : 100,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [isAddingCategory, isAddingCategoryInTask]);

  const handleDismissKeyboard = () => {
    setKeyboardVisible(false);
    // Start both keyboard dismiss and modal animation simultaneously
    Animated.timing(slideAnimTask, {
      toValue: 0, // Move modal back to original position
      duration: 100,
      useNativeDriver: true,
    }).start(() => Keyboard.dismiss()); // Dismiss keyboard after animation starts
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', event => {
      const keyboardHeight = event.endCoordinates.height;
      setKeyboardVisible(true);

      // Adjust for Add Task modal
      if (isAddingTask) {
        Animated.timing(slideAnimTask, {
          toValue: -100, // Adjust position for Add Task modal
          duration: 100,
          useNativeDriver: true,
        }).start();
      }

      // Adjust for Add Category modal
      if (isAddingCategory || isAddingCategoryInTask) {
        Animated.timing(slideAnimCategory, {
          toValue: -keyboardHeight + 40, // Adjust position for Add Category modal
          duration: 100,
          useNativeDriver: true,
        }).start();
      }
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);

      // Reset position for Add Task modal
      if (isAddingTask) {
        Animated.timing(slideAnimTask, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start();
      }

      // Reset position for Add Category modal
      if (isAddingCategory || isAddingCategoryInTask) {
        Animated.timing(slideAnimCategory, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [
    isAddingTask,
    isAddingCategory,
    isAddingCategoryInTask,
    slideAnimTask,
    slideAnimCategory,
  ]);

  return (
    <>
      <TouchableOpacity style={styles.addButton} onPress={handlePressAddNew}>
        <Ionicons name="add" size={45} color={colors.white} />
      </TouchableOpacity>

      {/* BottomSheetPicker to choose between adding a task or category */}
      <BottomSheetPicker
        visible={isPickerVisible}
        options={[
          { label: '... Task', value: 'task' },
          { label: '... Category', value: 'category' },
        ]}
        onSelect={handleSelect}
        onClose={() => setPickerVisible(false)}
      >
        <Text style={styles.title}>Add New ...</Text>
      </BottomSheetPicker>

      {/* NEW TASK */}
      <Modal visible={isAddingTask} transparent animationType="none">
        <TouchableWithoutFeedback
          onPress={keyboardVisible ? handleDismissKeyboard : resetForm} //todo was handleclosetask instead of resteOnly handle press when keyboard is visible
        >
          <View style={bottomstyle.overlay}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <TouchableWithoutFeedback
                onPress={keyboardVisible ? handleDismissKeyboard : undefined} // Propagate for keyboard dismissal
              >
                <Animated.View
                  style={[
                    bottomstyle.containerTask,
                    { transform: [{ translateY: slideAnimTask }] },
                  ]}
                >
                  <Text style={styles.title}>Add New Task</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholder="Task Name"
                      placeholderTextColor={colors.darkGrey}
                      style={styles.input}
                      value={taskName}
                      onChangeText={setTaskName}
                      onSubmitEditing={handleDismissKeyboard} // Close keyboard on enter
                    />
                  </View>
                  <View style={[styles.inputContainer, { height: 80 }]}>
                    <TextInput
                      placeholder="Description"
                      placeholderTextColor={colors.darkGrey}
                      style={[styles.input, styles.descriptionInput]}
                      value={description}
                      //multiline //not sure todo
                      onChangeText={setDescription}
                      onSubmitEditing={handleDismissKeyboard} // Close keyboard on enter
                    />
                  </View>

                  {/* Category Picker */}
                  <TouchableOpacity
                    style={[
                      styles.categoryPicker,
                      { borderColor: selectedCategoryColor },
                    ]}
                    onPress={() => setIsCategoryPickerVisible(true)}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: selectedCategoryColor },
                      ]}
                    />
                    <Text style={styles.categoryText}>
                      {selectedCategory
                        ? `Category: ${selectedCategory}`
                        : 'Select Category'}
                    </Text>
                  </TouchableOpacity>

                  {/* Additional Task Fields (Priority, Deadline) */}
                  <PrioritySelector
                    priority={priority}
                    onPriorityChange={setPriority}
                  />
                  <Deadline
                    deadline={deadline || new Date()}
                    onDeadlineChange={setDeadline}
                    isenabled={!!deadline}
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

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={resetForm}
                    >
                      <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveTask}
                      style={styles.saveButton}
                    >
                      <Text style={styles.saveButtonText}>Save Task</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* CHOOSE CATEGORY */}
      <BottomSheetPicker
        visible={isCategoryPickerVisible}
        options={[
          ...toDoList.categories.map(category => ({
            label: category.name,
            value: category.name,
            color: category.color,
          })),
          { label: 'Add new Category', value: 'addCategory' },
        ]}
        onSelect={option => {
          setIsCategoryPickerVisible(false);
          if (option.value === 'addCategory') {
            setTimeout(() => {
              setIsAddingCategoryInTask(true);
            }, 50);
          } else {
            setSelectedCategory(option.label);
            setSelectedCategoryColor(option.color);

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
          }
        }}
        onClose={() => setIsCategoryPickerVisible(false)}
      >
        <Text style={styles.title}>Select Category</Text>
      </BottomSheetPicker>

      {/* NEW CATEGORY */}
      <Modal
        visible={isAddingCategory || isAddingCategoryInTask}
        transparent
        animationType="none"
      >
        <TouchableWithoutFeedback
          onPress={
            keyboardVisible ? handleDismissKeyboard : handleCloseCategory
          } // Handles keyboard dismissal or overlay tap
        >
          <View style={bottomstyle.overlay}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <TouchableWithoutFeedback
                onPress={keyboardVisible ? handleDismissKeyboard : undefined} // Propagate for keyboard dismissal
              >
                <Animated.View
                  style={[
                    bottomstyle.containerCategory,
                    { transform: [{ translateY: slideAnimCategory }] },
                  ]}
                >
                  <Text style={styles.title}>Add New Category</Text>

                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholder="Category Name"
                      placeholderTextColor={colors.darkGrey}
                      style={styles.input}
                      value={categoryName}
                      onChangeText={handleTextChange}
                      onSubmitEditing={handleDismissKeyboard} // Close keyboard on enter
                    />
                  </View>

                  <Text style={styles.pickAColor}>Please pick a color</Text>

                  {/* Color Picker (Predefined Colors) */}
                  <View style={styles.colorPickerContainer}>
                    {[
                      colors.categoryRed,
                      colors.categoryOrange,
                      colors.categoryYellow,
                      colors.categoryGreen,
                      colors.categoryBlue,
                      colors.categoryPurple,
                    ].map(colorOption => (
                      <TouchableOpacity
                        key={colorOption}
                        style={[
                          styles.colorOption,
                          {
                            backgroundColor: colorOption,
                            borderWidth: categoryColor === colorOption ? 2 : 0,
                          },
                        ]}
                        onPress={() => setCategoryColor(colorOption)}
                      />
                    ))}
                  </View>

                  <SharedWithSelector
                    sharedWith={sharedWithCategory}
                    onSharedWithChange={setSharedWithCategory}
                    type="category"
                  />

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleCloseCategory}
                    >
                      <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveCategory}
                      style={styles.saveButton}
                    >
                      <Text style={styles.saveButtonText}>Save Category</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};
const bottomstyle = StyleSheet.create({
  containerCategory: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 50,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: -2 }, // iOS shadow
    shadowOpacity: 0.5, // iOS shadow
    shadowRadius: 50, // iOS shadow
  },
  containerTask: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 50,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: -2 }, // iOS shadow
    shadowOpacity: 0.5, // iOS shadow
    shadowRadius: 50, // iOS shadow
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

const styles = StyleSheet.create({
  sharedInfoTextBox: {
    marginTop: 20,
    marginLeft: 5,
  },
  sharedInfoText: {
    fontSize: 17,
  },
  addButton: {
    backgroundColor: colors.primaryGreen,
    width: 65,
    height: 65,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Android shadow
    shadowColor: colors.black, // iOS shadow
    shadowOffset: { width: 0, height: 4 }, // iOS shadow
    shadowOpacity: 0.3, // iOS shadow
    shadowRadius: 4, // iOS shadow
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  selectCategoryText: {
    fontSize: 17,
    color: colors.darkGrey,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    fontSize: 17,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderColor: colors.darkGrey,
    marginHorizontal: 5,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    // Android shadow
    elevation: 2,
    padding: 8,
  },
  pickAColor: {
    fontSize: 17,
    color: colors.text,
    marginBottom: 5,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: colors.lightGrey,
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.2, // iOS shadow
    shadowRadius: 3, // iOS shadow
  },
  closeButtonText: {
    color: colors.darkGrey,
    fontSize: 17,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: colors.primaryGreen,
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.2, // iOS shadow
    shadowRadius: 3, // iOS shadow
  },
  categoryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 15,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
    backgroundColor: colors.white,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 17,
    color: colors.text,
  },
});

export default AddTaskButton;
