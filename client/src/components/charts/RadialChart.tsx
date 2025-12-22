import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

interface RadialChartProps {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  height?: number;
  showLegend?: boolean;
}

const RadialChart: React.FC<RadialChartProps> = ({
  data,
  height = 300,
  showLegend = true,
}) => {
  const style = {
    top: '50%',
    right: 0,
    transform: 'translate(0, -50%)',
    lineHeight: '24px',
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={data}>
          <RadialBar
            label={{ position: 'insideStart', fill: '#fff' }}
            background
            dataKey="value"
          />
          {showLegend && (
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              wrapperStyle={style}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }} className="text-sm">
                  {value}
                </span>
              )}
            />
          )}
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadialChart;