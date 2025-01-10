import Pie from 'paths-js/pie';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { G, Path, Rect, Svg, Text } from 'react-native-svg';

import AbstractChart, { AbstractChartProps } from './AbstractChart';

export interface PieChartProps extends AbstractChartProps {
  data: Array<any>;
  width: number;
  height: number;
  accessor: string;
  backgroundColor: string;
  paddingLeft: string;
  center?: Array<number>;
  absolute?: boolean;
  hasLegend?: boolean;
  style?: Partial<ViewStyle>;
  avoidFalseZero?: boolean;
}

type PieChartState = {};

class PieChart extends AbstractChart<PieChartProps, PieChartState> {
  render() {
    const {
      style = {},
      backgroundColor,
      absolute = false,
      hasLegend = true,
      avoidFalseZero = false,
    } = this.props;

    const { borderRadius = 0 } = style;

    const chart = Pie({
      center: this.props.center || [0, 0],
      r: 0,
      R: this.props.height / 2.5,
      data: this.props.data,
      accessor: x => {
        return x[this.props.accessor];
      },
    });

    const total = this.props.data.reduce((sum, item) => {
      return sum + item[this.props.accessor];
    }, 0);

    const slices = chart.curves.map((c, i) => {
      let value: string;

      if (absolute) {
        value = c.item[this.props.accessor];
      } else {
        if (total === 0) {
          value = 0 + '%';
        } else {
          const percentage = Math.round(
            (100 / total) * c.item[this.props.accessor],
          );
          value = Math.round((100 / total) * c.item[this.props.accessor]) + '%';
          if (avoidFalseZero && percentage === 0) {
            value = '<1%';
          } else {
            value = percentage + '%';
          }
        }
      }
      // Calculate vertical positioning for the legend items
      const itemSpacing = 30; // Spacing between items
      const legendStartY = 30 - (this.props.height * 0.8) / 2 + i * itemSpacing; // Center the legend vertically
      return (
        <G key={Math.random()}>
          <Path d={c.sector.path.print()} fill={c.item.color || '#000'} />
          {hasLegend && (
            <>
              <Rect
                width="13px"
                height="13px"
                fill={c.item.color || '#000'}
                rx={8}
                ry={8}
                x={this.props.width / 2.5 - 24}
                y={legendStartY}
              />
              <Text
                fill={c.item.legendFontColor || '#000'}
                fontSize={c.item.legendFontSize || 12}
                x={this.props.width / 2.5 - 5}
                y={legendStartY + 10}
              >
                {`${value} ${c.item.name}`}
              </Text>
            </>
          )}
        </G>
      );
    });

    return (
      <View
        style={{
          width: this.props.width,
          height: this.props.height,
          padding: 0,
          ...style,
        }}
      >
        <Svg width={this.props.width} height={this.props.height}>
          <G>
            {this.renderDefs({
              width: this.props.height,
              height: this.props.height,
              ...this.props.chartConfig,
            })}
          </G>
          <Rect
            width="100%"
            height={this.props.height}
            rx={borderRadius}
            ry={borderRadius}
            fill={backgroundColor}
          />
          <G
            x={this.props.width / (hasLegend ? 3.3 : 2)}
            y={this.props.height / 2}
          >
            {slices}
          </G>
        </Svg>
      </View>
    );
  }
}

export default PieChart;
