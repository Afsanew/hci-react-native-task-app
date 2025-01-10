import React, { createContext, useContext, useState } from 'react';
import { useSettings } from './SettingsContext';

const StreakContext = createContext({
  completedTasks: 0,
  currentStreak: 0,
  streakGoal: 0,
  incrementCompletedTasks: () => {},
  resetStreakForNewDay: Number => {},
  resetStreak: () => {},
  resetCompletedTasks: () => {},
  enableStreak: false,
  highScore: 0,
});

export const StreakProvider = ({ children }) => {
  const { settings } = useSettings();
  const [completedTasks, setCompletedTasks] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const incrementCompletedTasks = () => {
    setCompletedTasks(prev => prev + 1);
  };
  const resetCompletedTasks = () => {
    setCompletedTasks(0); // Reset completed tasks
  };
  const resetStreak = () => {
    setCurrentStreak(0); // Reset streak progress
  };

  const resetStreakForNewDay = limit => {
    if (completedTasks >= limit) {
      // Increment streak if daily goal is met
      setCurrentStreak(prev => prev + 1);
      if (currentStreak + 1 > highScore) {
        //+1 bcos of delay
        setHighScore(currentStreak + 1);
      }
    } else {
      // Reset streak if goal not met
      setCurrentStreak(0);
    }
    // Reset daily progress
    setCompletedTasks(0);
  };

  return (
    <StreakContext.Provider
      value={{
        completedTasks,
        currentStreak,
        streakGoal: settings.streakGoal,
        incrementCompletedTasks,
        resetStreakForNewDay,
        resetStreak,
        resetCompletedTasks,
        enableStreak: settings.enableStreak,
        highScore,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};
