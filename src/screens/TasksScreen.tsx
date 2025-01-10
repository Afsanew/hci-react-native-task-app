import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Button,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useToDoList } from '../context/ToDoListContext';
import TaskItem from '../components/task/TaskItem';
import colors from '../styles/colors';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-virtualized-view';
import { Ionicons } from '@expo/vector-icons';
import { navigate } from '../navigation/RootNavigation';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TasksScreen = () => {
  const {
    clearCompletedTasks,
    hasGenerated,
    setHasGenerated,
    categorySortOptions,
    updateCategorySortOption,
  } = useToDoList();
  const navigation = useNavigation();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const husband = 'Marc';
  const daughter = 'Emma';
  const son = 'Chris';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => setIsMenuVisible(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  const updateSortingOption = (
    categoryName: string,
    option: 'priority' | 'deadline' | 'shared',
  ) => {
    updateCategorySortOption(categoryName, option); // This will update the context

    Alert.alert(
      'Sorting Updated',
      'The sorting was applied for your tasks page! On the homepage you will see the tasks sorted by the selected order starting tomorrow!',
      [{ text: 'OK', style: 'default' }],
    );
  };

  const openSortPicker = (categoryName: string) => {
    Alert.alert(
      'Choose Sorting Option',
      null,
      [
        {
          text: 'By Priority',
          onPress: () => updateSortingOption(categoryName, 'priority'),
        },
        {
          text: 'By Deadline',
          onPress: () => updateSortingOption(categoryName, 'deadline'),
        },
        {
          text: 'By Shared With Most',
          onPress: () => updateSortingOption(categoryName, 'shared'),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const handleMenuOption = option => {
    if (
      !hasCompletedTasks() &&
      (option === 'ClearCompleted' || option === 'ShowCompleted')
    ) {
      Alert.alert(
        'No Completed Tasks',
        'There are no completed tasks to show or clear.',
      );
      return;
    }

    setIsMenuVisible(false);

    switch (option) {
      case 'ClearCompleted':
        Alert.alert(
          'Clear Completed Tasks',
          'Are you sure you want to remove all completed tasks?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear',
              style: 'destructive',
              onPress: () => clearCompletedTasks(),
            },
          ],
        );
        break;
      case 'ShowCompleted':
        console.log(showAllCompleted);
        setShowAllCompleted(prev => {
          const newState = !prev;
          setShowCompleted(prevCompleted =>
            toDoList.categories.reduce((acc, category) => {
              acc[category.name] = newState;
              return acc;
            }, {}),
          );
          return newState;
        });
        break;
      case 'EditCategories':
        navigate('ManageCategories', { name: '' });
        break;
      case 'GenerateTasks':
        if (!hasGenerated) {
          setHasGenerated(true);
          handleGenerateTestData();
        } else {
          Alert.alert(
            'Generation Rejected',
            'You can only generate sample tasks once. If you want to reset the view, you can delete all data in the settings and generate again.',
          );
        }
        break;
      // Add other cases here
    }
  };

  const { toDoList, toggleComplete, addTask, addCategory } = useToDoList();
  const [showCompleted, setShowCompleted] = useState(() =>
    toDoList.categories.reduce((acc, category) => {
      acc[category.name] = false;
      return acc;
    }, {}),
  );

  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [isSharedModalVisible, setSharedModalVisible] = useState(false);
  const [selectedCategorySharedWith, setSelectedCategorySharedWith] = useState(
    [],
  );
  const handleShowShared = sharedWith => {
    //setSelectedCategorySharedWith(sharedWith);
    //setSharedModalVisible(true);

    Alert.alert(`This category is shared with: \n ${sharedWith.join('\n ')}`);
  };

  useEffect(() => {
    setShowCompleted(prev =>
      toDoList.categories.reduce((acc, category) => {
        acc[category.name] = prev[category.name] || false; // Preserve previous state if available
        return acc;
      }, {}),
    );
  }, [toDoList]);

  const hasCategories = () => {
    return toDoList.categories.length > 0;
  };

  const hasCompletedTasks = () => {
    return toDoList.categories.some(
      category => category.completedTasks.length > 0,
    );
  };

  const toggleShowCompleted = (categoryName: string) => {
    setShowCompleted(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
    console.log(showCompleted[categoryName]);
  };

  const handleGenerateTestData = () => {
    const testCategories = [
      {
        name: 'Work',
        color: colors.categoryBlue,
        tasks: [],
        completedTasks: [],
      },
      {
        name: 'Health',
        color: colors.categoryGreen,
        tasks: [],
        completedTasks: [],
      },
      {
        name: 'Household',
        color: colors.categoryYellow,
        tasks: [],
        completedTasks: [],
      },

      {
        name: 'Holidays',
        color: colors.categoryRed,
        tasks: [],
        completedTasks: [],
      },
      {
        name: 'Hobbies',
        color: colors.categoryPurple,
        tasks: [],
        completedTasks: [],
      },
    ];

    const testTasks = [
      {
        id: '1',
        name: 'Finish project report',
        description: 'It is for a large company so better be good.',
        category: 'Work',
        categoryColor: colors.categoryBlue,
        isCompleted: false,
        priority: 5,
        deadline: new Date('2024-12-31'),
      },
      {
        id: '2',
        name: 'Reply to emails',
        description: 'Should be done fast',
        category: 'Work',
        categoryColor: colors.categoryBlue,
        isCompleted: false,
        priority: 4,
        deadline: null,
      },
      {
        id: '3',
        name: 'Grocery shopping',
        description: "Don't forget the potatoes!",
        category: 'Household',
        categoryColor: colors.categoryYellow,
        isCompleted: false,
        priority: 5,
        deadline: new Date('2024-12-05'),
        sharedWith: [husband],
      },
      {
        id: '4',
        name: 'Yoga session',
        description: 'Evening relaxation',
        category: 'Health',
        categoryColor: colors.categoryGreen,
        isCompleted: false,
        priority: 5,
        deadline: null,
        sharedWith: [daughter],
      },
      {
        id: '5',
        name: 'Read Harry Potter 2',
        description: 'page 145',
        category: 'Hobbies',
        categoryColor: colors.categoryPurple,
        isCompleted: false,
        priority: 1,
        deadline: null,
      },
      {
        id: '6',
        name: 'Change lamp',
        description: 'Living room lamp',
        category: 'Household',
        categoryColor: colors.categoryYellow,
        isCompleted: false,
        priority: 2,
        deadline: new Date(new Date().setDate(new Date().getDate() + 5)),
      },
      {
        id: '7',
        name: "Doctor's appointment",
        description: 'Annual checkup',
        category: 'Health',
        categoryColor: colors.categoryGreen,
        isCompleted: false,
        priority: 4,
        deadline: new Date('2024-11-20'),
        sharedWith: [son],
      },
      {
        id: '8',
        name: 'Meditate',
        description: 'Morning session',
        category: 'Health',
        categoryColor: colors.categoryGreen,
        isCompleted: false,
        priority: 3,
        deadline: null,
      },
      {
        id: '9',
        name: 'Weekly laundry',
        description: 'Separate colors and whites',
        category: 'Household',
        categoryColor: colors.categoryYellow,
        isCompleted: false,
        priority: 2,
        deadline: null,
        sharedWith: [daughter],
      },
      {
        id: '10',
        name: 'Client presentation prep',
        description: 'Review slides and notes',
        category: 'Work',
        categoryColor: colors.categoryBlue,
        isCompleted: false,
        priority: 5,
        deadline: new Date(new Date().setDate(new Date().getDate() + 3)),
      },
      {
        id: '11',
        name: "Finish reading 'Atomic Habits'",
        description: 'Last two chapters',
        category: 'Hobbies',
        categoryColor: colors.categoryPurple,
        isCompleted: false,
        priority: 2,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
      {
        id: '12',
        name: 'Guitar practice',
        description: 'Learn new song',
        category: 'Hobbies',
        categoryColor: colors.categoryPurple,
        isCompleted: false,
        priority: 4,
        deadline: new Date(new Date().setDate(new Date().getDate() + 4)),
      },
      {
        id: '13',
        name: 'Monthly budget review',
        description: "Analyze last month's expenses",
        category: 'Household',
        categoryColor: colors.categoryYellow,
        isCompleted: false,
        priority: 3,
        deadline: new Date('2024-12-05'),
        sharedWith: [husband],
      },
      {
        id: '14',
        name: 'Prepare monthly report',
        description: 'Include KPIs and insights',
        category: 'Work',
        categoryColor: colors.categoryBlue,
        isCompleted: false,
        priority: 5,
        deadline: new Date(new Date().setDate(new Date().getDate() + 2)),
      },
      {
        id: '15',
        name: 'Home workout',
        description: '30-min session',
        category: 'Health',
        categoryColor: colors.categoryGreen,
        isCompleted: false,
        priority: 3,
        deadline: null,
        sharedWith: [daughter],
      },
      {
        id: '16',
        name: 'Write blog post',
        description: 'Topic: Productivity tips',
        category: 'Hobbies',
        categoryColor: colors.categoryPurple,
        isCompleted: false,
        priority: 2,
        deadline: new Date('2024-11-25'),
        sharedWith: [husband, daughter, son],
      },
      {
        id: '17',
        name: 'Finalize travel itinerary',
        description: 'Review destinations and bookings',
        category: 'Household',
        categoryColor: colors.categoryYellow,
        isCompleted: false,
        priority: 4,
        deadline: new Date(new Date().setDate(new Date().getDate() + 10)),
        sharedWith: [husband, daughter, son],
      },
      {
        id: '18',
        name: 'Team meeting',
        description: 'Discuss project milestones',
        category: 'Work',
        categoryColor: colors.categoryBlue,
        isCompleted: false,
        priority: 5,
        deadline: new Date(new Date().setDate(new Date().getDate() + 1)),
      },
      {
        id: '19',
        name: 'Biking session',
        description: 'Explore new trails',
        category: 'Health',
        categoryColor: colors.categoryGreen,
        isCompleted: false,
        priority: 3,
        deadline: null,
        sharedWith: [husband, daughter, son],
      },
      {
        id: '20',
        name: 'Cook dinner',
        description: 'Plan a special menu for friends',
        category: 'Hobbies',
        categoryColor: colors.categoryPurple,
        isCompleted: false,
        priority: 4,
        deadline: new Date('2024-11-28'),
        sharedWith: [daughter],
      },
      {
        id: '21',
        name: 'Italy',
        description: 'Summer',
        category: 'Holidays',
        categoryColor: colors.categoryRed,
        isCompleted: false,
        priority: 1,
        deadline: null,
        sharedWith: [daughter, husband, son],
        inSharedCategory: true,
        categorySharedWith: [daughter, husband, son],
      },
      {
        id: '22',
        name: 'Winterholidays',
        description: 'Not planned yet',
        category: 'Holidays',
        categoryColor: colors.categoryRed,
        isCompleted: false,
        priority: 3,
        deadline: null,
        sharedWith: [daughter, husband, son],
        inSharedCategory: true,
        categorySharedWith: [daughter, husband, son],
      },
      {
        id: '23',
        name: 'Skiing',
        description: 'February with the Meiers',
        category: 'Holidays',
        categoryColor: colors.categoryRed,
        isCompleted: false,
        priority: 2,
        deadline: null,
        sharedWith: [daughter, husband, son],
        inSharedCategory: true,
        categorySharedWith: [daughter, husband, son],
      },
    ];

    testCategories.forEach(category => {
      if (category.name === 'Holidays') {
        addCategory({
          ...category,
          shared: true,
          sharedWith: [daughter, husband, son],
        });
      } else {
        addCategory({
          ...category,
          shared: false,
          sharedWith: [],
        });
      }
    });
    testTasks.forEach(task =>
      addTask(
        {
          ...task,
          inSharedCategory: false,
          categorySharedWith: [],
          sharedWith: task.sharedWith || [],
        },
        task.category,
      ),
    );
  };

  // currently priority is more deciding than deadline... // todo find a formula for exact priority
  // Function to sort tasks based on priority, deadline, and the presence of a deadline
  const getSortedTasks = (tasks, categoryName) => {
    const sortOption = categorySortOptions[categoryName] || 'priority'; // Default to priority

    if (sortOption === 'priority') {
      return tasks.sort((a, b) => b.priority - a.priority);
    }

    if (sortOption === 'deadline') {
      return tasks.sort((a, b) => {
        const aDeadline = a.deadline
          ? new Date(a.deadline).getTime()
          : Infinity;
        const bDeadline = b.deadline
          ? new Date(b.deadline).getTime()
          : Infinity;
        return aDeadline - bDeadline; // Closest deadlines first
      });
    }

    if (sortOption === 'shared') {
      return tasks.sort((a, b) => {
        const aSharedCount = a.sharedWith?.length || 0;
        const bSharedCount = b.sharedWith?.length || 0;
        return bSharedCount - aSharedCount; // Most shared tasks first
      });
    }

    return tasks;
  };

  return (
    <View style={styles.container}>
      {/* Modal for the Menu */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={menu.modalBackground}>
          <TouchableOpacity
            style={menu.dots}
            onPress={() => setIsMenuVisible(false)}
          >
            <Ionicons name="close-outline" size={24} color="black" />
          </TouchableOpacity>
          <View style={menu.menuContainer}>
            <TouchableOpacity
              style={[menu.menuItem]} // Add `menuItemLast` to the last item
              onPress={() => handleMenuOption('EditCategories')}
            >
              <Ionicons
                name="create-outline"
                size={20}
                style={menu.menuIcon}
                color="black"
              />
              <Text style={menu.menuText}>Edit Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[menu.menuItem]} // Add `menuItemLast` to the last item
              onPress={() => handleMenuOption('GenerateTasks')}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                style={menu.menuIcon}
                color="black"
              />
              <Text style={menu.menuText}>Generate Sample Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                menu.menuItem,
                !hasCompletedTasks() && menu.menuItemDisabled, // Apply disabled style
              ]}
              onPress={() => handleMenuOption('ClearCompleted')}
              //disabled={!hasCompletedTasks()} // Disable touch events
            >
              <Ionicons
                name="trash-outline"
                size={20}
                style={menu.menuIcon}
                color={!hasCompletedTasks() ? colors.darkGrey : 'black'}
              />
              <Text
                style={[
                  menu.menuText,
                  !hasCompletedTasks() && menu.menuTextDisabled, // Apply disabled text style
                ]}
              >
                Clear Completed Tasks
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                menu.menuItem,
                { borderWidth: 1, borderColor: 'white' },
                !hasCompletedTasks() && menu.menuItemDisabled, // Apply disabled style
              ]}
              onPress={() => handleMenuOption('ShowCompleted')}
              //disabled={!hasCompletedTasks()} // Disable touch events
            >
              <MaterialCommunityIcons
                name={showAllCompleted ? 'eye-off' : 'eye-check'}
                size={20}
                style={menu.menuIcon}
                color={!hasCompletedTasks() ? colors.darkGrey : 'black'}
              />
              <Text
                style={[
                  menu.menuText,
                  !hasCompletedTasks() && menu.menuTextDisabled, // Apply disabled text style
                ]}
              >
                {showAllCompleted
                  ? 'Hide All Completed Tasks'
                  : 'Show All Completed Tasks'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={isSharedModalVisible}
        onRequestClose={() => setSharedModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>This category is shared with:</Text>
          {selectedCategorySharedWith.map(person => (
            <Text key={person} style={styles.modalText}>
              {person}
            </Text>
          ))}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSharedModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {hasCategories() ? (
        <ScrollView style={{ flex: 1 }}>
          {toDoList.categories.map(category => (
            <View
              key={category.name}
              style={[
                styles.categoryContainer,
                { borderLeftColor: category.color, borderLeftWidth: 4 },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.categoryHeader,
                  {
                    backgroundColor: category.color,
                  },
                ]}
                onPress={() =>
                  navigate('ManageCategories', { name: category.name })
                }
              >
                {/* Show/Hide Completed Toggle */}
                {category.completedTasks.length > 0 && (
                  <TouchableOpacity
                    onPress={() => toggleShowCompleted(category.name)}
                    style={tog.toggleContainer}
                  >
                    <MaterialCommunityIcons
                      name={
                        showCompleted[category.name] ? 'eye-off' : 'eye-check'
                      }
                      size={25}
                      color={colors.white}
                      style={tog.toggleIcon}
                    />
                    {/*<Text style={tog.toggleButton}>
                      {showCompleted[category.name]
                        ? 'Hide Completed'
                        : 'Show Completed'} SECOND PROTOTYPE
                    </Text>*/}
                  </TouchableOpacity>
                )}
                <Text
                  style={[
                    styles.categoryName,
                    {
                      ...(category.completedTasks.length > 0
                        ? { paddingLeft: 0 }
                        : { paddingLeft: 11 }),
                    },
                  ]}
                >
                  {category.name}
                </Text>

                {/* Shared Category Icon */}
                {category.shared && (
                  <TouchableOpacity
                    onPress={() => handleShowShared(category.sharedWith)}
                  >
                    {/*<Image
                      source={require('../../assets/team.png')}
                      style={{ width: 30, height: 25, marginRight: 10 }}
                    />*/}
                    <View
                      style={{
                        height: '100%',
                        padding: 10,
                        paddingRight: 7,
                        // ios shadow
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        // android shadow
                        elevation: 3,
                      }}
                    >
                      <Icon
                        name="user-friends"
                        size={20}
                        color={colors.white}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => openSortPicker(category.name)}>
                  <View
                    style={{
                      height: '100%',
                      padding: 10,
                      paddingLeft: 8,
                      // ios shadow
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      // android shadow
                      elevation: 3,
                    }}
                  >
                    <Icon
                      name="sort-amount-down"
                      size={20}
                      color={colors.white}
                    />
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Active Tasks */}
              <FlatList
                data={getSortedTasks(category.tasks, category.name)}
                renderItem={({ item }) => (
                  <TaskItem
                    task={item}
                    category={category}
                    toggleComplete={() => toggleComplete(item, category)}
                  />
                )}
                keyExtractor={item => item.id}
              />

              {/* Completed Tasks */}
              {showCompleted[category.name] && (
                <FlatList
                  data={getSortedTasks(category.completedTasks, category.name)}
                  renderItem={({ item }) => (
                    <TaskItem
                      task={item}
                      category={category}
                      toggleComplete={() => toggleComplete(item, category)}
                    />
                  )}
                  keyExtractor={item => item.id}
                />
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={no_tasks_styles.container}>
          {/* Image or Icon */}
          <Image
            source={{
              uri: 'https://img.icons8.com/ios-filled/100/000000/checklist.png',
            }} // Replace with a suitable icon
            style={no_tasks_styles.image}
          />

          {/* Message */}
          <Text style={no_tasks_styles.title}>No tasks available</Text>
          <Text style={no_tasks_styles.subtitle}>
            Let's fill it up! Add a new task to get started. Or generate some
            sample tasks from the menu
          </Text>

          {/* Button included in menu already
          <TouchableOpacity
            style={no_tasks_styles.button}
            onPress={handleGenerateTestData}
          >
            <Text style={no_tasks_styles.buttonText}>
              Generate Sample Tasks
            </Text>
          </TouchableOpacity>*/}
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f4f4f4',
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 20,
    borderRadius: 14,
    //    overflow: 'hidden',
    /*elevation: 3, // Android shadow

    // iOS shadow
    shadowColor: '#000', // Black shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset the shadow
    shadowOpacity: 0.2, // Shadow transparency
    shadowRadius: 4, // Blur radius*/
  },
  categoryHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 10,
  },
  generateButton: {
    marginTop: 15,
    marginBottom: 40,
    backgroundColor: colors.primaryGreen, // Bright green for attention
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3, // Android shadow

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 30,
    color: colors.white,
  },
  modalText: {
    fontSize: 25,
    marginVertical: 5,
    color: colors.white,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 25,
  },
});

const no_tasks_styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.darkGrey,
    textAlign: 'center',
    marginVertical: 4,
    marginHorizontal: 5,
  },
  button: {
    marginTop: 30,
    backgroundColor: colors.primaryGreen, // Bright green for attention
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3, // Android shadow

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});

const tog = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  toggleButton: {
    fontSize: 17,
    color: colors.text, // Replace with your desired text color
    marginRight: 8, // Adds space between text and icon
    textDecorationLine: 'underline',
  },
  toggleIcon: {
    paddingLeft: 2,
    paddingRight: 9,
    // ios shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // android shadow
    elevation: 3,
  },
});

const menu = StyleSheet.create({
  dots: {
    marginLeft: 340,
    marginTop: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 1,
    borderTopEndRadius: 15,
    borderTopLeftRadius: 15,
  },
  modalBackground: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.white,
    padding: 15,
    elevation: 5, // Android shadow
    marginBottom: 478,
    borderEndStartRadius: 30,
    borderTopLeftRadius: 30,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  menuItemLast: {
    borderBottomWidth: 0, // Remove bottom border for the last item
  },
  menuItemDisabled: {
    backgroundColor: colors.lightGray, // Background for disabled state
  },
  menuIcon: {
    marginRight: 15, // Space between icon and text
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  menuTextDisabled: {
    color: colors.darkGrey, // Text color for disabled state
  },
});

export default TasksScreen;
