// Updated ActiveFiltersBox component with mobile overflow handling
import React from "react";
import reloadIcon from "../../../public/reload.svg";
import Image from "next/image";

const ActiveFiltersBox = ({
  activeFilters = {},
  onFilterChange,
  onClearAllFilters,
  currentTab = "home",
  filterConfig = {},
  excludedKeys = [],
}) => {
  console.log("activeFilters", activeFilters);

  // Helper function to get the filter configuration for current tab
  const getCurrentTabFilterConfig = () => {
    try {
      return filterConfig[currentTab] || [];
    } catch (error) {
      console.warn("Error getting filter config:", error);
      return [];
    }
  };

  // Helper function to find filter configuration by name
  const findFilterConfig = (filterName) => {
    try {
      const tabFilters = getCurrentTabFilterConfig();
      return tabFilters.find((filter) => filter?.name === filterName) || null;
    } catch (error) {
      console.warn("Error finding filter config:", error);
      return null;
    }
  };

  // NEW: Helper function to check if date range filters exist and combine them
  const getDateRangeFilters = () => {
    const dateRanges = [];
    const processedKeys = new Set();

    // Define date range patterns
    const dateRangePatterns = [
      { from: 'order_date_from', to: 'order_date_to', displayName: 'Order Date' },
      { from: 'delivery_date_from', to: 'delivery_date_to', displayName: 'Delivery Date' },
      { from: 'event_date_from', to: 'event_date_to', displayName: 'Event Date' },
      { from: 'event_start_date', to: 'event_end_date', displayName: 'Event Date' },
      { from: 'transaction_date_from', to: 'transaction_date_to', displayName: 'Transaction Date' },
      { from: 'transaction_start_date', to: 'transaction_end_date', displayName: 'Transaction Date' },
    ];

    dateRangePatterns.forEach(({ from, to, displayName }) => {
      const fromValue = activeFilters[from];
      const toValue = activeFilters[to];

      if (fromValue && toValue) {
        dateRanges.push({
          key: `${from}_${to}`, // Combined key for identification
          displayName,
          fromValue,
          toValue,
          fromKey: from,
          toKey: to
        });
        
        // Mark these keys as processed so they don't appear separately
        processedKeys.add(from);
        processedKeys.add(to);
      }
    });

    return { dateRanges, processedKeys };
  };

  // Helper function to get label from options array
  const getLabelFromOptions = (options, value) => {
    try {
      if (!Array.isArray(options) || !value) return value;

      const option = options.find((opt) => {
        if (typeof opt === "object" && opt !== null) {
          return opt.value === value || opt.id === value || opt.key === value;
        }
        return opt === value;
      });

      if (option && typeof option === "object") {
        return option.label || option.name || option.text || value;
      }

      return option || value;
    } catch (error) {
      console.warn("Error getting label from options:", error);
      return value;
    }
  };

  // Helper function to format date values for display
  const formatDateForDisplay = (key, dateValue) => {
    try {
      if (!dateValue) return null;

      const filterConfigItem = findFilterConfig(key);
      const isSingleDateMode = filterConfigItem?.singleDateMode === true;
      const filterLabel = getFilterDisplayName(key);

      if (typeof dateValue === "object" && !Array.isArray(dateValue)) {
        const startDate = dateValue.startDate || dateValue.start_date;
        const endDate = dateValue.endDate || dateValue.end_date;

        if (startDate && endDate) {
          const formattedStart = formatDateString(startDate);
          const formattedEnd = formatDateString(endDate);

          if (isSingleDateMode || startDate === endDate) {
            return `${filterLabel}: ${formattedStart}`;
          }

          return `${filterLabel}: ${formattedStart} - ${formattedEnd}`;
        }

        if (startDate) {
          return `${filterLabel}: ${formatDateString(startDate)}`;
        }

        if (endDate) {
          return `${filterLabel}: ${formatDateString(endDate)}`;
        }
      }

      if (typeof dateValue === "string") {
        return `${filterLabel}: ${formatDateString(dateValue)}`;
      }

      return dateValue;
    } catch (error) {
      console.warn("Error formatting date for display:", error);
      return dateValue;
    }
  };

  // NEW: Helper function to format date range for display
  const formatDateRangeForDisplay = (dateRange) => {
    try {
      const { displayName, fromValue, toValue } = dateRange;
      
      if (fromValue && toValue) {
        return `${displayName}: ${fromValue} - ${toValue}`;
      }
      
      if (fromValue) {
        return `${displayName}: From ${fromValue}`;
      }
      
      if (toValue) {
        return `${displayName}: Until ${toValue}`;
      }
      
      return null;
    } catch (error) {
      console.warn("Error formatting date range for display:", error);
      return null;
    }
  };

  // Helper function to format individual date strings
  const formatDateString = (dateString) => {
    try {
      if (!dateString || typeof dateString !== "string") return dateString;

      if (dateString.includes("/")) {
        return dateString;
      }

      if (dateString.includes("-") && dateString.length === 10) {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
      }

      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }

      return dateString;
    } catch (error) {
      console.warn("Error formatting date string:", error);
      return dateString;
    }
  };

  // Helper function to get fallback labels for common filter types
  const getFallbackLabel = (key, value) => {
    try {
      const commonMappings = {
        vip: "VIP",
        standard: "Standard",
        premium: "Premium",
        general: "General",
        early_bird: "Early Bird",
        completed: "Completed",
        fulfilled: "Fulfilled",
        pending: "Pending",
        cancelled: "Cancelled",
        processing: "Processing",
        confirmed: "Confirmed",
        paid: "Paid",
        unpaid: "Unpaid",
        partial: "Partial",
        refunded: "Refunded",
        failed: "Failed",
        match: "Match",
        event: "Event",
        tournament: "Tournament",
        training: "Training",
        active: "Active",
        inactive: "Inactive",
        enabled: "Enabled",
        disabled: "Disabled",
        yes: "Yes",
        no: "No",
        true: "Yes",
        false: "No",
        none: "None",
      };

      const lowerValue = String(value).toLowerCase();
      if (commonMappings[lowerValue]) {
        return commonMappings[lowerValue];
      }

      if (typeof value === "string") {
        if (/^[a-zA-Z0-9_-]+$/.test(value) && value.length > 3) {
          return value
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
        }
      }

      return value;
    } catch (error) {
      console.warn("Error getting fallback label:", error);
      return value;
    }
  };

  // Helper function to get labels for array values
  const getLabelsForArray = (options, values) => {
    try {
      if (!Array.isArray(values) || !Array.isArray(options)) return values;

      return values
        .map((value) => {
          try {
            return getLabelFromOptions(options, value);
          } catch (error) {
            console.warn("Error mapping array value to label:", error);
            return value;
          }
        })
        .filter(Boolean);
    } catch (error) {
      console.warn("Error getting labels for array:", error);
      return values;
    }
  };

  // Enhanced helper function to format filter values for display with label mapping
  const formatFilterValue = (key, value) => {
    try {
      if (value === null || value === undefined) return null;

      const filterConfigItem = findFilterConfig(key);
      const options = filterConfigItem?.options || [];
      const filterLabel = getFilterDisplayName(key);

      if (
        key.toLowerCase().includes("date") ||
        key === "eventDate" ||
        key === "activityDate" ||
        key === "orderDate" ||
        key === "transactionDate"
      ) {
        return formatDateForDisplay(key, value);
      }

      switch (key) {
        case "team_members":
        case "team_member":
          try {
            if (Array.isArray(value)) {
              if (value.length === 0) return null;

              const labels = getLabelsForArray(options, value);

              if (labels.length === 1) return `${filterLabel}: ${labels[0]}`;
              if (labels.length <= 3)
                return `${filterLabel}: ${labels.join(", ")}`;
              return `${filterLabel}: ${labels.slice(0, 2).join(", ")} +${
                labels.length - 2
              } more`;
            }

            let label = getLabelFromOptions(options, value);
            if (label === value && options.length === 0) {
              label = getFallbackLabel(key, value);
            }
            return `${filterLabel}: ${label}`;
          } catch (error) {
            console.warn("Error formatting team members filter:", error);
            return value;
          }

        case "ticket_type":
        case "order_status":
        case "payment_status":
        case "ticket_status":
        case "activity_type":
        case "category":
        case "location":
        case "venue":
          try {
            if (Array.isArray(value)) {
              if (value.length === 0) return null;

              const labels = getLabelsForArray(options, value);

              if (labels.length === 1) return `${filterLabel}: ${labels[0]}`;
              if (labels.length <= 3)
                return `${filterLabel}: ${labels.join(", ")}`;
              return `${filterLabel}: ${labels.slice(0, 2).join(", ")} +${
                labels.length - 2
              } more`;
            }

            let label = getLabelFromOptions(options, value);
            if (label === value && options.length === 0) {
              label = getFallbackLabel(key, value);
            }
            return `${filterLabel}: ${label}`;
          } catch (error) {
            console.warn("Error formatting select filter:", error);
            return value;
          }

        case "searchMatch":
        case "keyword":
        case "search":
        case "query":
          try {
            if (typeof value === "string" && value.trim()) {
              return `${filterLabel}: "${value.trim()}"`;
            }
            return `${filterLabel}: ${value}`;
          } catch (error) {
            console.warn("Error formatting search filter:", error);
            return value;
          }

        default:
          try {
            if (options && options.length > 0) {
              if (Array.isArray(value)) {
                if (value.length === 0) return null;

                const labels = getLabelsForArray(options, value);

                if (labels.length === 1) return `${filterLabel}: ${labels[0]}`;
                if (labels.length <= 3)
                  return `${filterLabel}: ${labels.join(", ")}`;
                return `${filterLabel}: ${labels.slice(0, 2).join(", ")} +${
                  labels.length - 2
                } more`;
              }

              let label = getLabelFromOptions(options, value);
              return `${filterLabel}: ${label}`;
            }

            if (Array.isArray(value)) {
              if (value.length === 0) return null;

              const labels = value
                .map((v) => getFallbackLabel(key, v))
                .filter(Boolean);

              if (labels.length === 1) return `${filterLabel}: ${labels[0]}`;
              if (labels.length <= 3)
                return `${filterLabel}: ${labels.join(", ")}`;
              return `${filterLabel}: ${labels.slice(0, 2).join(", ")} +${
                labels.length - 2
              } more`;
            }

            const fallbackLabel = getFallbackLabel(key, value);
            return `${filterLabel}: ${fallbackLabel}`;
          } catch (error) {
            console.warn("Error formatting default filter:", error);
            return value;
          }
      }
    } catch (error) {
      console.warn("Error in formatFilterValue:", error);
      return value;
    }
  };

  // Helper function to get display name for filter keys
  const getFilterDisplayName = (key) => {
    try {
      const filterConfigItem = findFilterConfig(key);
      if (filterConfigItem && filterConfigItem.label) {
        return filterConfigItem.label;
      }

      const displayNames = {
        keyword: "Keyword",
        ticket_status: "Ticket Status",
        eventDate: "Event Date",
        activityDate: "Activity Date",
        orderDate: "Order Date",
        transactionDate: "Transaction Date",
        selectedActivity: "Search Activity",
        team_member: "Team Member",
        team_members: "Team Members",
        activity_type: "Activity Type",
        start_date: "Start Date",
        end_date: "End Date",
        category: "Category",
        location: "Location",
        venue: "Venue",
        ticket_type: "Ticket Type",
        order_status: "Order Status",
        payment_status: "Payment Status",
        searchMatch: "Search Match",
        query: "Search",
        order_date_from: "Order Date From",
        order_date_to: "Order Date To",
        transaction_start_date: "Transaction Start Date",
        transaction_end_date: "Transaction End Date",
        event_start_date: "Event Start Date",
        event_end_date: "Event End Date",
      };

      return (
        displayNames[key] ||
        key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
      );
    } catch (error) {
      console.warn("Error getting filter display name:", error);
      return key || "Filter";
    }
  };

  // UPDATED: Get active filter entries with excludedKeys support and date range handling
  const getActiveFilterEntries = () => {
    try {
      if (!activeFilters || typeof activeFilters !== "object") return [];

      const { dateRanges, processedKeys } = getDateRangeFilters();
      
      // Get regular filter entries (excluding processed date range keys)
      const regularEntries = Object.entries(activeFilters).filter(([key, value]) => {
        try {
          // Skip if this key should be excluded
          if (excludedKeys.includes(key)) return false;
          
          // Skip if this key was already processed as part of a date range
          if (processedKeys.has(key)) return false;
          
          if (value === null || value === undefined || value === "")
            return false;
          if (value === "none") return false;
          if (Array.isArray(value) && value.length === 0) return false;
          if (
            typeof value === "object" &&
            !Array.isArray(value) &&
            Object.keys(value).length === 0
          )
            return false;

          if (typeof value === "object" && !Array.isArray(value)) {
            const startDate = value.startDate || value.start_date;
            const endDate = value.endDate || value.end_date;

            if (
              (startDate === "" || !startDate) &&
              (endDate === "" || !endDate)
            ) {
              return false;
            }
          }

          return true;
        } catch (error) {
          console.warn("Error filtering active filter entry:", error);
          return false;
        }
      });

      // Combine regular entries with date range entries
      const combinedEntries = [
        ...regularEntries,
        ...dateRanges.map(dateRange => [dateRange.key, dateRange])
      ];

      return combinedEntries;
    } catch (error) {
      console.warn("Error getting active filter entries:", error);
      return [];
    }
  };

  // Handle clearing individual filter
  const handleClearFilter = (filterKey) => {
    try {
      if (onFilterChange && filterKey) {
        const updatedFilters = { ...activeFilters };

        // Check if this is a date range filter (combined key)
        const { dateRanges } = getDateRangeFilters();
        const dateRange = dateRanges.find(dr => dr.key === filterKey);
        console.log(dateRange,'dateRangedateRange')
        if (dateRange) {
          // This is a combined date range key, clear both from and to values
          updatedFilters[dateRange.fromKey] = '';
          updatedFilters[dateRange.toKey] = '';
          
          // Call onFilterChange for both keys to ensure proper state update
          onFilterChange(dateRange.fromKey, '', updatedFilters, currentTab);
          // Small timeout to ensure the first call completes
          setTimeout(() => {
            onFilterChange(dateRange.toKey, '', updatedFilters, currentTab);
          }, 0);
        } else {
          // Regular filter clearing
          if (Array.isArray(updatedFilters[filterKey])) {
            updatedFilters[filterKey] = [];
          } else if (typeof updatedFilters[filterKey] === "object") {
            updatedFilters[filterKey] = {};
          } else {
            updatedFilters[filterKey] = "";
          }

          onFilterChange(
            filterKey,
            updatedFilters[filterKey],
            updatedFilters,
            currentTab
          );
        }
      }
    } catch (error) {
      console.error("Error clearing individual filter:", error);
    }
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    try {
      if (onClearAllFilters) {
        onClearAllFilters();
      } else if (onFilterChange) {
        const clearedFilters = {};
        Object.keys(activeFilters || {}).forEach((key) => {
          try {
            if (Array.isArray(activeFilters[key])) {
              clearedFilters[key] = [];
            } else if (typeof activeFilters[key] === "object") {
              clearedFilters[key] = {};
            } else {
              clearedFilters[key] = "";
            }
          } catch (error) {
            console.warn("Error clearing filter:", key, error);
            clearedFilters[key] = "";
          }
        });

        onFilterChange("clearAll", {}, clearedFilters, currentTab);
      }
    } catch (error) {
      console.error("Error clearing all filters:", error);
    }
  };

  const activeFilterEntries = getActiveFilterEntries();

  // Don't render if no active filters
  if (activeFilterEntries.length === 0) {
    return null;
  }

  return (
    <div className="rounded px-3 py-2">
      <div className="flex items-center gap-3">
        {/* Fixed left section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap transition-colors cursor-default">
            Active Filters
          </span>
          <span className="text-gray-400">|</span>
          <button
            onClick={handleClearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium underline cursor-pointer flex-shrink-0"
            title="Clear all filters"
          >
            <Image src={reloadIcon} width={30} height={30} alt="image-logo" />
          </button>
        </div>
        
        {/* Scrollable filters section */}
        <div className="flex gap-3 items-center overflow-x-auto scrollbar-hide min-w-0 flex-1">
          <div className="flex gap-3 items-center whitespace-nowrap">
            {activeFilterEntries.map(([key, value]) => {
              try {
                let formattedValue;
                
                // Check if this is a date range filter
                if (typeof value === 'object' && value.displayName && value.fromValue && value.toValue) {
                  formattedValue = formatDateRangeForDisplay(value);
                } else {
                  formattedValue = formatFilterValue(key, value);
                }
                
                if (formattedValue === null || formattedValue === undefined)
                  return null;

                return (
                  <div
                    key={key}
                    className="inline-flex items-center gap-1.5 bg-white border border-[#DADBE5] px-[8px] py-[6px] rounded-sm text-sm flex-shrink-0"
                  >
                    <span className="text-gray-700 text-xs whitespace-nowrap">
                      {formattedValue}
                    </span>
                    <button
                      onClick={() => handleClearFilter(key)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer flex items-center justify-center flex-shrink-0"
                      title={`Remove ${typeof value === 'object' && value.displayName ? value.displayName : getFilterDisplayName(key)} filter`}
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
              } catch (error) {
                console.warn("Error rendering filter pill:", key, error);
                return null;
              }
            })}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ActiveFiltersBox;