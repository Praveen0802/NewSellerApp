import React from "react";

const GTVLevelCard = ({ data }) => {
  // Dynamic color mapping based on level
  const getLevelColor = (level) => {
    const colorMap = {
      "Level 1": "bg-gray-300",
      "Level 2": "bg-gray-300",
      "Level 3": "bg-green-400",
      "Level 4": "bg-blue-500",
    };
    return colorMap[level] || "bg-gray-300";
  };

  // Extract level number from level string
  const getCurrentLevelNumber = (levelString) => {
    const match = levelString.match(/Level (\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  const currentLevelNumber = getCurrentLevelNumber(data.level);
  const currentLevelColor = getLevelColor(data.level);
  console.log(currentLevelNumber, "currentLevelNumbercurrentLevelNumber");
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-3 py-4 max-w-md mx-auto ">
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex gap-1 relative">
          {[
            { level: 3, width: "w-18", label: "3" },
            { level: 2, width: "w-18", label: "2" },
            { level: 1, width: "w-18", label: "1" },
            { level: 0, width: "w-8", label: "S" },
          ].map((step) => (
            <div key={step.level} className="relative">
              <div
                className={`${
                  step.width
                } h-6 rounded-md flex items-center justify-center text-xs font-medium ${
                  step.level <= currentLevelNumber
                    ? step.level === currentLevelNumber
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {step.label}
              </div>
              {/* Arrow indicator for current level */}
              {step.level === currentLevelNumber && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 rotate-180">
                  <div className="w-2 h-2 border-l-3 border-r-3 border-b-3 border-transparent border-b-gray-700"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-900">
              GTV {data.quarter}
            </h2>
            <p className="text-gray-500 text-xs">{data.days_left} days left</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">{data.gtv}</div>
          </div>
        </div>

        <div className="text-xs text-gray-600">
          You require{" "}
          <span className="font-semibold">{data.required_to_maintain}</span> to
          maintain {data.level}
        </div>
      </div>
    </div>
  );
};

export default GTVLevelCard;
