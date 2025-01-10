import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import colors from '../styles/colors';
import BottomSheetPicker from '../components/shared/BottomSheetPicker';
import { useToDoList } from '../context/ToDoListContext';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useStreak } from '../context/StreakContext';

const SettingsScreen: React.FC = () => {
  const { resetStreak } = useStreak();
  const { toDoList, delete_all } = useToDoList();
  const { settings, updateSettings, resetSettingsToDefault } = useSettings();

  const [dailyTaskLimit, setDailyTaskLimit] = useState(settings.dailyTaskLimit);
  const [categoryLimits, setCategoryLimits] = useState(settings.categoryLimits);
  const [enableStreak, setEnableStreak] = useState(settings.enableStreak);
  const [streakGoal, setStreakGoal] = useState(settings.streakGoal);
  const [showVideo, setShowVideo] = useState(false);

  const [isDailyTaskLimitPickerVisible, setDailyTaskLimitPickerVisible] =
    useState(false);
  const [isStreakGoalPickerVisible, setStreakGoalPickerVisible] =
    useState(false);
  const [activeCategoryPicker, setActiveCategoryPicker] = useState<
    string | null
  >(null);

  useEffect(() => {
    // if there is a category which got removed from todolist.categories, also remove it from the dispalyed categories here
    const updatedCategoryLimits = Object.keys(categoryLimits).reduce(
      (limits, category) => {
        if (toDoList.categories.find(cat => cat.name === category)) {
          limits[category] = categoryLimits[category];
        }
        return limits;
      },
      {},
    );
    setCategoryLimits(updatedCategoryLimits);
  }, [toDoList]);

  const availableSpots =
    dailyTaskLimit -
    Object.values(categoryLimits).reduce((sum, limit) => sum + limit, 0);

  const updateCategoryLimit = (category: string, newLimit: number) => {
    setCategoryLimits(prevLimits => ({
      ...prevLimits,
      [category]: newLimit,
    }));
  };

  useEffect(() => {
    const updatedCategoryLimits = toDoList.categories.reduce(
      (limits, category) => {
        // Add new categories only if not already present in the limits
        if (!limits.hasOwnProperty(category.name)) {
          limits[category.name] = 0; // Default limit for new categories
        }
        return limits;
      },
      { ...categoryLimits },
    );

    // Check if there are actual changes before updating
    if (
      JSON.stringify(updatedCategoryLimits) !== JSON.stringify(categoryLimits)
    ) {
      setCategoryLimits(updatedCategoryLimits);
      updateSettings({ categoryLimits: updatedCategoryLimits });
    }
  }, [toDoList.categories, categoryLimits]);

  useEffect(() => {
    updateSettings({ dailyTaskLimit });
  }, [dailyTaskLimit]);

  useEffect(() => {
    updateSettings({ categoryLimits });
  }, [categoryLimits]);

  useEffect(() => {
    updateSettings({ enableStreak });
  }, [enableStreak]);

  useEffect(() => {
    updateSettings({ streakGoal });
  }, [streakGoal]);

  const handleStreakToggle = value => {
    if (!value) {
      Alert.alert(
        'Disable Streaks',
        'Disabling streaks will reset your current streak progress. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setEnableStreak(false);
              resetStreak(); // Reset streak when streaks are disabled
            },
          },
        ],
      );
    } else {
      setEnableStreak(true);
    }
  };

  //todo delete really all
  const handleDeleteData = () => {
    Alert.alert(
      'Delete Data',
      'Are you sure you want to delete all completed tasks and reset streak data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            delete_all();
            resetSettingsToDefault();
            setEnableStreak(false);
            setTimeout(() => {
              setCategoryLimits({});
            }, 50);
          },
        },
      ],
    );
  };

  const handlePlaybackStatusUpdate = status => {
    if (status.didJustFinish) {
      setShowVideo(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Video Modal for Tutorial */}
      <Modal
        visible={showVideo}
        animationType="slide"
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

      {/* Daily Task Limit Section */}
      <View style={styles.section}>
        <View style={drop.dropdown_with_label}>
          <Text style={drop.dropdownLabelTasksPerDay}>Tasks per Day</Text>
          <TouchableOpacity
            onPress={() => setDailyTaskLimitPickerVisible(true)}
            style={drop.dropdown}
          >
            <View style={drop.dropdownValueContainer}>
              <Text style={drop.dropdownValue}>{dailyTaskLimit}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.darkGrey} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <BottomSheetPicker
        visible={isDailyTaskLimitPickerVisible}
        options={[1, 2, 3, 4, 5].map(num => ({ label: `${num}`, value: num }))}
        onSelect={option => {
          setDailyTaskLimit(option.value);
          var sum = 0;
          const resetCategoryLimits = Object.keys(categoryLimits).reduce(
            (limits, category) => {
              if (sum < option.value) {
                limits[category] = 1;
                sum = sum + 1;
              } else {
                limits[category] = 0;
              }
              return limits;
            },
            {},
          );
          setCategoryLimits(resetCategoryLimits);
          updateSettings({
            dailyTaskLimit: option.value,
            categoryLimits: resetCategoryLimits,
          });
          setDailyTaskLimitPickerVisible(false);
        }}
        onClose={() => setDailyTaskLimitPickerVisible(false)}
      >
        <Text style={styles.title}>Select Daily Task Limit</Text>
      </BottomSheetPicker>

      {/* Category Limits Section */}
      <View style={styles.section}>
        <View style={styles.categoryLimitsHeader}>
          <Text style={styles.sectionTitle}>Category Limits</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              const resetCategoryLimits = Object.keys(categoryLimits).reduce(
                (limits, category) => {
                  limits[category] = 0; // Set all limits to 0
                  return limits;
                },
                {} as Record<string, number>,
              );
              setCategoryLimits(resetCategoryLimits);
              updateSettings({ categoryLimits: resetCategoryLimits });
            }}
          >
            <Text style={styles.resetButtonText}>Reset all to 0</Text>
          </TouchableOpacity>
        </View>

        {Object.keys(categoryLimits).length > 0 ? (
          Object.keys(categoryLimits).map(category => (
            <View style={drop.dropdown_with_label} key={category}>
              <Text style={drop.dropdownLabel}>{category}</Text>
              <TouchableOpacity
                onPress={() => setActiveCategoryPicker(category)}
                style={drop.dropdown}
              >
                <View style={drop.dropdownValueContainer}>
                  <Text style={drop.dropdownValue}>
                    {categoryLimits[category]}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={colors.darkGrey}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={drop.noCategoriesContainer}>
            <Text style={drop.noCategoriesText}>No categories present yet</Text>
          </View>
        )}
      </View>

      {activeCategoryPicker && (
        <BottomSheetPicker
          visible={!!activeCategoryPicker}
          options={[
            ...Array(
              availableSpots + categoryLimits[activeCategoryPicker] + 1,
            ).keys(),
          ].map(num => ({ label: `${num}`, value: num }))}
          onSelect={option => {
            updateCategoryLimit(activeCategoryPicker, option.value);
            setActiveCategoryPicker(null);
          }}
          onClose={() => setActiveCategoryPicker(null)}
        >
          <Text style={styles.title}>Select Category Limit</Text>
        </BottomSheetPicker>
      )}

      {/* Streak Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Streak Settings</Text>
        <View style={styles.row}>
          <Text style={drop.dropdownLabel}>Enable Streak</Text>
          <Switch
            value={enableStreak}
            onValueChange={handleStreakToggle}
            trackColor={{ false: colors.lightGrey, true: colors.primaryGreen }}
            thumbColor={enableStreak ? colors.darkGreen : colors.darkGrey}
          />
        </View>
        {enableStreak && (
          <View style={drop.dropdown_with_label}>
            <Text style={drop.dropdownLabel}>Custom Streak Goal</Text>
            <TouchableOpacity
              onPress={() => setStreakGoalPickerVisible(true)}
              style={[drop.dropdown, { width: 110, paddingHorizontal: 10 }]}
            >
              <View style={drop.dropdownValueContainer}>
                <Text style={drop.dropdownValue}>{streakGoal} days</Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.darkGrey}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <BottomSheetPicker
        visible={isStreakGoalPickerVisible}
        options={[2, 7, 14, 30, 60, 90].map(goal => ({
          label: `${goal} days`,
          value: goal,
        }))}
        onSelect={option => {
          setStreakGoal(option.value);
          setStreakGoalPickerVisible(false);
        }}
        onClose={() => setStreakGoalPickerVisible(false)}
      >
        <Text style={styles.title}>Select Goal</Text>
      </BottomSheetPicker>

      {/* Data Management Section 
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteData}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color={colors.white}
            style={styles.smallicon}
          />
          <Text style={[styles.deleteButtonText, { paddingVertical: 5 }]}>
            Delete All Data
          </Text>
        </TouchableOpacity>
      </View>*/}

      {/* Tutorial Section 
      <View style={[styles.section, { marginBottom: 50 }]}>
        <Text style={styles.sectionTitle}>Tutorial</Text>
        <TouchableOpacity
          style={styles.icon_text}
          onPress={() => setShowVideo(true)}
        >
          <Image
            source={{
              uri: 'https://img.icons8.com/?size=100&id=111348&format=png&color=ffffff',
            }}
            style={styles.smallicon}
          />
          <Text style={[styles.tutorialButtonText, { paddingVertical: 5 }]}>
            Watch Video Tutorial
          </Text>
        </TouchableOpacity>
      </View>*/}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
  },
  section: {
    marginVertical: 10,
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.lightGreen,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGreen,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.lightGrey,
  },
  deleteButton: {
    backgroundColor: colors.alertRed,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 15,
    // ios shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // android shadow
    elevation: 3,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 20,
  },
  tutorialButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 25,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullScreenVideo: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  icon_text: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.primaryGreen,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    // ios shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // android shadow
    elevation: 3,
  },
  smallicon: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  categoryLimitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: colors.lightGreen,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 8,
    // ios shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // android shadow
    elevation: 3,
  },
  resetButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
});

const drop = StyleSheet.create({
  dropdown_with_label: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    width: 100,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    marginVertical: 5,
    // ios shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // android shadow
    elevation: 3,
  },
  dropdownLabel: {
    fontSize: 17,
    color: colors.darkText,
    width: '65%',
  },
  dropdownLabelTasksPerDay: {
    fontSize: 20,
    color: colors.darkGreen,
    width: '65%',
    fontWeight: 'bold',
  },
  dropdownValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGreen,
    marginRight: 10,
  },
  noCategoriesContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  noCategoriesText: {
    color: colors.darkGrey,
    fontSize: 17,
  },
});

export default SettingsScreen;
