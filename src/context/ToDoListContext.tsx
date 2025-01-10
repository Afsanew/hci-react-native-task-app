import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ToDoList, Category, Task, Settings } from '../Types';
import colors from '../styles/colors';
import * as Notifications from 'expo-notifications';

interface ToDoListContextType {
  toDoList: ToDoList;
  dailyTasks: { [category: string]: Task[] };
  addCategory: (category: Category) => void;
  addTask: (task: Task, categoryName: string) => void;
  toggleComplete: (
    toggledTask: Task,
    toggledCategory: Category,
    fromWhere?: string,
  ) => void;
  clearCompletedTasks: () => void;
  deleteCategory: (categoryName: string) => void;
  updateCategory: (
    oldName: string,
    newName: string,
    shared: boolean,
    sharedWith: string[],
    color: string,
  ) => void;
  resetTasksForNewDay: (settings: Settings) => void;
  updateTask: (updatedTask: Task) => void;
  getLimitedTasksPerCategory: (settings: Settings) => Category[];
  delete_all: () => void;
  isEmpty: boolean;
  isFirstTime: boolean;
  setIsFirstTime: (value: boolean) => void;
  dailyHistory: { date: Date; tasksCompleted: number }[];
  saveDailyHistory: (tasksCompleted: number) => void;
  deleteTask: (task: Task) => void;
  deleted: boolean;
  triggers: string[];
  hasGenerated: boolean;
  setHasGenerated: (value: boolean) => void;
  dailyTaskCompletions: Record<string, number>;
  setDailyTaskCompletions: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  currentDate: string;
  setCurrentDate: (date: string) => void;
  categorySortOptions: {
    [categoryName: string]: 'priority' | 'deadline' | 'shared';
  };
  updateCategorySortOption: (
    categoryName: string,
    option: 'priority' | 'deadline' | 'shared',
  ) => void;
}

const ToDoListContext = createContext<ToDoListContextType | null>(null);

export const useToDoList = () => {
  const context = useContext(ToDoListContext);
  if (!context) {
    throw new Error('useToDoList must be used within a ToDoListProvider');
  }
  return context;
};

export const ToDoListProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toDoList, setToDoList] = useState<ToDoList>({ categories: [] });
  const [dailyTasks, setDailyTasks] = useState<{ [category: string]: Task[] }>(
    {},
  );
  const [isEmpty, setIsEmpty] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [sharedTasks, setSharedTasks] = useState<Task[]>([]);
  const [sharedCategories, setSharedCategories] = useState<Category[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Daily history tracking
  const [dailyHistory, setDailyHistory] = useState([
    { date: new Date(2024, 11, 11), tasksCompleted: 0 },
  ]);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split('T')[0],
  ); // YYYY-MM-DD

  const deleteTask = task => {
    setToDoList(todolist => ({
      ...todolist,
      categories: todolist.categories.map(category => ({
        ...category,
        tasks: category.tasks.filter(t => t.id !== task.id),
        completedTasks: category.completedTasks.filter(t => t.id !== task.id),
      })),
    }));
  };

  const simulateAcknowledgement = async (task: Task, newUsers: string[]) => {
    console.log('simul');

    const responses = newUsers.map(user => {
      const accepted = Math.random() > 0.5; // Simulate random acceptance/rejection
      return { user, accepted };
    });

    const acceptedUsers = responses
      .filter(response => response.accepted)
      .map(response => response.user);

    const rejectedUsers = responses
      .filter(response => !response.accepted)
      .map(response => response.user);

    // Update the task with accepted users only
    setToDoList(prevList => {
      const updatedCategories = prevList.categories.map(category => {
        if (category.name === task.category) {
          return {
            ...category,
            tasks: category.tasks.map(existingTask =>
              existingTask.id === task.id
                ? {
                    ...existingTask,
                    sharedWith: [
                      ...(existingTask.sharedWith || []),
                      ...acceptedUsers,
                    ],
                  }
                : existingTask,
            ),
          };
        }
        return category;
      });
      return { ...prevList, categories: updatedCategories };
    });

    // Send notifications
    if (acceptedUsers.length > 0) {
      if (acceptedUsers.length > 0) {
        acceptedUsers.forEach(user => {
          simulateNotification(
            'Task Sharing Accepted',
            `${user} accepted the task "${newTask.name}".`,
          );
        });
      }
    }

    if (rejectedUsers.length > 0) {
      if (rejectedUsers.length > 0) {
        rejectedUsers.forEach(user => {
          simulateNotification(
            'Task Sharing rejected',
            `${user} rejected the task "${newTask.name}".`,
          );
        });
      }
    }
  };

  const updateCategory = (oldName, newName, shared, sharedWith, color) => {
    setToDoList(prevList => ({
      ...prevList,
      categories: prevList.categories.map(category =>
        category.name === oldName
          ? { ...category, name: newName, shared, sharedWith, color }
          : category,
      ),
    }));
  };

  const deleteCategory = categoryName => {
    const cats = toDoList.categories.map(category => {
      if (category.name === categoryName) {
        category.tasks.forEach(task => {
          deleteTask(task);
        });
      }
      return category;
    });
    const filteredcats = cats.filter(
      category => category.name !== categoryName,
    );

    setToDoList(prev => ({
      ...prev,
      categories: filteredcats,
    }));
    setTriggers([]);
  };

  var deleted = false;

  // Function to save daily history and move to the next day
  const saveDailyHistory = tasksCompleted => {
    setDailyHistory(prev => {
      // If this is the first save, use the initial date directly
      if (prev.length === 1 && prev[0].tasksCompleted === 0) {
        return [{ ...prev[0], tasksCompleted }];
      }

      // Otherwise, get the last saved date and calculate the next date
      const lastEntry = prev[prev.length - 1];
      const lastDate = new Date(lastEntry.date);

      // Add one day to the last date
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + 1);

      // Add the new day's data to the history
      return [...prev, { date: nextDate, tasksCompleted }];
    });
  };

  const updateIsEmpty = () => {
    setIsEmpty(false);
    //should actualy have another logic but logic not wokring man
  };

  const delete_all = () => {
    setTimeout(() => {
      setToDoList({ categories: [] });
      setDailyTasks({});
      setIsFirstTime(true);
      setIsEmpty(true);
    }, 50);
    deleted = true;
    setTimeout(() => {
      deleted = false;
    }, 1000);
    setHasGenerated(false);
    setCurrentDate(new Date().toISOString().split('T')[0]);
    setDailyTaskCompletions({});
  };
  const getSharedTasks = (userName: string): Task[] => {
    return sharedTasks.filter(task => task.sharedWith.includes(userName));
  };
  const getTasksForUser = (userName: string): Task[] => {
    return toDoList.categories.flatMap(category =>
      category.tasks.filter(task => task.sharedWith.includes(userName)),
    );
  };

  const updateTask = async (updatedTask: Task) => {
    // Find the old task in the list
    const oldTask = toDoList.categories
      .flatMap(category => category.tasks)
      .find(task => task.id === updatedTask.id);

    if (!oldTask) {
      console.warn('Task not found in the list');
      return;
    }

    // Determine new users added to sharedWith
    const newUsers =
      updatedTask.sharedWith?.filter(
        user => !oldTask.sharedWith?.includes(user),
      ) || [];

    // Determine users removed from sharedWith
    const removedUsers =
      oldTask.sharedWith?.filter(
        user => !updatedTask.sharedWith?.includes(user),
      ) || [];

    // Simulate responses for new users
    const responses = newUsers.map(user => ({
      user,
      accepted: Math.random() < 0.8, // 80% acceptance probability
    }));

    const acceptedUsers = responses
      .filter(response => response.accepted)
      .map(response => response.user);

    const rejectedUsers = responses
      .filter(response => !response.accepted)
      .map(response => response.user);

    // Update the task in the context
    setToDoList(prevList => {
      const updatedCategories = prevList.categories.map(category => {
        if (category.name === updatedTask.category) {
          return {
            ...category,
            tasks: category.tasks.map(task =>
              task.id === updatedTask.id
                ? {
                    ...task, // Preserve other fields
                    ...updatedTask, // Overwrite with updated fields
                    sharedWith: Array.from(
                      new Set([
                        ...task.sharedWith.filter(
                          user => !removedUsers.includes(user),
                        ), // Retain users not removed
                        ...acceptedUsers, // Add accepted users
                      ]),
                    ),
                  }
                : task,
            ),
          };
        }
        return category;
      });
      return { ...prevList, categories: updatedCategories };
    });

    // Notify accepted users
    acceptedUsers.forEach(user => {
      simulateNotification(
        'Task Sharing Accepted',
        `${user} accepted the task "${updatedTask.name}".`,
      );
    });

    // Notify rejected users
    rejectedUsers.forEach(user => {
      simulateNotification(
        'Task Sharing Rejected',
        `${user} rejected the task "${updatedTask.name}".`,
      );
    });

    // Notify removed users
    removedUsers.forEach(user => {
      simulateNotification(
        'Task Unshared',
        `${user} was removed from the shared list of task "${updatedTask.name}".`,
      );
    });

    // Update empty state if necessary
    updateIsEmpty();
  };

  const addCategory = (newCategory: Category) => {
    setTimeout(() => {
      setToDoList(prevList => ({
        ...prevList,
        categories: [
          ...prevList.categories,
          { ...newCategory, completedTasks: [] },
        ],
      }));

      if (newCategory.sharedWith && newCategory.sharedWith.length > 0) {
        setSharedCategories(prevSharedCategories => [
          ...prevSharedCategories,
          newCategory,
        ]); // Add to sharedCategories
      }
    }, 50);
  };

  const addTask = async (newTask: Task, categoryName: string) => {
    const newUsers = newTask.sharedWith || []; // Get the users the task is initially shared with

    // Add the task to the category
    setTimeout(() => {
      if (
        ![
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
          '16',
          '17',
          '18',
          '19',
          '20',
          '21',
          '22',
          '23',
        ].includes(newTask.id)
      ) {
        // First, evaluate acknowledgment for the new users
        const responses = newUsers.map(user => {
          const accepted = Math.random() < 0.8; // 80% chance of acceptance
          console.log(
            `${user} ${accepted ? 'accepted' : 'rejected'} the task.`,
          );
          return { user, accepted };
        });

        // Separate accepted and rejected users
        const acceptedUsers = responses
          .filter(response => response.accepted)
          .map(response => response.user);

        const rejectedUsers = responses
          .filter(response => !response.accepted)
          .map(response => response.user);

        // Update the task with only accepted users
        const taskToAdd = {
          ...newTask,
          sharedWith: acceptedUsers, // Update the sharedWith list with accepted users
        };

        setTimeout(() => {
          if (acceptedUsers.length > 0) {
            acceptedUsers.forEach(user => {
              simulateNotification(
                'Task Sharing Accepted',
                `${user} accepted the task "${newTask.name}".`,
              );
            });
          }
        }, 100);

        setTimeout(() => {
          if (rejectedUsers.length > 0) {
            rejectedUsers.forEach(user => {
              simulateNotification(
                'Task Sharing Rejected',
                `${user} rejected the task "${newTask.name}".`,
              );
            });
          }
        }, 100);

        setTimeout(() => {
          setToDoList(prevList => {
            const updatedCategories = prevList.categories.map(category =>
              category.name === categoryName
                ? { ...category, tasks: [...category.tasks, taskToAdd] }
                : category,
            );

            // Add task to sharedTasks if it has sharedWith users
            if (acceptedUsers.length > 0) {
              setSharedTasks(prevSharedTasks => [
                ...prevSharedTasks,
                taskToAdd,
              ]);
            }

            return { ...prevList, categories: updatedCategories };
          });
        }, 100);
      } else {
        const taskToAdd = {
          ...newTask,
          sharedWith: newUsers, // Update the sharedWith list with accepted users
        };
        setTimeout(() => {
          setToDoList(prevList => {
            const updatedCategories = prevList.categories.map(category =>
              category.name === categoryName
                ? { ...category, tasks: [...category.tasks, taskToAdd] }
                : category,
            );

            // Add task to sharedTasks if it has sharedWith users
            if (newUsers.length > 0) {
              setSharedTasks(prevSharedTasks => [
                ...prevSharedTasks,
                taskToAdd,
              ]);
            }

            return { ...prevList, categories: updatedCategories };
          });
        }, 100);
      }
    }, 50);

    updateIsEmpty(); // Update the empty state
  };

  const [dailyTaskCompletions, setDailyTaskCompletions] = useState<
    Record<string, number>
  >({});

  const toggleComplete = (
    toggledTask: Task,
    toggledCategory: Category,
    fromWhere?: string,
  ) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    const updatedTask = {
      ...toggledTask,
      isCompleted: !toggledTask.isCompleted,
    };

    // Increment or decrement task completions
    setDailyTaskCompletions(prev => {
      console.log(prev[today]);
      if (updatedTask.isCompleted) {
        // Increment today's count
        return {
          ...prev,
          [currentDate]: (prev[currentDate] || 0) + 1,
        };
      } else {
        // Decrement today's count if a task is unmarked
        return {
          ...prev,
          [currentDate]: Math.max(0, (prev[currentDate] || 1) - 1), // Prevent negative numbers
        };
      }
    });

    // Update ToDoList state
    setToDoList(prevList => {
      const updatedCategories = prevList.categories.map(category => {
        if (category.name === toggledCategory.name) {
          const task = category.tasks.find(t => t.id === toggledTask.id);
          if (task) {
            // If task is being completed
            return {
              ...category,
              tasks: category.tasks.filter(t => t.id !== toggledTask.id),
              completedTasks: [
                ...category.completedTasks,
                { ...task, isCompleted: true },
              ],
            };
          } else {
            // If task is being uncompleted
            const completedTask = category.completedTasks.find(
              t => t.id === toggledTask.id,
            );
            return {
              ...category,
              tasks: [
                ...category.tasks,
                { ...completedTask!, isCompleted: false },
              ],
              completedTasks: category.completedTasks.filter(
                t => t.id !== toggledTask.id,
              ),
            };
          }
        }
        return category;
      });

      return { categories: updatedCategories };
    });

    updateIsEmpty(); // Update empty status
  };

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

  const acknowledgeTask = (task: Task, accept: boolean, userName: string) => {
    if (accept) {
      setToDoList(prevList => {
        const updatedCategories = prevList.categories.map(category =>
          category.name === task.category
            ? {
                ...category,
                tasks: category.tasks.map(existingTask =>
                  existingTask.id === task.id
                    ? {
                        ...existingTask,
                        sharedWith: [...existingTask.sharedWith, userName],
                      }
                    : existingTask,
                ),
              }
            : category,
        );

        // Check if the wife already has a category for the task
        const wifeCategoryExists = updatedCategories.some(
          category =>
            category.name === task.category &&
            category.sharedWith.includes('Wife'),
        );

        if (wifeCategoryExists) {
          // Add task to wife's existing category
          const wifeCategories = updatedCategories.map(category =>
            category.name === task.category &&
            category.sharedWith.includes('Wife')
              ? {
                  ...category,
                  tasks: [...category.tasks, task],
                }
              : category,
          );

          // Trigger acknowledgment notification for wife
          alert(
            `The task "${task.name}" has been added to your category "${task.category}".`,
          );

          return { ...prevList, categories: wifeCategories };
        } else {
          // Create a new category for the wife and add the task there
          const newCategory = {
            name: task.category,
            color: colors.shared, // Assign default color for new category
            tasks: [task],
            completedTasks: [],
            sharedWith: [userName],
          };

          const categoriesWithNew = [...updatedCategories, newCategory];

          // Notify the wife
          alert(
            `You accepted the task "${task.name}" from ${userName}. It has been added to your new category "${task.category}".`,
          );

          return { ...prevList, categories: categoriesWithNew };
        }
      });
    } else {
      // Trigger rejection notification without modifying the list
      alert(
        `You rejected the task "${task.name}" from ${userName}. We will notify ${userName}.`,
      );
    }
  };

  const resetTasksForNewDay = (settings: Settings) => {
    // NEW DAY FOR VISUALS
    const current = new Date(currentDate);

    // Increment the currentDate by one day
    const nextDay = new Date(currentDate);
    nextDay.setDate(current.getDate() + 1);

    // Format the new date as YYYY-MM-DD
    const nextDayString = nextDay.toISOString().split('T')[0];

    // Update the currentDate and reset daily tasks
    setCurrentDate(nextDayString); // Simulated "next day"
    setDailyTaskCompletions(prev => ({
      ...prev,
      [currentDate]: dailyTaskCompletions[currentDate],
      [nextDayString]: 0, // Initialize next day's task completion count
    }));

    // Reset tasks for the new day
    const newDailyTasks: { [category: string]: Task[] } = {};
    toDoList.categories.forEach(category => {
      const limit = settings.categoryLimits[category.name] || 0;
      const sortedTasks = category.tasks
        .filter(task => !task.isCompleted)
        .slice(0, limit);
      newDailyTasks[category.name] = sortedTasks;
    });
    console.log('Current Date:', currentDate);
    console.log('Next Day:', nextDay);
    console.log('Next Day String:', nextDayString);

    setDailyTasks(newDailyTasks);
  };

  const getLimitedTasksPerCategory = (settings: Settings) => {
    return toDoList.categories
      .filter(category => {
        const limit = settings.categoryLimits[category.name];
        return limit && limit > 0 && category.tasks.length > 0; // Ensure limit > 0 and tasks are available
      })
      .map(category => {
        const limit = settings.categoryLimits[category.name];
        const sortedTasks = [...category.tasks].slice(0, limit); // Get tasks up to the limit
        return {
          name: category.name,
          color: category.color,
          tasks: sortedTasks,
          completedTasks: category.completedTasks,
          shared: category.shared,
          sharedWith: category.sharedWith,
        };
      });
  };

  const clearCompletedTasks = () => {
    setToDoList(prevList => ({
      ...prevList,
      categories: prevList.categories.map(category => ({
        ...category,
        completedTasks: [],
      })),
    }));
  };
  const [categorySortOptions, setCategorySortOptions] = useState<{
    [key: string]: 'priority' | 'deadline' | 'shared';
  }>({});

  const updateCategorySortOption = (
    categoryName: string,
    option: 'priority' | 'deadline' | 'shared',
  ) => {
    setCategorySortOptions(prev => ({ ...prev, [categoryName]: option }));
  };

  return (
    <ToDoListContext.Provider
      value={{
        toDoList,
        dailyTasks,
        addCategory,
        deleteCategory,
        updateCategory,
        addTask,
        toggleComplete,
        clearCompletedTasks,
        resetTasksForNewDay,
        updateTask,
        delete_all,
        deleted,
        getLimitedTasksPerCategory,
        deleteTask,
        isEmpty,
        isFirstTime,
        setIsFirstTime,
        dailyHistory,
        saveDailyHistory,
        triggers,
        setHasGenerated,
        hasGenerated,
        dailyTaskCompletions,
        setDailyTaskCompletions,
        currentDate,
        setCurrentDate,
        categorySortOptions,
        updateCategorySortOption,
      }}
    >
      {children}
    </ToDoListContext.Provider>
  );
};
