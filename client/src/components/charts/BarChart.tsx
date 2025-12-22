import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
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

const BarChart: React.FC<BarChartProps> = ({
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
        <RechartsBarChart
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
            <Bar
              key={index}
              dataKey={dataKey.key}
              fill={dataKey.color}
              name={dataKey.name}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;