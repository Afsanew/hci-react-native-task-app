import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, {
  Circle,
  Line,
  Polygon,
  Image as SvgImage,
} from 'react-native-svg';
import colors from '../../../styles/colors';
import { useToDoList } from '../../../context/ToDoListContext';

const SpiderChart = ({ activeCategories, setActiveCategories }) => {
  const users = [
    {
      name: 'Marc',
      avatar: require('../../../../assets/marc.png'),
    },
    {
      name: 'Emma',
      avatar: require('../../../../assets/emma.png'),
    },
    {
      name: 'Chris',
      avatar: require('../../../../assets/chris.png'),
    },
    {
      name: 'Me',
      avatar: require('../../../../assets/wife.png'),
    },
  ];

  const { toDoList } = useToDoList();

  const radius = 120; // Radius of the circular grid
  const center = 200; // Center of the SVG
  const levels = 5; // Number of concentric grid levels
  const avatarSize = 40; // Size of avatars

  const toggleCategory = categoryName => {
    setActiveCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName],
    );
  };

  const calculatePoint = (position, value) => {
    const scaledRadius = (value / 10) * radius; // Assuming a max value of 10

    // Fixed positions for top, right, bottom, and left
    const angles = {
      top: -Math.PI / 2,
      right: 0,
      bottom: Math.PI / 2,
      left: Math.PI,
    };

    const angle = angles[position];

    return {
      x: center + scaledRadius * Math.cos(angle),
      y: center + scaledRadius * Math.sin(angle),
    };
  };

  // Prepare data for the spider chart
  const categoryData = toDoList.categories
    .filter(cat => activeCategories.includes(cat.name))
    .map(cat => ({
      name: cat.name,
      color: cat.color,
      tasksPerUser: users.map(user =>
        user === users[3]
          ? cat.tasks.length
          : cat.tasks.filter(task => task.sharedWith.includes(user.name))
              .length,
      ),
    }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Distribution</Text>
      {/* Category toggles */}
      <View style={styles.toggles}>
        {toDoList.categories.map(category => (
          <TouchableOpacity
            key={category.name}
            style={[
              styles.toggle,
              {
                backgroundColor: activeCategories.includes(category.name)
                  ? category.color
                  : colors.lightGrey,
              },
            ]}
            onPress={() => toggleCategory(category.name)}
          >
            <Text style={styles.toggleText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Svg height={400} width={400}>
        {/* Circular grid */}
        {[...Array(levels)].map((_, levelIndex) => (
          <Circle
            key={`grid-${levelIndex}`}
            cx={center}
            cy={center}
            r={(radius / levels) * (levelIndex + 1)}
            stroke={colors.buttonBackgroundGrey}
            strokeWidth={1}
            fill="none"
          />
        ))}

        {/* Grid lines */}
        {['top', 'right', 'bottom', 'left'].map(position => {
          const endPoint = calculatePoint(position, radius);
          const startPoint = calculatePoint(position, radius * 0.9); // Shorten the line
          return (
            <Line
              key={`line-${position}`}
              x1={startPoint.x}
              y1={startPoint.y}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke={colors.buttonBackgroundGrey}
              strokeWidth={1}
            />
          );
        })}

        {/* User avatars */}
        {['top', 'right', 'bottom', 'left'].map((position, index) => {
          const user = users[index]; // Ensure there are exactly 4 users
          const point = calculatePoint(position, 11);
          return (
            <SvgImage
              key={`avatar-${user.name}`}
              x={point.x - avatarSize / 2}
              y={point.y - avatarSize / 2}
              width={avatarSize}
              height={avatarSize}
              href={user.avatar} // Avatar image from UserContext
            />
          );
        })}

        {/* Data polygons */}
        {categoryData.map((category, catIndex) => {
          const points = ['top', 'right', 'bottom', 'left']
            .map((position, userIndex) => {
              if (userIndex === 3) {
                const value = category.tasksPerUser[userIndex] + 2;
                const point = calculatePoint(position, value);
                return `${point.x},${point.y}`;
              } else {
                const value =
                  category.tasksPerUser[userIndex] + 2 + (userIndex % 2) * 2;
                const point = calculatePoint(position, value);
                return `${point.x},${point.y}`;
              }
            })
            .join(' ');

          return (
            <Polygon
              key={`polygon-${category.name}`}
              points={points}
              fill={category.color}
              fillOpacity={0.5}
              stroke={category.color}
              strokeWidth={2}
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  toggles: {
    marginTop: 10,
    marginBottom: -10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    // ios shaddow
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    // android shadow
    elevation: 5,
  },
  toggle: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  toggleText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default SpiderChart;
