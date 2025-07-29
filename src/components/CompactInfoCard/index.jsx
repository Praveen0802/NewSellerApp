import React from "react";
import { Info } from "lucide-react";

const CompactInfoCard = ({
  title = "Title",
  progress = 20,
  segments = 5,
  progressColor = "bg-purple-600",
  tooltipText = "Click to learn more",
  className = "",
  handleClick = () => {},
}) => {
  const segmentStep = 100 / segments;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Title and Info */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">{title}</span>
        <div className="group relative">
          <button
            onClick={handleClick}
            className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center cursor-help hover:bg-gray-500 transition-colors"
            aria-label="More info"
          >
            <Info className="w-2.5 h-2.5 text-white" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-1/2 -translate-x-1/2 top-6 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
            {tooltipText}
          </div>
        </div>
      </div>

      {/* Progress Bar with Tooltip */}
      <div className="group relative w-fit">
        <div
          className="flex items-center gap-0.5 border border-gray-300 rounded p-0.5 hover:border-indigo-500 transition-colors cursor-pointer"
          onClick={handleClick}
        >
          {Array.from({ length: segments }).map((_, index) => {
            const isFilled = progress >= (index + 1) * segmentStep;
            const isFirst = index === 0;
            const isLast = index === segments - 1;
            return (
              <div
                key={index}
                className={`h-1.5 ${isFirst ? "w-16" : "w-4"} ${
                  isFirst ? "rounded-l" : ""
                } ${isLast ? "rounded-r" : ""} ${
                  isFilled ? progressColor : "bg-gray-300"
                }`}
              ></div>
            );
          })}
        </div>
        {/* Tooltip on Progress Bar */}
        <div className="absolute left-1/2 -translate-x-1/2 top-6 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
          {tooltipText}
        </div>
      </div>
    </div>
  );
};

export default CompactInfoCard;
