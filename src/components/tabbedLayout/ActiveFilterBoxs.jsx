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
    <div className="bg-white border border-gray-200 rounded p-1.5 mb-2 shadow-sm">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap transition-colors cursor-default">
            Active Filters
          </span>
          <span className="text-gray-400">|</span>

          {activeFilterEntries.map(([key, value]) => (
            <div
              key={key}
              className="inline-flex items-center gap-1 bg-white border border-gray-300 px-2 py-0.5 rounded-full text-xs"
            >
              <span className="text-gray-700">
                {formatFilterValue(key, value)}
              </span>
              <button
                onClick={() => handleClearFilter(key)}
                className="text-red-500 hover:text-red-700 rounded-full p-0.5 cursor-pointer transition-colors"
                title={`Clear ${getFilterDisplayName(key)} filter`}
              >
                <svg
                  className="w-2.5 h-2.5"
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

        <button
          onClick={handleClearAllFilters}
          className="text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 font-medium cursor-pointer whitespace-nowrap px-2 py-0.5 rounded border border-purple-200 hover:border-purple-300 transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

export default ActiveFiltersBox;
