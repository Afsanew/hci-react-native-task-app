import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Settings } from '../Types';
import { useToDoList } from './ToDoListContext';
import { setUpTests } from 'react-native-reanimated';

// Define default settings
const defaultSettings: Settings = {
  dailyTaskLimit: 4,
  categoryLimits: {},
  enableStreak: true,
  streakGoal: 2,
  notificationsEnabled: true,
};

// Define the context type
interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettingsToDefault: () => void;
  hasUserUpdatedSettings: boolean;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// Custom hook to use settings
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { toDoList } = useToDoList();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hasUserUpdatedSettings, setHasUserUpdatedSettings] = useState(false);

  // Update settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
    setHasUserUpdatedSettings(true);
  };

  // Reset settings to default
  const resetSettingsToDefault = () => {
    setSettings(defaultSettings);
    setHasUserUpdatedSettings(false);
  };

  // Auto-update category limits when new categories are added
  useEffect(() => {
    if (!hasUserUpdatedSettings) {
      let sum = 0;
      const updatedCategoryLimits = toDoList.categories.reduce(
        (limits, category) => {
          if (!limits.hasOwnProperty(category.name)) {
            if (sum < settings.dailyTaskLimit) {
              limits[category.name] = 1; // Assign default limit to new categories
              sum += 1;
            } else {
              limits[category.name] = 0; // No limit if dailyTaskLimit exceeded
            }
          }
          return limits;
        },
        { ...settings.categoryLimits },
      );

      // Update settings only if category limits have changed
      if (
        JSON.stringify(updatedCategoryLimits) !==
        JSON.stringify(settings.categoryLimits)
      ) {
        setSettings(prev => ({
          ...prev,
          categoryLimits: updatedCategoryLimits,
        }));
      }
    }
  }, [toDoList.categories, hasUserUpdatedSettings, settings.categoryLimits]);

  // Adjust daily task limit dynamically if limits exceed the current value
  useEffect(() => {
    const totalCategoryLimits = Object.values(settings.categoryLimits).reduce(
      (sum, limit) => sum + limit,
      0,
    );

    if (totalCategoryLimits > settings.dailyTaskLimit) {
      setSettings(prev => ({
        ...prev,
        dailyTaskLimit: totalCategoryLimits,
      }));
    }
  }, [settings.categoryLimits]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettingsToDefault,
        hasUserUpdatedSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
