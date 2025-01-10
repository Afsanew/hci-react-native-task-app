import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { useToDoList } from '../context/ToDoListContext';
import { useSettings } from '../context/SettingsContext';
import TaskItem from '../components/task/TaskItem';
import colors from '../styles/colors';
//import ProgressBar from 'react-native-progress/Bar';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStreak } from '../context/StreakContext';
import CongratulationsModal from './CongratulationsModal';
import StreakVisualization from '../components/visuals/A/StreakVisualization';
import { Category } from '../Types';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { navigate } from '../navigation/RootNavigation';

const HomepageScreen = () => {
  const navigation = useNavigation();
  const { settings } = useSettings();
  const {
    enableStreak,
    completedTasks,
    currentStreak,
    streakGoal,
    incrementCompletedTasks,
    resetStreakForNewDay,
    resetStreak,
    resetCompletedTasks,
  } = useStreak();
  const {
    toDoList,
    getLimitedTasksPerCategory,
    toggleComplete,
    resetTasksForNewDay,
    isEmpty,
    isFirstTime,
    setIsFirstTime,
    saveDailyHistory,
    deleted,
    triggers,
  } = useToDoList();

  const [displayedCategories, setdisplayedCategories] = useState<Category[]>(
    [],
  );
  const [showVideo, setShowVideo] = useState(false);
  const [isNoTasksModalVisible, setIsNoTasksModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [isStreaksModalVisible, setIsStreaksModalVisible] = useState(false); // Streaks Modal Logic

  useEffect(() => {
    // Initialize displayed tasks when the component mounts or new day starts
    const limitedTasks = getLimitedTasksPerCategory(settings);
    setdisplayedCategories(limitedTasks);
  }, []);

  // WHEN CATEGORY DELETED
  useEffect(() => {
    if (!deleted) {
      const existingCategories = toDoList.categories.map(cat => cat.name);
      const filteredCategories = displayedCategories.filter(category =>
        existingCategories.includes(category.name),
      );
      setdisplayedCategories(filteredCategories);
    }
  }, [toDoList, triggers, deleted]);

  // UPDATE ON DELETE
  useEffect(() => {
    if (!deleted) {
      const openIDs = toDoList.categories.flatMap(category =>
        category.tasks.map(task => task.id),
      );

      const closedIDs = toDoList.categories.flatMap(category =>
        category.completedTasks.map(task => task.id),
      );

      setTimeout(() => {
        // Find a category where a task needs to be reloaded
        const categoryToReload = displayedCategories.find(category =>
          category.tasks.some(
            task => !openIDs.includes(task.id) && !closedIDs.includes(task.id),
          ),
        );

        if (categoryToReload) {
          // Find the corresponding category in the main toDoList
          const categoryFromToDoList = toDoList.categories.find(
            category => category.name === categoryToReload.name,
          );

          if (categoryFromToDoList) {
            // Reload a new task into the same category
            const reloadedTask = categoryFromToDoList.tasks
              .filter(task => !task.isCompleted) // Only unfinished tasks
              .slice(0, 1)
              .pop(); // Get the first unfinished task

            if (reloadedTask) {
              // Add the reloaded task to the displayed category
              const updatedCategories = displayedCategories.map(category =>
                category.name === categoryToReload.name
                  ? {
                      ...category,
                      tasks: [...category.tasks, reloadedTask],
                    }
                  : category,
              );

              setdisplayedCategories(updatedCategories);
            }
          }
        }
      }, 100);
    }
  }, [toDoList, triggers, deleted]);

  useEffect(() => {
    if (!deleted) {
      // Get all completed task IDs
      const openIDs = toDoList.categories.flatMap(category =>
        category.tasks.map(task => task.id),
      );

      const closedIDs = toDoList.categories.flatMap(category =>
        category.completedTasks.map(task => task.id),
      );

      setTimeout(() => {
        // Check if any displayed task exists in the completed list
        const tasksToRemoveExist = displayedCategories.some(category =>
          category.tasks.some(
            task => !openIDs.includes(task.id) && !closedIDs.includes(task.id),
          ),
        );

        if (tasksToRemoveExist) {
          const catToReload = displayedCategories.find(category =>
            category.tasks.some(
              task => task =>
                !openIDs.includes(task.id) && !closedIDs.includes(task.id),
            ),
          );

          const categoryTO_RELOAD_FROM = toDoList.categories.find(
            category => category.name == catToReload.name,
          );

          if (categoryTO_RELOAD_FROM) {
            displayedCategories.map(category => {
              if (category.name == catToReload.name) {
                const RELOADEDTASK = categoryTO_RELOAD_FROM?.tasks
                  .filter(task => !task.isCompleted)
                  .slice(0, 1)
                  .pop();
                return category.tasks.push(RELOADEDTASK);
              } else {
                return category;
              }
            });

            const newCats = displayedCategories.map(category => ({
              ...category,
              tasks: category.tasks.filter(task => openIDs.includes(task.id)), // Remove completed tasks
            }));

            // Remove completed tasks from the displayed categories
            setdisplayedCategories(newCats.filter(cat => cat.tasks.length > 0));
          }
        }
      }, 100);
    }
  }, [toDoList]);

  //UPDATE IF SMTH COMPLETED IN TASKSSCREEN
  useEffect(() => {
    // Get all completed task IDs
    const completedIDs = toDoList.categories.flatMap(category =>
      category.completedTasks.map(task => task.id),
    );

    setTimeout(() => {
      // Check if any displayed task exists in the completed list
      const tasksToRemoveExist = displayedCategories.some(category =>
        category.tasks.some(task => completedIDs.includes(task.id)),
      );

      if (tasksToRemoveExist) {
        // Increment completed tasks count for tasks being removed
        displayedCategories.forEach(category =>
          category.tasks.forEach(task => {
            if (completedIDs.includes(task.id)) {
              incrementCompletedTasks();
            }
          }),
        );

        const newCats = displayedCategories.map(category => ({
          ...category,
          tasks: category.tasks.filter(task => !completedIDs.includes(task.id)), // Remove completed tasks
        }));

        // Remove completed tasks from the displayed categories
        setdisplayedCategories(newCats.filter(cat => cat.tasks.length > 0));
      }
    }, 100);
  }, [toDoList, triggers]);

  useEffect(() => {
    // Extract updated task data from `toDoList`
    const updatedTasks = toDoList.categories.flatMap(category =>
      category.tasks.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        category: category.name, // Ensure the correct category name is reflected
        categoryColor: category.color, // Reflect category color
        deadline: task.deadline ? new Date(task.deadline) : null, // Ensure Date object or null
        priority: task.priority,
        sharedWith: task.sharedWith,
        inSharedCategory: category.shared, // Reflect if the category is shared
        categorySharedWith: category.sharedWith, // Reflect sharedWith from the category
      })),
    );

    // Check if any attributes of the displayed tasks differ from the updated tasks
    const tasksToUpdateExist = displayedCategories.some(category =>
      category.tasks.some(task => {
        const updatedTask = updatedTasks.find(t => t.id === task.id);
        return (
          updatedTask &&
          (updatedTask.name !== task.name ||
            updatedTask.description !== task.description ||
            updatedTask.category !== task.category ||
            updatedTask.categoryColor !== task.categoryColor ||
            (updatedTask.deadline && task.deadline
              ? updatedTask.deadline.getTime() !==
                new Date(task.deadline).getTime() // Compare timestamps for deadlines
              : updatedTask.deadline !== task.deadline) || // Handle null comparison
            updatedTask.priority !== task.priority ||
            updatedTask.sharedWith.join(',') !== task.sharedWith.join(',') || // Compare arrays as strings
            updatedTask.inSharedCategory !== task.inSharedCategory ||
            updatedTask.categorySharedWith.join(',') !==
              task.categorySharedWith.join(',')) // Compare sharedWith arrays
        );
      }),
    );

    if (tasksToUpdateExist) {
      // Update displayedCategories with the latest task attributes
      const updatedCategories = displayedCategories.map(category => {
        const updatedTasksInCategory = category.tasks.map(task => {
          const updatedTask = updatedTasks.find(t => t.id === task.id);
          if (updatedTask) {
            return {
              ...task,
              name: updatedTask.name,
              description: updatedTask.description,
              category: updatedTask.category,
              categoryColor: updatedTask.categoryColor,
              deadline: updatedTask.deadline,
              priority: updatedTask.priority,
              sharedWith: updatedTask.sharedWith,
              inSharedCategory: updatedTask.inSharedCategory,
              categorySharedWith: updatedTask.categorySharedWith,
            };
          }
          return task;
        });

        return { ...category, tasks: updatedTasksInCategory };
      });

      setdisplayedCategories(updatedCategories); // Update the displayed state
    }
  }, [toDoList]);

  useEffect(() => {
    if (enableStreak && currentStreak >= streakGoal) {
      setIsStreaksModalVisible(true); // Show streaks modal when goal is achieved
    }
  }, [currentStreak, streakGoal]);

  useEffect(() => {
    // Update displayed tasks and total tasks count only when settings change
    const updateTasksOnSettingsChange = () => {
      const limitedTasks = getLimitedTasksPerCategory(settings);
      if (JSON.stringify(displayedCategories) != JSON.stringify(limitedTasks)) {
        setdisplayedCategories(limitedTasks);
      }

      const totalTasks = Math.min(
        limitedTasks.reduce((total, { tasks }) => total + tasks.length, 0),
        settings.dailyTaskLimit,
      );
      if (totalTasksCount != totalTasks) {
        setTotalTasksCount(totalTasks);
      }
    };

    updateTasksOnSettingsChange();
  }, [settings.dailyTaskLimit, settings.categoryLimits]);

  // IMPORTANT NOTE: IF THE SETTINGS CHANGE, IT IS NOT DIRECTLY APPLIED, THE USER HAS TO "LOAD A NEW DAY FIRST"
  const confirmNewDayReset = () => {
    if (completedTasks >= totalTasksCount) {
      handleNewDay();
    } else {
      Alert.alert(
        'Reset for a New Day',
        'Resetting for a new day will reset your current streak progress since you are not done with your tasks of the day. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: () => handleNewDay(),
          },
        ],
      );
    }
  };

  const resetStreakAndTask = () => {
    resetCompletedTasks();
    //resetStreak();
  };

  const handleNewDay = () => {
    if (isEmpty) {
      setIsNoTasksModalVisible(true);
    } else {
      // Existing logic
      const categoriesWithTasks = toDoList.categories.filter(
        cat => cat.tasks && cat.tasks.length > 0,
      );
      const hasValidTaskLimits = categoriesWithTasks.some(
        cat => settings.categoryLimits[cat.name] > 0,
      );

      if (!hasValidTaskLimits) {
        setIsSettingsModalVisible(true);
      } else {
        if (enableStreak) {
          resetStreakForNewDay(totalTasksCount);
        }

        resetTasksForNewDay(settings);
        const limitedTasks = getLimitedTasksPerCategory(settings);
        setdisplayedCategories(limitedTasks);

        const totalTasks = Math.min(
          limitedTasks.reduce((total, { tasks }) => total + tasks.length, 0),
          settings.dailyTaskLimit,
        );
        setTotalTasksCount(totalTasks);
        resetCompletedTasks();
        saveDailyHistory(Math.min(1, completedTasks / totalTasks));
      }
    }
  };

  const handleTaskCompleteToggle = (tog_task, tog_cat) => {
    toggleComplete(tog_task, tog_cat, 'home');

    //incrementCompletedTasks(); // Update streak progress
  };

  const isAllTasksCompleted = displayedCategories.every(
    category => category.tasks.length === 0,
  );

  const handlePlaybackStatusUpdate = status => {
    if (status.didJustFinish) {
      setIsVideoFinished(true);
    }
  };

  if (showVideo && !isVideoFinished) {
    return (
      <Modal
        visible={showVideo}
        animationType="none"
        transparent={false}
        onRequestClose={() => setShowVideo(false)}
      >
        <View style={styles.videoContainer}>
          <Video
            source={require('../../assets/example_video.mov')}
            style={styles.fullScreenVideo}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        </View>
      </Modal>
    );
  }

  {
    /*if (showVideo && isVideoFinished) {
    return (
      <View style={styles.promptContainer}>
        <Text style={styles.promptTitle}>Ready to go?</Text>
        <Text style={styles.promptText}>
          If you're ready, you can start using the app. If you'd like to
          rewatch, tap below.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setIsVideoFinished(false);
              setShowVideo(true);
            }}
          >
            <Text style={styles.buttonText}>Rewatch Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setShowVideo(false);
              setIsFirstTime(false);
            }}
          >
            <Text style={styles.buttonText}>Start Using the App</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }*/
  }
  const handleShowShared = sharedWith => {
    //setSelectedCategorySharedWith(sharedWith);
    //setSharedModalVisible(true);

    Alert.alert(`This category is shared with: \n ${sharedWith.join('\n ')}`);
  };

  return (
    <>
      {/* Streaks Modal */}
      <CongratulationsModal
        visible={isStreaksModalVisible}
        onClose={() => setIsStreaksModalVisible(false)}
        goal={streakGoal}
        resetStreak={resetStreakAndTask}
      />

      <View style={streakstyle.streakContainer}>
        {enableStreak && <StreakVisualization />}

        <View style={streakstyle.progressContainer}>
          <Text style={streakstyle.progressLabel}>Today</Text>
          <View style={streakstyle.progressBarWrapper}>
            <View style={streakstyle.progressBar}>
              <View
                style={[
                  streakstyle.progressFill,
                  {
                    width: `${
                      totalTasksCount > 0
                        ? (completedTasks / totalTasksCount) * 100
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={streakstyle.progressValue}>
            {completedTasks} / {totalTasksCount} tasks
          </Text>
        </View>

        <View>
          {
            <View style={styles.progressContainer}>
              <TouchableOpacity
                style={withtasks_newday.button}
                onPress={confirmNewDayReset}
              >
                <Text style={withtasks_newday.buttonText}>
                  Reset for a New Day
                </Text>
              </TouchableOpacity>
            </View>
          }
        </View>
      </View>

      <View style={styles.container}>
        {/* Modal for No Tasks */}

        <Modal
          transparent={true}
          animationType="fade"
          visible={isNoTasksModalVisible}
          onRequestClose={() => setIsNoTasksModalVisible(false)}
        >
          <View style={modal_style.modalBackground}>
            <View style={modal_style.modalContainer}>
              <Image
                source={{
                  uri: 'https://img.icons8.com/fluency/96/000000/task.png',
                }}
                style={modal_style.modalIcon}
              />
              <Text style={modal_style.modalTitle}>No Tasks Found</Text>
              <Text style={modal_style.modalMessage}>
                It seems like you don't have any tasks. Go to the Taskspage to
                add new Tasks!
              </Text>
              <View style={modal_style.modalButtons}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setIsNoTasksModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    setIsNoTasksModalVisible(false);
                    navigation.navigate('All Tasks');
                  }}
                >
                  <Text style={styles.buttonText}>Open Taskpage</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal for Checking Settings */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={isSettingsModalVisible}
          onRequestClose={() => setIsSettingsModalVisible(false)}
        >
          <View style={modal_style.modalBackground}>
            <View style={modal_style.modalContainer}>
              <Image
                source={{
                  uri: 'https://img.icons8.com/ios/100/000000/settings.png',
                }}
                style={modal_style.modalIcon}
              />
              <Text style={modal_style.modalTitle}>Check Settings</Text>
              <Text style={modal_style.modalMessage}>
                It looks like you have categories set up but the limits might
                need to be adjusted.
              </Text>
              <View style={modal_style.modalButtons}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setIsSettingsModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    setIsSettingsModalVisible(false);
                    navigation.navigate('Settings');
                  }}
                >
                  <Text style={styles.buttonText}>Go to Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          {isAllTasksCompleted ? (
            <View style={styles_all_tasks_complete.container}>
              <Image
                source={{
                  uri: 'https://img.icons8.com/fluency/96/000000/confetti.png',
                }}
                style={styles_all_tasks_complete.image}
              />
              <Text style={styles_all_tasks_complete.title}>
                All tasks are complete!
              </Text>
              <Text style={styles_all_tasks_complete.subtitle}>
                Great job! Take a break or prepare for tomorrow.
              </Text>
              <TouchableOpacity
                style={styles_all_tasks_complete.button}
                onPress={() => confirmNewDayReset()}
              >
                <Text style={styles_all_tasks_complete.buttonText}>
                  Reset for a New Day
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.scrollableContainer}>
              {displayedCategories.map(category => (
                <View
                  key={category.name}
                  style={[
                    styles.categoryContainer,
                    { borderLeftColor: category.color, borderLeftWidth: 4 },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryHeader,
                      { backgroundColor: category.color },
                    ]}
                  >
                    {/* Shared Category Icon */}
                    {/*{category.shared && (
                      <TouchableOpacity
                        onPress={() => handleShowShared(category.sharedWith)}
                      >
                        <Image
                          source={require('../../assets/team.png')}
                          style={{ width: 30, height: 25, marginRight: 10 }}
                        />
                      </TouchableOpacity>
                    )}*/}
                    <Text style={styles.categoryName}>{category.name}</Text>
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
                            paddingRight: 35,
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
                  </View>
                  <FlatList
                    data={category.tasks}
                    renderItem={({ item }) => (
                      <TaskItem
                        task={item}
                        category={category}
                        toggleComplete={() =>
                          handleTaskCompleteToggle(item, category)
                        }
                      />
                    )}
                    keyExtractor={item => item.id}
                    scrollEnabled={true}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const withtasks_newday = StyleSheet.create({
  button: {
    backgroundColor: colors.lightGrey,
    paddingVertical: 5,
    width: '50%',
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 10,
    marginBottom: 10,
  },
  contentContainer: {
    paddingHorizontal: 10, // Add padding only to the content if needed
    paddingBottom: 10,
    flexGrow: 1,
  },
  scrollableContainer: {
    flexGrow: 1,
  },
  icon_text: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 30,
    backgroundColor: colors.primaryGreen,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  smallicon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.grey,
    marginTop: 5,
  },
  newDayButtonContainer: {
    marginBottom: 15,
    alignSelf: 'center',
  },
  categoryContainer: {
    marginBottom: 20,
    borderRadius: 14,
  },
  categoryHeader: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: colors.background,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.darkGreen,
    marginBottom: 10,
    textAlign: 'center',
  },
  promptText: {
    fontSize: 16,
    color: colors.darkGrey,
    textAlign: 'center',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.lightGrey,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
  },
  fullScreenVideo: {
    flex: 1,
  },
});

const styles_empty_home = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  },
  button: {
    marginTop: 30,
    backgroundColor: colors.primaryGreen,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

const styles_all_tasks_complete = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primaryGreen,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.darkGrey,
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.primaryGreen,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

const modal_style = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 5,
  },
  modalIcon: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryGreen,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: colors.darkGrey,
    textAlign: 'center',
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.lightGrey,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const streakstyle = StyleSheet.create({
  streakContainer: {
    width: '100%',
    paddingBottom: 20,
    backgroundColor: colors.lightGreen,
    borderEndEndRadius: 30,
    borderEndStartRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconAndText: {
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: 5,
    marginHorizontal: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGreen,
  },
  progressContainer: {
    marginTop: 10,
    flexDirection: 'row', // Use row layout
    alignItems: 'center', // Vertically center the content
    justifyContent: 'space-between', // Evenly space the items
    width: '90%', // Take full width of the parent
  },
  progressLabel: {
    flex: 1, // Allocate equal space
    fontSize: 14,
    color: colors.darkText,
    fontWeight: '600',
    textAlign: 'left',
  },
  progressBarWrapper: {
    flex: 2, // Progress bar gets more space
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGrey,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    borderColor: colors.primaryGreen,
    borderWidth: 0.5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryGreen,
  },
  progressValue: {
    flex: 1, // Allocate equal space
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkText,
    textAlign: 'right',
  },
});

const modal_style_new = StyleSheet.create({
  fullPageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker overlay for emphasis
  },
  fullPageContainer: {
    width: '90%',
    height: '75%',
    backgroundColor: colors.white,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.3)', // Glowing gold effect
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: 'gold',
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  modalIcon: {
    width: 80,
    height: 80,
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.primaryGreen,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  modalMessage: {
    fontSize: 18,
    color: colors.darkGrey,
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  highlight: {
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  decorativeLine: {
    width: '60%',
    height: 4,
    backgroundColor: colors.lightGreen,
    borderRadius: 2,
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 16,
    color: colors.darkText,
    textAlign: 'center',
    paddingHorizontal: 15,
    fontStyle: 'italic',
    marginBottom: 15,
  },
  primaryButton: {
    width: '80%',
    backgroundColor: colors.primaryGreen,
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 15,
  },
  buttonText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
});

export default HomepageScreen;
