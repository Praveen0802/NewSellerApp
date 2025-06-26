import React, { useState } from "react";

// Default categories data
const defaultCategories = [
  { id: "away", label: "Away", color: "bg-gray-400" },
  {
    id: "longside-central-lower",
    label: "Longside Central Lower",
    color: "bg-blue-600",
  },
  {
    id: "longside-lower-tier",
    label: "Longside Lower Tier",
    color: "bg-sky-400",
  },
  {
    id: "longside-middle-tier",
    label: "Longside Middle Tier",
    color: "bg-purple-600",
  },
  {
    id: "longside-upper-tier",
    label: "Longside Upper Tier",
    color: "bg-red-500",
  },
  {
    id: "shortside-lower-tier",
    label: "Shortside Lower Tier",
    color: "bg-orange-400",
  },
  {
    id: "shortside-upper-tier",
    label: "Shortside Upper Tier",
    color: "bg-green-500",
  },
  { id: "vip-hospitality", label: "VIP & Hospitality", color: "bg-yellow-500" },
];

const TicketCategories = ({
  categories = defaultCategories,
  selectedCategory,
  onCategorySelect,
  title = "Ticket Categories",
  layout = "grid",
  className = "",
}) => {
  const [internalSelected, setInternalSelected] = useState("");

  // Use controlled or uncontrolled state
  const currentSelected =
    selectedCategory !== undefined ? selectedCategory : internalSelected;

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === undefined) {
      setInternalSelected(categoryId);
    }
    onCategorySelect?.(categoryId);
  };

  const layoutClasses =
    layout === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
      : "flex flex-col gap-3";

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 bg-white ${className}`}>
      <h2 className="text-xl font-bold text-gray-800 mb-8">{title}</h2>

      <div className={layoutClasses} role="radiogroup" aria-label={title}>
        {categories.map((category) => {
          const isSelected = currentSelected === category.id;

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex items-center gap-4 px-2 py-1 cursor-pointer rounded-lg border-2 transition-all duration-200
                hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isSelected
                    ? " bg-blue-50 shadow-md transform "
                    : "border-gray-200 bg-white"
                }
              `}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Select ${category.label} ticket category`}
            >
              {/* Color indicator circle */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full ${category.color} shadow-sm`}
                />
              </div>

              {/* Category label */}
              <span
                className={`text-sm font-medium text-left flex-grow ${
                  isSelected ? "text-blue-900" : "text-gray-700"
                }`}
              >
                {category.label}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TicketCategories;
