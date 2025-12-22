import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: Array<{
    name: string;
    [key: string]: any;
  }>;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  dataKeys?: Array<{
    key: string;
    color: string;
    name?: string;
  }>;
  xAxisKey?: string;
  valueFormatter?: (value: any) => string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  height = 300,
  showLegend = true,
  showTooltip = true,
  dataKeys = [{ key: 'value', color: '#3B82F6', name: 'Value' }],
  xAxisKey = 'name',
  valueFormatter = (val) => val,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-300">
              <span style={{ color: entry.color }}>●</span> {entry.name}: <span className="font-semibold">{valueFormatter(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey={xAxisKey}
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
            tickFormatter={valueFormatter}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend />}
          {dataKeys.map((dataKey, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={dataKey.key}
              stroke={dataKey.color}
              strokeWidth={2}
              dot={{ fill: dataKey.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: dataKey.color, strokeWidth: 2 }}
              name={dataKey.name}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;