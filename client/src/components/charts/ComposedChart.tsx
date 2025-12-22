import React from 'react';
import { ComposedChart as RechartsComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataKey {
  key: string;
  color: string;
  name: string;
  type: 'line' | 'bar';
}

interface ComposedChartProps {
  data: Array<Record<string, any>>;
  title?: string;
  height?: number;
  dataKeys: DataKey[];
  showLegend?: boolean;
  showTooltip?: boolean;
}

const ComposedChart: React.FC<ComposedChartProps> = ({
  data,
  title,
  height = 300,
  dataKeys,
  showLegend = true,
  showTooltip = true,
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
              {entry.name}: <span className="font-semibold" style={{ color: entry.color }}>{entry.value}</span>
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
        <RechartsComposedChart data={data} margin={{ top: 20, right: 30, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }} className="text-sm">
                  {value}
                </span>
              )}
            />
          )}
          {dataKeys.map((dataKey, index) => {
            if (dataKey.type === 'line') {
              return (
                <Line
                  key={index}
                  yAxisId="right"
                  type="monotone"
                  dataKey={dataKey.key}
                  stroke={dataKey.color}
                  strokeWidth={2}
                  name={dataKey.name}
                  dot={{ fill: dataKey.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              );
            } else if (dataKey.type === 'bar') {
              return (
                <Bar
                  key={index}
                  yAxisId="left"
                  dataKey={dataKey.key}
                  fill={dataKey.color}
                  name={dataKey.name}
                />
              );
            }
            return null;
          })}
        </RechartsComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComposedChart;