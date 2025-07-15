import React from "react";

const ActiveFiltersBox = ({
  activeFilters = {},
  onFilterChange,
  onClearAllFilters,
  currentTab = "home",
}) => {
  // Helper function to format filter values for display
  const formatFilterValue = (key, value) => {
    switch (key) {
      case "eventDate":
      case "activityDate":
        if (value && value.startDate && value.endDate) {
          return `${value.startDate} to ${value.endDate}`;
        }
        if (value && value.start_date && value.end_date) {
          return `${value.start_date} to ${value.end_date}`;
        }
        return value;
      default:
        return value;
    }
  };

  // Helper function to get display name for filter keys
  const getFilterDisplayName = (key) => {
    const displayNames = {
      keyword: "Keyword",
      ticket_status: "Ticket Status",
      eventDate: "Event Date",
      activityDate: "Activity Date",
      selectedActivity: "Search Activity",
      team_member: "Team Member",
      activity_type: "Activity Type",
      start_date: "Start Date",
      end_date: "End Date",
      category: "Category",
      location: "Location",
    };
    return (
      displayNames[key] ||
      key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    );
  };

  // Get active filter entries (exclude empty/null values)
  const activeFilterEntries = Object.entries(activeFilters).filter(
    ([key, value]) => {
      if (value === null || value === undefined || value === "") return false;
      if (value === "none") return false; // Exclude "none" values from selects
      if (typeof value === "object" && Object.keys(value).length === 0)
        return false;
      if (
        typeof value === "object" &&
        (value.startDate === "" || !value.startDate) &&
        (value.endDate === "" || !value.endDate) &&
        (value.start_date === "" || !value.start_date) &&
        (value.end_date === "" || !value.end_date)
      )
        return false;
      return true;
    }
  );

  // Handle clearing individual filter
  const handleClearFilter = (filterKey) => {
    if (onFilterChange) {
      // Create updated filters object with the specific filter removed/cleared
      const updatedFilters = { ...activeFilters };

      // Set the filter to empty/null based on its type
      if (typeof updatedFilters[filterKey] === "object") {
        updatedFilters[filterKey] = {};
      } else {
        updatedFilters[filterKey] = "";
      }

      // Call the onFilterChange callback
      onFilterChange(
        filterKey,
        updatedFilters[filterKey],
        updatedFilters,
        currentTab
      );
    }
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    if (onClearAllFilters) {
      onClearAllFilters();
    } else if (onFilterChange) {
      // Fallback: clear each filter individually
      const clearedFilters = {};
      Object.keys(activeFilters).forEach((key) => {
        if (typeof activeFilters[key] === "object") {
          clearedFilters[key] = {};
        } else {
          clearedFilters[key] = "";
        }
      });

      // Call onFilterChange with all cleared filters
      onFilterChange("clearAll", {}, clearedFilters, currentTab);
    }
  };

  // Don't render if no active filters
  if (activeFilterEntries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
        <button
          onClick={handleClearAllFilters}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Clear all filters
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {activeFilterEntries.map(([key, value]) => (
          <div
            key={key}
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
          >
            <span className="font-medium">{getFilterDisplayName(key)}:</span>
            <span>{formatFilterValue(key, value)}</span>
            <button
              onClick={() => handleClearFilter(key)}
              className="text-gray-500 hover:text-gray-700 ml-1 cursor-pointer"
              title={`Clear ${getFilterDisplayName(key)} filter`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveFiltersBox;
