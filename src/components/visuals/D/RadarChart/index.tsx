import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Line,
  Polygon,
  Image as SvgImage,
} from 'react-native-svg';
import { getGradientColors } from './getGradientColors';

export type RadarData = {
  label: string; // Avatar path
  value: number;
};

export type RadarChartProps = {
  data: RadarData[];
  size?: number;
  maxValue?: number;
  avatarSize?: number;
  dataFillColor?: string;
  dataFillOpacity?: number;
  dataStroke?: string;
  dataStrokeWidth?: number;
  dataStrokeOpacity?: number;
  divisionStroke?: string;
  divisionStrokeWidth?: number;
  divisionStrokeOpacity?: number;
  isCircle?: boolean;
};

type Point = [number, number];

export default ({
  data,
  size = 330,
  maxValue = Math.max(...data.map(v => v.value)),
  avatarSize = 40,
  dataFillColor = 'green',
  dataFillOpacity = 0.5,
  dataStroke = 'black',
  dataStrokeWidth = 2,
  dataStrokeOpacity = 1,
  divisionStroke = 'black',
  divisionStrokeWidth = 1,
  divisionStrokeOpacity = 0.5,
  isCircle = true,
}: RadarChartProps) => {
  const axesCnt = data.length;
  const degreesBetweenAxes = 360 / axesCnt;
  const radius = size * 0.35;
  const viewBoxSize = size;
  const viewBoxCenter = viewBoxSize * 0.5;

  const degToRadians = (degrees: number) => degrees * (Math.PI / 180);

  const calculateEdgePoint = useMemo(() => {
    return (index: number, scale: number = 1): Point => {
      const degree = index * degreesBetweenAxes - 90; // Start from top
      const radians = degToRadians(degree);
      return [
        viewBoxCenter + Math.cos(radians) * radius * scale,
        viewBoxCenter + Math.sin(radians) * radius * scale,
      ];
    };
  }, [viewBoxCenter, radius, degreesBetweenAxes]);

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent', // Ensure no background
      }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        {/* Circular grid */}
        {[...Array(4)].map((_, i) => (
          <Circle
            key={`circle_outline_${i}`}
            cx={viewBoxCenter}
            cy={viewBoxCenter}
            r={(i + 1) * (radius / 4)}
            stroke={divisionStroke}
            strokeWidth={divisionStrokeWidth}
            strokeOpacity={divisionStrokeOpacity}
            fill="none"
          />
        ))}

        {/* Grid lines */}
        {data.map((_, i) => {
          const edgePoint = calculateEdgePoint(i);
          return (
            <Line
              key={`grid-line-${i}`}
              x1={viewBoxCenter}
              y1={viewBoxCenter}
              x2={edgePoint[0]}
              y2={edgePoint[1]}
              stroke={divisionStroke}
              strokeWidth={divisionStrokeWidth}
              strokeOpacity={divisionStrokeOpacity}
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          fill={dataFillColor}
          fillOpacity={dataFillOpacity}
          stroke={dataStroke}
          strokeWidth={dataStrokeWidth}
          strokeOpacity={dataStrokeOpacity}
          points={data
            .map((point, i) => {
              const edgePoint = calculateEdgePoint(i, point.value / maxValue);
              return `${edgePoint[0]},${edgePoint[1]}`;
            })
            .join(' ')}
        />

        {/* Avatars */}
        {data.map((point, i) => {
          const edgePoint = calculateEdgePoint(i, 1.2); // Place avatars slightly outside the chart
          return (
            <SvgImage
              key={`avatar-${i}`}
              x={edgePoint[0] - avatarSize / 2}
              y={edgePoint[1] - avatarSize / 2}
              width={avatarSize}
              height={avatarSize}
              href={point.label} // Avatar path
            />
          );
        })}
      </Svg>
    </View>
  );
};
