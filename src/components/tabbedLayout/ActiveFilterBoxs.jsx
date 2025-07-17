import React from "react";

const ActiveFiltersBox = ({
  activeFilters = {},
  onFilterChange,
  onClearAllFilters,
  currentTab = "home",
}) => {
  console.log("activeFilters", activeFilters);
  
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
      case "team_members":
      case "team_member":
        // Handle array values - show count and first few items
        if (Array.isArray(value)) {
          if (value.length === 0) return null;
          if (value.length === 1) return `Team Member: ${value[0]}`;
          if (value.length <= 3) return `Team Members: ${value.join(', ')}`;
          return `Team Members: ${value.slice(0, 2).join(', ')} +${value.length - 2} more`;
        }
        return value;
      default:
        // Handle any other array values
        if (Array.isArray(value)) {
          if (value.length === 0) return null;
          if (value.length === 1) return value[0];
          if (value.length <= 3) return value.join(', ');
          return `${value.slice(0, 2).join(', ')} +${value.length - 2} more`;
        }
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
      team_members: "Team Members",
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
      if (Array.isArray(value) && value.length === 0) return false; // Exclude empty arrays
      if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0)
        return false;
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
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
      if (Array.isArray(updatedFilters[filterKey])) {
        updatedFilters[filterKey] = [];
      } else if (typeof updatedFilters[filterKey] === "object") {
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
        if (Array.isArray(activeFilters[key])) {
          clearedFilters[key] = [];
        } else if (typeof activeFilters[key] === "object") {
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
    <div className="rounded px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap transition-colors cursor-default">
            Active Filters
          </span>
          <span className="text-gray-400">|</span>
          {activeFilterEntries.map(([key, value]) => {
            const formattedValue = formatFilterValue(key, value);
            if (formattedValue === null) return null;
            
            return (
              <div
                key={key}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-300 px-2 py-1 rounded-xl text-sm"
              >
                <span className="text-gray-700 text-xs">
                  {formattedValue}
                </span>
                <button
                  onClick={() => handleClearFilter(key)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer flex items-center justify-center"
                  title={`Remove ${getFilterDisplayName(key)} filter`}
                >
                  <svg
                    className="w-3 h-3"
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
            );
          })}
        </div>

        <button
          onClick={handleClearAllFilters}
          className="text-sm text-gray-600 hover:text-gray-800 font-medium underline"
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

export default ActiveFiltersBox;