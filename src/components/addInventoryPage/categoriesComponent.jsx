import React, { useMemo } from "react";

// Helper function to convert rgba to Tailwind-compatible style
const rgbaToStyle = (rgbaString) => {
  return {
    backgroundColor: rgbaString,
  };
};

const TicketCategories = ({
  blockData = null,
  blockDataColor = null,
  title = "Ticket Categories",
  layout = "grid",
  className = "",
}) => {
  // Transform blockData and blockDataColor into categories format
  const dynamicCategories = useMemo(() => {
    if (!blockData || !blockDataColor) {
      return [];
    }

    return Object.keys(blockData).map((key) => ({
      id: key,
      label: blockData[key],
      color: null, // We'll use inline styles instead
      rgbaColor: blockDataColor[key],
    }));
  }, [blockData, blockDataColor]);

  const layoutClasses =
    layout === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
      : "flex flex-col gap-3";

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 bg-white ${className}`}>
      <h2 className="text-xl font-bold text-gray-800 mb-8">{title}</h2>

      <div className={layoutClasses}>
        {dynamicCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-4 px-2 py-1 rounded-lg border-2 border-gray-200 bg-white"
          >
            {/* Color indicator circle */}
            <div className="relative flex-shrink-0">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={
                  category.rgbaColor
                    ? rgbaToStyle(category.rgbaColor)
                    : undefined
                }
              />
            </div>

            {/* Category label */}
            <span className="text-sm font-medium text-gray-700 text-left flex-grow">
              {category.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketCategories;