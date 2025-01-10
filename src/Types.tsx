// Types.ts
export interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryColor: string;
  deadline: Date | null;
  //reminder: string;
  priority: number;
  isCompleted: boolean;
  sharedWith: string[];
  inSharedCategory: boolean;
  categorySharedWith: string[];
}

export interface Category {
  name: string;
  color: string;
  tasks: Task[]; // Array of tasks assigned to this category
  completedTasks: Task[];
  shared: boolean;
  sharedWith: string[];
}

export interface ToDoList {
  sort(arg0: (a: any, b: any) => number): ToDoList;
  categories: Category[]; // Array of categories, each containing its tasks
}

export interface Settings {
  dailyTaskLimit: number; // Number of daily to-dos, typically 3 but adjustable (1-5)
  categoryLimits: {
    // Daily task limits per category to encourage balanced task management
    [categoryName: string]: number;
  };
  enableStreak: boolean; // Track daily streak for completing tasks
  streakGoal: number;
  notificationsEnabled: boolean; // Enable notifications for completed tasks
}

export interface Option {
  label: string;
  value: any;
  color?: string;
}
