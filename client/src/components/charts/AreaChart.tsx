import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataKey {
  key: string;
  color: string;
  name: string;
}

interface AreaChartProps {
  data: Array<Record<string, any>>;
  title?: string;
  height?: number;
  dataKeys: DataKey[];
  gradientId?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  valueFormatter?: (value: any) => string;
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  title,
  height = 300,
  dataKeys,
  gradientId,
  showLegend = true,
  showTooltip = true,
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
              {entry.name}: <span className="font-semibold" style={{ color: entry.color }}>{valueFormatter(entry.value)}</span>
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
        <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {gradientId && dataKeys.map((dataKey, index) => (
              <linearGradient key={index} id={`${gradientId}-${dataKey.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={dataKey.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={dataKey.color} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
          />
          <YAxis
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
            tickFormatter={valueFormatter}
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
          {dataKeys.map((dataKey, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={dataKey.key}
              stackId="1"
              stroke={dataKey.color}
              fill={gradientId ? `url(#${gradientId}-${dataKey.key})` : dataKey.color}
              fillOpacity={gradientId ? 1 : 0.6}
              name={dataKey.name}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;