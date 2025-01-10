import React from 'react';
import PropTypes from 'prop-types';
import { Animated, View, StyleSheet } from 'react-native';
import { Svg, Path, G } from 'react-native-svg';

const CircularProgress = ({
  size,
  width,
  fill,
  tintColor,
  backgroundColor,
  children,
}) => {
  const radius = size / 2 - width / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (circumference * Math.min(fill, 100)) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={StyleSheet.absoluteFill}
      >
        {/* Background Circle */}
        <G rotation="0" origin={`${size / 2}, ${size / 2}`}>
          <Path
            stroke={backgroundColor}
            strokeWidth={width}
            fill="none"
            d={`M${size / 2},${size / 2 - radius}
               a${radius},${radius} 0 1,1 0,${2 * radius}
               a${radius},${radius} 0 1,1 0,-${2 * radius}`}
          />
          {/* Foreground Circle */}
          <Path
            stroke={tintColor}
            strokeWidth={width}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            d={`M${size / 2},${size / 2 - radius}
               a${radius},${radius} 0 1,1 0,${2 * radius}
               a${radius},${radius} 0 1,1 0,-${2 * radius}`}
          />
        </G>
      </Svg>
      {/* Children (e.g., Avatar or Text) */}
      {children && <View style={styles.childrenContainer}>{children()}</View>}
    </View>
  );
};

CircularProgress.propTypes = {
  size: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  fill: PropTypes.number.isRequired,
  tintColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  children: PropTypes.func,
};

CircularProgress.defaultProps = {
  tintColor: '#00e0ff',
  backgroundColor: '#3d5875',
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  childrenContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircularProgress;
