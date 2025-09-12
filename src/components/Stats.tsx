interface StatsProps {
  icon: React.ReactNode;
  count: number | string;
  title: string;
  activity: string;
  colorType?: "normal" | "red" | "green" | "sky"; // Changed from isPositive to colorType
}

function Stats({
  icon,
  count,
  title,
  activity,
  colorType = "normal", // Default to normal/white
}: StatsProps) {
  // Determine the color class based on the colorType
  const getActivityColorClass = (type: string) => {
    switch (type) {
      case "red":
        return "text-red-400 dark:text-red-300";
      case "green":
        return "text-green-400 dark:text-green-300";
      case "sky":
        return "text-sky-400 dark:text-sky-300";
      case "normal":
      default:
        return "text-white dark:text-gray-200";
    }
  };

  const activityColorClass = getActivityColorClass(colorType);

  return (
    <div className="bg-white/10 dark:bg-gray-800 rounded-lg shadow-md p-3 px-4 sm:px-6 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="text-lg sm:text-2xl text-white bg-white/10 p-2 sm:p-4 rounded-full">
            {icon}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              {count}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-100">{title}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 sm:mt-4">
        <p
          className={`text-xs ${activityColorClass} bg-white/10 p-1 px-2 sm:px-4 rounded-full w-fit`}
        >
          {activity}
        </p>
      </div>
    </div>
  );
}

export default Stats;
