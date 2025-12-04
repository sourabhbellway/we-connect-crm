import React from 'react';
import StatsCard from './StatsCard';
import {
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineClipboard,
  HiOutlineChartBar,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineMinus,
} from 'react-icons/hi2';

// Example component showing how to use StatsCard
function StatsCardExample() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        StatsCard Component Examples
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Card */}
        <StatsCard
          icon={<HiOutlineUsers className="w-6 h-6" />}
          title="Total Users"
          value={1250}
          color="blue"
        />

        {/* Card with Subtitle */}
        <StatsCard
          icon={<HiOutlineUserGroup className="w-6 h-6" />}
          title="Active Users"
          value={1180}
          subtitle="92% of total users"
          color="green"
        />

        {/* Card with Trend (Positive) */}
        <StatsCard
          icon={<HiOutlineClipboard className="w-6 h-6" />}
          title="Total Leads"
          value={3420}
          subtitle="1,200 new this month"
          trend={{
            value: 15,
            label: "vs last month",
            isPositive: true
          }}
          color="purple"
        />

        {/* Card with Trend (Negative) */}
        <StatsCard
          icon={<HiOutlineChartBar className="w-6 h-6" />}
          title="Conversion Rate"
          value="12.5%"
          subtitle="Below target"
          trend={{
            value: 8,
            label: "vs last month",
            isPositive: false
          }}
          color="red"
        />

        {/* Card with Loading State */}
        <StatsCard
          icon={<HiOutlineUsers className="w-6 h-6" />}
          title="Loading Data"
          value={0}
          subtitle="Fetching data..."
          color="orange"
          isLoading={true}
        />

        {/* Card with Zero Trend */}
        <StatsCard
          icon={<HiOutlineChartBar className="w-6 h-6" />}
          title="Stable Metric"
          value={500}
          subtitle="No change"
          trend={{
            value: 0,
            label: "vs last month",
            isPositive: true
          }}
          color="indigo"
        />
      </div>

      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Usage Examples
        </h2>
        
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Basic Usage:</h3>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
{`<StatsCard
  icon={<HiOutlineUsers className="w-6 h-6" />}
  title="Total Users"
  value={1250}
  color="blue"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">With Trend:</h3>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
{`<StatsCard
  icon={<HiOutlineClipboard className="w-6 h-6" />}
  title="Total Leads"
  value={3420}
  subtitle="1,200 new this month"
  trend={{
    value: 15,
    label: "vs last month",
    isPositive: true
  }}
  color="purple"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Available Colors:</h3>
            <p className="mt-1">blue, green, purple, orange, red, indigo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsCardExample;
