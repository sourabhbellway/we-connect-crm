import React from "react";

interface ColorPaletteProps {
  colors?: string[];
  value?: string;
  onChange?: (color: string) => void;
}

const defaultColors = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
  "#111827", // gray-900
  "#64748b", // slate-500
];

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors = defaultColors, value, onChange }) => {
  return (
    <div className="grid grid-cols-9 gap-2">
      {colors.map((c) => {
        const selected = value?.toLowerCase() === c.toLowerCase();
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange && onChange(c)}
            className={`h-6 w-6 rounded-md border ${
              selected ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-300" : ""
            }`}
            style={{ backgroundColor: c, borderColor: "#e5e7eb" }}
            title={c}
          />
        );
      })}
    </div>
  );
};

export default ColorPalette;


