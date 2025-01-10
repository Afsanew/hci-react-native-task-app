import colors from '../styles/colors';

export const getPriorityColor = (priority: number) => {
  const colorList = [
    colors.priority1,
    colors.priority2,
    colors.priority3,
    colors.priority4,
    colors.priority5,
  ];

  return colorList[priority - 1];
};
