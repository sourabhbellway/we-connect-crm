import React from 'react';
import { HiOutlineArrowUp, HiOutlineArrowDown, HiOutlineMinus } from 'react-icons/hi2';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  isLoading?: boolean;
  className?: string;
}

function StatsCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  color = 'blue',
  isLoading = false,
  className = '',
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-white/10 dark:bg-black/10',
      iconBg: 'bg-blue-200 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trendColor: 'text-blue-600 dark:text-blue-400',
    },
    green: {
      bg: 'bg-white/10 dark:bg-black/10',
      iconBg: 'bg-green-200 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400',
      trendColor: 'text-green-600 dark:text-green-400',
    },
    purple: {
      bg: 'bg-white/10 dark:bg-black/10',
      iconBg: 'bg-purple-200 dark:bg-purple-950',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trendColor: 'text-purple-600 dark:text-purple-400',
    },
    orange: {
      bg: 'bg-white/10 dark:bg-black/10',
      iconBg: 'bg-orange-200 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400',
      trendColor: 'text-orange-600 dark:text-orange-400',
    },
    red: {
      bg: 'bg-white/10 dark:bg-black/10',
      iconBg: 'bg-red-200 dark:bg-red-950',
      iconColor: 'text-red-600 dark:text-red-400',
      trendColor: 'text-red-600 dark:text-red-400',
    },
    indigo: {
      bg: 'bg-white/10 dark:bg-black/10',
      iconBg: 'bg-indigo-200 dark:bg-indigo-950',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      trendColor: 'text-indigo-600 dark:text-indigo-400',
    },
  };

  const colors = colorClasses[color];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <HiOutlineArrowUp className="w-4 h-4" />;
    if (trend.value < 0) return <HiOutlineArrowDown className="w-4 h-4" />;
    return <HiOutlineMinus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    if (trend.isPositive !== undefined) {
      return trend.isPositive ? 'text-green-600' : 'text-red-600';
    }
    return trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-500';
  };

  return (
    <div className={`${colors.bg} rounded-xl p-4 shadow-sm  hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
              <div className={`${colors.iconColor}`}>
                {icon}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white/70 dark:text-gray-300 mb-1">
                {title}
              </h3>
              <div className="text-2xl font-bold text-white/70 dark:text-white">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse bg-white/20 dark:bg-gray-600 h-8 w-16 rounded"></div>
                  </div>
                ) : (
                  typeof value === 'number' ? value.toLocaleString() : value
                )}
              </div>
            </div>
          </div>
          
          {subtitle && (
            <p className="text-xs text-white/70 dark:text-gray-400 mb-2">
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-white/70 dark:text-gray-400">
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
